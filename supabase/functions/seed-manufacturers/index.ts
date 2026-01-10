import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManufacturerData {
  labelerName: string;
  labelerCode: string;
  ndcCodes: string[];
  dosageForm: string | null;
  strength: string | null;
  productCount: number;
}

interface SeedResult {
  drugName: string;
  manufacturersAdded: number;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action = 'seed', drugId, batchSize = 10, offset = 0 } = await req.json();

    // Action: list - Get all drugs with their variant counts
    if (action === 'list') {
      const { data: drugs, error } = await supabase
        .from('rx_meds')
        .select(`
          id,
          generic_name,
          rx_variants(id, manufacturer, data_source)
        `)
        .order('generic_name');

      if (error) throw error;

      const summary = drugs?.map(drug => ({
        id: drug.id,
        genericName: drug.generic_name,
        totalVariants: drug.rx_variants?.length || 0,
        fdaVariants: drug.rx_variants?.filter((v: any) => v.data_source === 'openfda').length || 0,
        manualVariants: drug.rx_variants?.filter((v: any) => v.data_source === 'manual').length || 0,
      }));

      return new Response(
        JSON.stringify({ drugs: summary, total: summary?.length || 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: seed-one - Seed a single drug
    if (action === 'seed-one' && drugId) {
      const result = await seedDrug(supabase, supabaseUrl, drugId);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: seed-batch - Seed a batch of drugs
    if (action === 'seed-batch') {
      // Get drugs that haven't been seeded yet (only have manual variants)
      const { data: drugs, error } = await supabase
        .from('rx_meds')
        .select('id, generic_name')
        .order('generic_name')
        .range(offset, offset + batchSize - 1);

      if (error) throw error;

      if (!drugs || drugs.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No more drugs to seed', completed: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const results: SeedResult[] = [];
      
      for (const drug of drugs) {
        // Check if already has FDA variants
        const { data: existingVariants } = await supabase
          .from('rx_variants')
          .select('id')
          .eq('rx_med_id', drug.id)
          .eq('data_source', 'openfda')
          .limit(1);

        if (existingVariants && existingVariants.length > 0) {
          console.log(`Skipping ${drug.generic_name} - already has FDA data`);
          results.push({
            drugName: drug.generic_name,
            manufacturersAdded: 0,
            error: 'Already seeded'
          });
          continue;
        }

        // Add delay between drugs to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const result = await seedDrug(supabase, supabaseUrl, drug.id);
        results.push(result);
      }

      return new Response(
        JSON.stringify({ 
          results,
          nextOffset: offset + batchSize,
          processed: results.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default: return usage info
    return new Response(
      JSON.stringify({ 
        usage: {
          'list': 'Get all drugs with variant counts',
          'seed-one': 'Seed a single drug (requires drugId)',
          'seed-batch': 'Seed a batch of drugs (optional: batchSize, offset)'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in seed-manufacturers:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function seedDrug(
  supabase: any, 
  supabaseUrl: string,
  drugId: string
): Promise<SeedResult> {
  try {
    // Get the drug info
    const { data: drug, error: drugError } = await supabase
      .from('rx_meds')
      .select('id, generic_name, dosage_forms')
      .eq('id', drugId)
      .single();

    if (drugError || !drug) {
      return { drugName: drugId, manufacturersAdded: 0, error: 'Drug not found' };
    }

    console.log(`Seeding manufacturers for: ${drug.generic_name}`);

    // Call the fetch-drug-manufacturers function
    const fetchUrl = `${supabaseUrl}/functions/v1/fetch-drug-manufacturers`;
    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({ genericName: drug.generic_name, limit: 10 })
    });

    const manufacturerData = await response.json();

    if (!manufacturerData.manufacturers || manufacturerData.manufacturers.length === 0) {
      console.log(`No manufacturers found for ${drug.generic_name}`);
      return { drugName: drug.generic_name, manufacturersAdded: 0, error: 'No FDA data found' };
    }

    console.log(`Found ${manufacturerData.manufacturers.length} manufacturers for ${drug.generic_name}`);

    let added = 0;

    for (const mfr of manufacturerData.manufacturers as ManufacturerData[]) {
      try {
        // Check if this manufacturer variant already exists
        const { data: existing } = await supabase
          .from('rx_variants')
          .select('id')
          .eq('rx_med_id', drug.id)
          .eq('manufacturer', mfr.labelerName)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`Variant already exists for ${mfr.labelerName}`);
          continue;
        }

        // Insert the variant
        const { data: variant, error: variantError } = await supabase
          .from('rx_variants')
          .insert({
            rx_med_id: drug.id,
            manufacturer: mfr.labelerName,
            labeler_code: mfr.labelerCode,
            dosage_form: mfr.dosageForm || drug.dosage_forms?.[0] || null,
            strength_text: mfr.strength,
            ndc_list: mfr.ndcCodes,
            data_source: 'openfda',
            notes: `FDA data: ${mfr.productCount} products listed`
          })
          .select('id')
          .single();

        if (variantError) {
          console.error(`Error inserting variant for ${mfr.labelerName}:`, variantError);
          continue;
        }

        // Create initial verdict for this variant
        const { error: verdictError } = await supabase
          .from('rx_verdicts')
          .insert({
            variant_id: variant.id,
            status: 'needs_verification',
            confidence: 0,
            summary_reason: 'Awaiting ingredient analysis from DailyMed'
          });

        if (verdictError) {
          console.error(`Error inserting verdict for ${mfr.labelerName}:`, verdictError);
        }

        added++;
        console.log(`Added variant: ${mfr.labelerName} (${mfr.ndcCodes.length} NDCs)`);

      } catch (err) {
        console.error(`Error processing manufacturer ${mfr.labelerName}:`, err);
      }
    }

    return { drugName: drug.generic_name, manufacturersAdded: added };

  } catch (error: unknown) {
    console.error(`Error seeding drug ${drugId}:`, error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { drugName: drugId, manufacturersAdded: 0, error: message };
  }
}
