import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManufacturerData {
  labelerName: string;
  labelerCode: string;
  brandName?: string;
  isBrand: boolean;
  marketingCategory: string;
  ndcCodes: string[];
  dosageForm: string | null;
  strength: string | null;
  productCount: number;
}

interface InactiveIngredient {
  name: string;
  unii?: string;
}

interface SPLParseResult {
  success: boolean;
  setId?: string;
  inactiveIngredients: InactiveIngredient[];
  error?: string;
}

interface SeedResult {
  drugName: string;
  manufacturersAdded: number;
  ingredientsLinked: number;
  error?: string;
}

// DailyMed API functions (inline to avoid import issues)
const DAILYMED_BASE = "https://dailymed.nlm.nih.gov/dailymed/services/v2";

async function fetchSPLByNDC(ndc: string): Promise<{ setId: string; splUrl: string } | null> {
  const cleanedNdc = ndc.replace(/[^0-9]/g, "");
  
  const ndcVariants = [ndc, cleanedNdc];
  
  if (cleanedNdc.length === 10) {
    ndcVariants.push(`${cleanedNdc.slice(0, 4)}-${cleanedNdc.slice(4, 8)}-${cleanedNdc.slice(8)}`);
    ndcVariants.push(`${cleanedNdc.slice(0, 5)}-${cleanedNdc.slice(5, 8)}-${cleanedNdc.slice(8)}`);
    ndcVariants.push(`${cleanedNdc.slice(0, 5)}-${cleanedNdc.slice(5, 9)}-${cleanedNdc.slice(9)}`);
  }
  if (cleanedNdc.length === 11) {
    ndcVariants.push(`${cleanedNdc.slice(0, 5)}-${cleanedNdc.slice(5, 9)}-${cleanedNdc.slice(9)}`);
  }

  for (const variant of ndcVariants) {
    try {
      const url = `${DAILYMED_BASE}/ndcs.json?ndc=${encodeURIComponent(variant)}`;
      const response = await fetch(url);
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const setId = data.data[0].setid;
        return {
          setId,
          splUrl: `${DAILYMED_BASE}/spls/${setId}.xml`,
        };
      }
    } catch (error) {
      console.error(`Error querying DailyMed for variant ${variant}:`, error);
    }
  }
  
  return null;
}

