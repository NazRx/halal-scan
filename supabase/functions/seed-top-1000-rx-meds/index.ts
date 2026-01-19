import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FDACountResult {
  term: string;
  count: number;
}

interface SeedResult {
  fetched: number;
  existing: number;
  inserted: number;
  skipped: number;
  sampleInserted: string[];
  errors: string[];
}

function normalizeGenericName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

function normalizeForComparison(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client for auth verification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user and check admin role
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roles, error: rolesError } = await authClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (rolesError || !roles) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client for database writes
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[seed-top-1000] Starting FDA fetch...');

    // Fetch top 1000 generic drugs from openFDA
    const fdaResponse = await fetch(
      'https://api.fda.gov/drug/ndc.json?count=generic_name.exact&limit=1000'
    );

    if (!fdaResponse.ok) {
      throw new Error(`FDA API error: ${fdaResponse.status} ${fdaResponse.statusText}`);
    }

    const fdaData = await fdaResponse.json();
    const results: FDACountResult[] = fdaData.results || [];

    console.log(`[seed-top-1000] Fetched ${results.length} generic drugs from FDA`);

    // Get existing rx_meds for deduplication
    const { data: existingMeds, error: fetchError } = await supabase
      .from('rx_meds')
      .select('generic_name, popularity_rank');

    if (fetchError) {
      throw new Error(`Failed to fetch existing meds: ${fetchError.message}`);
    }

    // Build case-insensitive set of existing generic names
    const existingSet = new Set<string>(
      (existingMeds || []).map(m => normalizeForComparison(m.generic_name))
    );

    // Track existing drugs with their ranks for logging
    const existingWithRanks = new Map<string, number | null>(
      (existingMeds || []).map(m => [normalizeForComparison(m.generic_name), m.popularity_rank])
    );

    console.log(`[seed-top-1000] Found ${existingSet.size} existing drugs in database`);

    const result: SeedResult = {
      fetched: results.length,
      existing: 0,
      inserted: 0,
      skipped: 0,
      sampleInserted: [],
      errors: []
    };

    const toInsert: any[] = [];
    const seenInBatch = new Set<string>();

    for (let i = 0; i < results.length; i++) {
      const term = normalizeGenericName(results[i].term);
      const normalizedKey = normalizeForComparison(term);
      const rank = i + 1;

      // Skip if already exists in database
      if (existingSet.has(normalizedKey)) {
        result.existing++;
        const existingRank = existingWithRanks.get(normalizedKey);
        console.log(`[seed-top-1000] Skipping existing: "${term}" (current rank: ${existingRank}, FDA rank: ${rank})`);
        continue;
      }

      // Skip if duplicate in current batch
      if (seenInBatch.has(normalizedKey)) {
        result.skipped++;
        console.log(`[seed-top-1000] Skipping duplicate in batch: "${term}"`);
        continue;
      }

      seenInBatch.add(normalizedKey);

      toInsert.push({
        generic_name: term,
        popularity_rank: rank,
        source: 'openfda_ndc_count',
        brand_names: [],
        dosage_forms: [],
        rx_otc: 'Rx',
        default_status: 'needs_verification',
        hydrate_attempts: 0
      });

      // Track sample for response
      if (result.sampleInserted.length < 10) {
        result.sampleInserted.push(term);
      }
    }

    console.log(`[seed-top-1000] Prepared ${toInsert.length} drugs for insertion`);

    // Batch insert in chunks to avoid timeouts
    const BATCH_SIZE = 50;
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);
      
      const { error: insertError } = await supabase
        .from('rx_meds')
        .insert(batch);

      if (insertError) {
        console.error(`[seed-top-1000] Insert error for batch ${i}-${i + batch.length}:`, insertError);
        result.errors.push(`Batch ${i}-${i + batch.length}: ${insertError.message}`);
        result.skipped += batch.length;
      } else {
        result.inserted += batch.length;
        console.log(`[seed-top-1000] Inserted batch ${i}-${i + batch.length}`);
      }

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < toInsert.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[seed-top-1000] Complete: inserted=${result.inserted}, existing=${result.existing}, skipped=${result.skipped}`);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('[seed-top-1000] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