function parseSPLXML(xmlText: string): InactiveIngredient[] {
  const ingredients: InactiveIngredient[] = [];
  
  // Match inactive ingredient components with IACT classCode
  const ingredientMatches = xmlText.matchAll(
    /<ingredient[^>]*classCode\s*=\s*["']IACT["'][^>]*>[\s\S]*?<ingredientSubstance>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?(?:<code[^>]*code\s*=\s*["']([A-Z0-9]+)["'][^>]*\/>)?[\s\S]*?<\/ingredientSubstance>[\s\S]*?<\/ingredient>/gi
  );
  
  for (const match of ingredientMatches) {
    const name = match[1]?.trim();
    const unii = match[2];
    
    if (name && !ingredients.some(i => i.name.toLowerCase() === name.toLowerCase())) {
      ingredients.push({ name, unii: unii || undefined });
    }
  }
  
  // Fallback: simpler regex
  if (ingredients.length === 0) {
    const simpleMatches = xmlText.matchAll(
      /classCode\s*=\s*["']IACT["'][\s\S]*?<name>([^<]+)<\/name>/gi
    );
    
    for (const match of simpleMatches) {
      const name = match[1]?.trim();
      if (name && !ingredients.some(i => i.name.toLowerCase() === name.toLowerCase())) {
        ingredients.push({ name });
      }
    }
  }
  
  return ingredients;
}

async function fetchInactiveIngredients(ndcCodes: string[]): Promise<SPLParseResult> {
  // Try each NDC until we find one with SPL data
  for (const ndc of ndcCodes.slice(0, 5)) { // Limit to first 5 NDCs to avoid rate limits
    try {
      const splRef = await fetchSPLByNDC(ndc);
      
      if (!splRef) continue;
      
      console.log(`Found SPL for NDC ${ndc}: ${splRef.setId}`);
      
      const splResponse = await fetch(splRef.splUrl);
      if (!splResponse.ok) continue;
      
      const splXml = await splResponse.text();
      const inactiveIngredients = parseSPLXML(splXml);
      
      if (inactiveIngredients.length > 0) {
        console.log(`Parsed ${inactiveIngredients.length} inactive ingredients`);
        return {
          success: true,
          setId: splRef.setId,
          inactiveIngredients,
        };
      }
    } catch (error) {
      console.error(`Error fetching SPL for NDC ${ndc}:`, error);
    }
    
    // Small delay between NDC lookups
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return {
    success: false,
    inactiveIngredients: [],
    error: 'No SPL data found for any NDC',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // ============ AUTHENTICATION CHECK ============
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Unauthorized: No auth header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token for auth verification
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.log('Unauthorized: Invalid token', claimsError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user: ${userId}`);

    // ============ ADMIN AUTHORIZATION CHECK ============
    // Use service role client to check admin status
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (roleError || !roles || roles.length === 0) {
      console.log(`Forbidden: User ${userId} is not an admin`);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin verified: ${userId}`);
    // ============ END AUTH CHECKS ============

    const { action = 'seed', drugId, batchSize = 10, offset = 0, includeIngredients = true } = await req.json();

    // Action: list - Get all drugs with their variant counts
    if (action === 'list') {
      const { data: drugs, error } = await supabase
        .from('rx_meds')
        .select(`
          id,
          generic_name,
          rx_variants(id, manufacturer, data_source, spl_set_id)
        `)
        .order('generic_name');

      if (error) throw error;

      const summary = drugs?.map(drug => ({
        id: drug.id,
        genericName: drug.generic_name,
        totalVariants: drug.rx_variants?.length || 0,
        fdaVariants: drug.rx_variants?.filter((v: any) => v.data_source === 'openfda').length || 0,
        withIngredients: drug.rx_variants?.filter((v: any) => v.spl_set_id).length || 0,
        manualVariants: drug.rx_variants?.filter((v: any) => v.data_source === 'manual').length || 0,
      }));

      return new Response(
        JSON.stringify({ drugs: summary, total: summary?.length || 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: seed-one - Seed a single drug
    if (action === 'seed-one' && drugId) {
      const result = await seedDrug(supabase, supabaseUrl, drugId, includeIngredients, authHeader);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: seed-batch - Seed a batch of drugs
    if (action === 'seed-batch') {
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
        const { data: existingVariants } = await supabase
          .from('rx_variants')
          .select('id')
          .eq('rx_med_id', drug.id)
          .eq('data_source', 'openfda')
          .limit(1);

        if (existingVariants && existingVariants.length > 0) {
          results.push({
            drugName: drug.generic_name,
            manufacturersAdded: 0,
            ingredientsLinked: 0,
            error: 'Already seeded'
          });
          continue;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        
        const result = await seedDrug(supabase, supabaseUrl, drug.id, includeIngredients, authHeader);
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

    // Action: fetch-ingredients - Fetch ingredients for existing variants without SPL data
    if (action === 'fetch-ingredients') {
      const { data: variants, error } = await supabase
        .from('rx_variants')
        .select('id, manufacturer, ndc_list, rx_med_id')
        .is('spl_set_id', null)
        .eq('data_source', 'openfda')
        .limit(batchSize);

      if (error) throw error;

      const results = [];
      for (const variant of variants || []) {
        if (!variant.ndc_list || variant.ndc_list.length === 0) continue;

        await new Promise(resolve => setTimeout(resolve, 300));

        const splResult = await fetchInactiveIngredients(variant.ndc_list);
        
        if (splResult.success && splResult.inactiveIngredients.length > 0) {
          const linkedCount = await linkIngredientsToVariant(
            supabase, 
            variant.id, 
            splResult.inactiveIngredients,
            splResult.setId
          );
          
          results.push({
            variantId: variant.id,
            manufacturer: variant.manufacturer,
            ingredientsLinked: linkedCount,
            splSetId: splResult.setId,
          });
        } else {
          results.push({
            variantId: variant.id,
            manufacturer: variant.manufacturer,
            ingredientsLinked: 0,
            error: splResult.error,
          });
        }
      }

      return new Response(
        JSON.stringify({ results, processed: results.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        usage: {
          'list': 'Get all drugs with variant counts',
          'seed-one': 'Seed a single drug (requires drugId, optional includeIngredients)',
          'seed-batch': 'Seed a batch of drugs (optional: batchSize, offset, includeIngredients)',
          'fetch-ingredients': 'Fetch ingredients for variants missing SPL data (optional: batchSize)'
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

async function linkIngredientsToVariant(
  supabase: any,
  variantId: string,
  ingredients: InactiveIngredient[],
  splSetId?: string
): Promise<number> {
  let linkedCount = 0;

  // Update variant with SPL set ID
  if (splSetId) {
    await supabase
      .from('rx_variants')
      .update({ spl_set_id: splSetId })
      .eq('id', variantId);
  }

  for (const ing of ingredients) {
    try {
      // Check if ingredient exists (case-insensitive)
      const { data: existing } = await supabase
        .from('ingredients')
        .select('id, name')
        .ilike('name', ing.name)
        .limit(1);

      let ingredientId: string;

      if (existing && existing.length > 0) {
        ingredientId = existing[0].id;
      } else {
        // Check synonyms
        const { data: bySynonym } = await supabase
          .from('ingredients')
          .select('id, name')
          .contains('synonyms', [ing.name.toLowerCase()])
          .limit(1);

        if (bySynonym && bySynonym.length > 0) {
          ingredientId = bySynonym[0].id;
        } else {
          // Create new ingredient with needs_verification status
          const { data: newIng, error: createError } = await supabase
            .from('ingredients')
            .insert({
              name: ing.name,
              risk: 'low', // Default, needs review
              default_status: 'needs_verification',
            })
            .select('id')
            .single();

          if (createError) {
            console.error(`Error creating ingredient ${ing.name}:`, createError);
            continue;
          }
          ingredientId = newIng.id;
          console.log(`Created new ingredient: ${ing.name}`);
        }
      }

      // Check if link already exists
      const { data: existingLink } = await supabase
        .from('rx_variant_ingredients')
        .select('id')
        .eq('variant_id', variantId)
        .eq('ingredient_id', ingredientId)
        .limit(1);

      if (!existingLink || existingLink.length === 0) {
        // Create link
        const { error: linkError } = await supabase
          .from('rx_variant_ingredients')
          .insert({
            variant_id: variantId,
            ingredient_id: ingredientId,
            role: 'inactive',
            notes: 'Auto-imported from DailyMed SPL',
          });

        if (!linkError) {
          linkedCount++;
        } else {
          console.error(`Error linking ingredient ${ing.name}:`, linkError);
        }
      }
    } catch (err) {
      console.error(`Error processing ingredient ${ing.name}:`, err);
    }
  }

  return linkedCount;
}

async function seedDrug(
  supabase: any, 
  supabaseUrl: string,
  drugId: string,
  includeIngredients: boolean = true,
  authHeader: string
): Promise<SeedResult> {
  try {
    const { data: drug, error: drugError } = await supabase
      .from('rx_meds')
      .select('id, generic_name, dosage_forms')
      .eq('id', drugId)
      .single();

    if (drugError || !drug) {
      return { drugName: drugId, manufacturersAdded: 0, ingredientsLinked: 0, error: 'Drug not found' };
    }

    console.log(`\n=== Seeding manufacturers for: ${drug.generic_name} ===`);

    // Call the fetch-drug-manufacturers function with auth header
    const fetchUrl = `${supabaseUrl}/functions/v1/fetch-drug-manufacturers`;
    
    let response: Response;
    try {
      response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({ genericName: drug.generic_name, limit: 10 })
      });
    } catch (fetchError) {
      console.error(`Network error fetching manufacturers for ${drug.generic_name}:`, fetchError);
      return { 
        drugName: drug.generic_name, 
        manufacturersAdded: 0, 
        ingredientsLinked: 0, 
        error: 'Network error calling fetch-drug-manufacturers' 
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response from fetch-drug-manufacturers: ${response.status} - ${errorText}`);
      return { 
        drugName: drug.generic_name, 
        manufacturersAdded: 0, 
        ingredientsLinked: 0, 
        error: `API error: ${response.status}` 
      };
    }

    const manufacturerData = await response.json();

    // Log query info for debugging
    if (manufacturerData.queryInfo) {
      console.log(`[QUERY INFO] Normalized: "${manufacturerData.normalizedName}"`);
      for (const qi of manufacturerData.queryInfo) {
        console.log(`  Variant "${qi.variant}": ${qi.totalResults || 0} results`);
      }
    }

    if (!manufacturerData.manufacturers || manufacturerData.manufacturers.length === 0) {
      console.log(`[NO DATA] No manufacturers found for ${drug.generic_name}`);
      
      // Mark as needing manual mapping but don't fail the batch
      if (manufacturerData.needsManualMapping) {
        console.log(`  -> Marked as needs_manual_mapping`);
      }
      
      return { 
        drugName: drug.generic_name, 
        manufacturersAdded: 0, 
        ingredientsLinked: 0, 
        error: 'No FDA data found - needs manual mapping'
      };
    }

    console.log(`[FOUND] ${manufacturerData.manufacturers.length} manufacturers for ${drug.generic_name}`);

    // Build a lookup of existing variants for robust (case/spacing) dedupe
    const normalizeManufacturerName = (name: string) =>
      name
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();

    const { data: existingVariants, error: existingVariantsError } = await supabase
      .from('rx_variants')
      .select('id, manufacturer, ndc_list, spl_set_id')
      .eq('rx_med_id', drug.id);

    if (existingVariantsError) {
      console.error(`Error fetching existing variants for ${drug.generic_name}:`, existingVariantsError);
    }

    const existingByKey = new Map<string, { id: string; manufacturer: string; ndc_list: string[] | null; spl_set_id: string | null }>();
    for (const v of existingVariants || []) {
      if (!v?.manufacturer) continue;
      existingByKey.set(normalizeManufacturerName(v.manufacturer), v);
    }

    const seenThisRun = new Set<string>();

    let totalIngredientsLinked = 0;

    for (const mfr of manufacturerData.manufacturers as ManufacturerData[]) {
      try {
        // Skip placeholder entries (we still allow the drug to complete)
        if (mfr.labelerCode === 'VACCINE' && mfr.labelerName === 'Multiple manufacturers (vaccine)') {
          console.log(`  Skipping vaccine placeholder for ${drug.generic_name}`);
          continue;
        }

        const rawManufacturerName = (mfr.labelerName || '').trim();
        if (!rawManufacturerName) continue;

        const mfrKey = normalizeManufacturerName(rawManufacturerName);

        // Dedupe within this run (handles Hikma vs HIKMA vs extra spaces)
        if (seenThisRun.has(mfrKey)) continue;
        seenThisRun.add(mfrKey);

        const existingVariant = existingByKey.get(mfrKey);

        if (existingVariant) {
          // Treat existing variant as success (do not skip the drug linkage)
          console.log(`  Variant already exists for ${existingVariant.manufacturer}`);

          // Opportunistically merge NDC list if new NDCs were found (no schema changes)
          const incomingNdcList = Array.isArray(mfr.ndcCodes) ? mfr.ndcCodes : [];
          if (incomingNdcList.length > 0) {
            const merged = [...new Set([...(existingVariant.ndc_list || []), ...incomingNdcList])];
            if (merged.length !== (existingVariant.ndc_list || []).length) {
              await supabase
                .from('rx_variants')
                .update({ ndc_list: merged })
                .eq('id', existingVariant.id);
            }
          }

          // If we found SPL ingredients this run, we could link them, but we only do that
          // when we inserted a new variant to avoid unexpected extra work.
          continue;
        }

        // Fetch inactive ingredients from DailyMed if requested
        let splResult: SPLParseResult | null = null;
        if (includeIngredients && mfr.ndcCodes && mfr.ndcCodes.length > 0) {
          console.log(`  Fetching DailyMed SPL for ${rawManufacturerName}...`);
          splResult = await fetchInactiveIngredients(mfr.ndcCodes);

          if (splResult.success) {
            console.log(`  Found ${splResult.inactiveIngredients.length} inactive ingredients`);
          }
        }

        // Determine data source based on marketing category
        let dataSource = 'openfda';
        if (mfr.marketingCategory === 'NDA') {
          dataSource = 'openFDA-NDA';
        } else if (mfr.marketingCategory === 'ANDA') {
          dataSource = 'openFDA-ANDA';
        } else if (mfr.marketingCategory === 'BLA') {
          dataSource = 'openFDA-BLA';
        }

        // Insert the variant (manufacturer options live on rx_variants in this app)
        const { data: variant, error: variantError } = await supabase
          .from('rx_variants')
          .insert({
            rx_med_id: drug.id,
            manufacturer: rawManufacturerName,
            labeler_code: mfr.labelerCode,
            dosage_form: mfr.dosageForm || drug.dosage_forms?.[0] || null,
            strength_text: mfr.strength,
            ndc_list: mfr.ndcCodes || [],
            is_brand: mfr.isBrand || false,
            marketing_category: mfr.marketingCategory || null,
            data_source: dataSource,
            spl_set_id: splResult?.setId || null,
          })
          .select('id')
          .single();

        if (variantError) {
          console.error(`  Error inserting variant for ${rawManufacturerName}:`, variantError);
          continue;
        }

        console.log(`  Added variant for ${rawManufacturerName} (${dataSource})`);

        // Link inactive ingredients if found
        if (splResult?.success && splResult.inactiveIngredients.length > 0 && variant) {
          const linkedCount = await linkIngredientsToVariant(
            supabase,
            variant.id,
            splResult.inactiveIngredients,
            splResult.setId
          );
          totalIngredientsLinked += linkedCount;
          console.log(`  Linked ${linkedCount} ingredients to ${rawManufacturerName}`);
        }

        // Create initial verdict for this variant
        if (variant) {
          await supabase
            .from('rx_verdicts')
            .insert({
              variant_id: variant.id,
              status: 'needs_verification',
              confidence: 0,
              summary_reason: 'Awaiting ingredient analysis'
            });
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (mfrErr) {
        console.error(`  Error processing manufacturer ${mfr.labelerName}:`, mfrErr);
        // Continue with next manufacturer, don't fail the whole drug
      }
    }

    // Completed counts should reflect actual DB state (not only inserts this run)
    const { count: manufacturerCount } = await supabase
      .from('rx_variants')
      .select('id', { count: 'exact', head: true })
      .eq('rx_med_id', drug.id);

    const { data: variantIds } = await supabase
      .from('rx_variants')
      .select('id')
      .eq('rx_med_id', drug.id);

    const ids = (variantIds || []).map((v: any) => v.id).filter(Boolean);

    let ingredientCount = 0;
    if (ids.length > 0) {
      const { count } = await supabase
        .from('rx_variant_ingredients')
        .select('id', { count: 'exact', head: true })
        .in('variant_id', ids);
      ingredientCount = count || 0;
    }

    console.log(`=== Completed ${drug.generic_name}: ${manufacturerCount || 0} manufacturers, ${ingredientCount} ingredients ===\n`);

    return {
      drugName: drug.generic_name,
      manufacturersAdded: manufacturerCount || 0,
      ingredientsLinked: ingredientCount,
      error: (manufacturerCount || 0) === 0 ? 'No manufacturers found (may need manual mapping)' : undefined
    };

  } catch (error) {
    console.error(`Error seeding drug ${drugId}:`, error);
    // Return error but don't throw - let batch continue
    return { 
      drugName: drugId, 
      manufacturersAdded: 0, 
      ingredientsLinked: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
