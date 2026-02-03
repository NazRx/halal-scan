import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RebuildResult {
  productsProcessed: number;
  synonymsUpserted: number;
  productsWithFallback: number;
  productsWithSearchTerms: number;
  errors: string[];
}

// Stoplist for tokens that shouldn't be synonyms
const STOPLIST = new Set([
  'tablet', 'tablets', 'capsule', 'capsules', 'caplet', 'caplets',
  'mg', 'ml', 'mcg', 'gram', 'hour', 'hours', 'dose', 'doses',
  'extra', 'strength', 'regular', 'maximum', 'max', 'original',
  'liquid', 'gel', 'cream', 'spray', 'drops', 'patch', 'powder',
  'oral', 'topical', 'nasal', 'chewable', 'softgel', 'softgels',
  'relief', 'formula', 'fast', 'acting', 'extended', 'release',
  'er', 'sr', 'dr', 'ir', 'pm', 'am', 'day', 'night', 'nighttime',
  'daytime', 'the', 'and', 'for', 'with', 'plus', 'new', 'advanced'
]);

// Normalize text for synonyms
function normalizeSynonym(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, ' ');
}

// Parse search_terms with multiple delimiter support
// Note: search_terms can be a string or an array from DB
function parseSearchTerms(searchTerms: string | string[] | null): string[] {
  if (!searchTerms) return [];
  
  // If it's already an array, join it first
  const termsStr = Array.isArray(searchTerms) ? searchTerms.join(';') : searchTerms;
  
  // Split by semicolon, comma, or pipe
  const terms = termsStr.split(/[;,|]/)
    .map(t => normalizeSynonym(t))
    .filter(t => t.length >= 2)
    .filter(t => !STOPLIST.has(t))
    .filter(t => !/^\d+$/.test(t)); // Remove purely numeric tokens
  
  // Deduplicate case-insensitively
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const term of terms) {
    if (!seen.has(term)) {
      seen.add(term);
      unique.push(term);
    }
  }
  
  return unique;
}

// Generate generic-based synonyms (abbreviations, common names)
function getGenericSynonyms(genericName: string): string[] {
  const synonyms: string[] = [];
  const lower = genericName.toLowerCase();
  
  // Common abbreviation mappings
  const abbreviationMap: Record<string, string[]> = {
    'acetaminophen': ['apap', 'paracetamol', 'tylenol'],
    'ibuprofen': ['ibu', 'advil', 'motrin', 'nsaid'],
    'naproxen': ['naprosyn', 'aleve'],
    'aspirin': ['asa', 'acetylsalicylic acid'],
    'diphenhydramine': ['benadryl', 'dph'],
    'cetirizine': ['zyrtec'],
    'loratadine': ['claritin'],
    'fexofenadine': ['allegra'],
    'famotidine': ['pepcid'],
    'omeprazole': ['prilosec', 'ppi'],
    'esomeprazole': ['nexium', 'ppi'],
    'lansoprazole': ['prevacid', 'ppi'],
    'loperamide': ['imodium'],
    'bismuth subsalicylate': ['pepto bismol', 'pepto'],
    'polyethylene glycol': ['miralax', 'peg', 'peg 3350'],
    'guaifenesin': ['mucinex'],
    'dextromethorphan': ['dxm', 'robitussin'],
    'pseudoephedrine': ['sudafed'],
    'phenylephrine': ['sudafed pe'],
    'fluticasone': ['flonase'],
    'triamcinolone': ['nasacort'],
  };
  
  for (const [key, abbrevs] of Object.entries(abbreviationMap)) {
    if (lower.includes(key)) {
      synonyms.push(...abbrevs);
    }
  }
  
  return synonyms;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const result: RebuildResult = {
      productsProcessed: 0,
      synonymsUpserted: 0,
      productsWithFallback: 0,
      productsWithSearchTerms: 0,
      errors: []
    };

    console.log('[rebuild-synonyms] Starting synonym rebuild...');

    // Fetch all OTC products
    const { data: products, error: productsError } = await supabase
      .from('otc_products')
      .select('id, generic_name, display_name, search_terms, category');

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    console.log(`[rebuild-synonyms] Found ${products?.length || 0} products`);

    // Fetch all brand aliases for fallback
    const { data: brandAliases, error: aliasesError } = await supabase
      .from('otc_brand_aliases')
      .select('generic_name_normalized, brand');

    if (aliasesError) {
      console.warn('[rebuild-synonyms] Warning: Could not fetch brand aliases:', aliasesError.message);
    }

    // Build alias lookup map
    const aliasMap = new Map<string, string[]>();
    if (brandAliases) {
      for (const alias of brandAliases) {
        const key = normalizeSynonym(alias.generic_name_normalized);
        if (!aliasMap.has(key)) {
          aliasMap.set(key, []);
        }
        aliasMap.get(key)!.push(normalizeSynonym(alias.brand));
      }
    }
    console.log(`[rebuild-synonyms] Loaded ${aliasMap.size} generic names with brand aliases`);

    // Generate all synonym rows
    const allSynonymRows: { otc_product_id: string; synonym: string; synonym_type: string }[] = [];

    for (const product of products || []) {
      result.productsProcessed++;
      const productId = product.id;
      const genericNormalized = normalizeSynonym(product.generic_name);
      const displayNormalized = normalizeSynonym(product.display_name || '');
      
      const synonymSet = new Set<string>();
      let usedFallback = false;
      let hadSearchTerms = false;

      // Always add generic name and display name
      if (genericNormalized.length >= 2) synonymSet.add(genericNormalized);
      if (displayNormalized.length >= 2 && displayNormalized !== genericNormalized) {
        synonymSet.add(displayNormalized);
      }

      // Add generic-based abbreviations
      const genericSynonyms = getGenericSynonyms(product.generic_name);
      for (const syn of genericSynonyms) {
        const normalized = normalizeSynonym(syn);
        if (normalized.length >= 2) synonymSet.add(normalized);
      }

      // Parse search_terms if present
      const searchTermSynonyms = parseSearchTerms(product.search_terms as string | string[] | null);
      if (searchTermSynonyms.length > 0) {
        hadSearchTerms = true;
        result.productsWithSearchTerms++;
        for (const syn of searchTermSynonyms) {
          synonymSet.add(syn);
        }
      }

      // Fallback: use brand aliases if search_terms empty
      if (!hadSearchTerms) {
        const aliases = aliasMap.get(genericNormalized) || [];
        if (aliases.length > 0) {
          usedFallback = true;
          result.productsWithFallback++;
          for (const alias of aliases) {
            synonymSet.add(alias);
          }
        }
      }

      // Create synonym rows
      for (const synonym of synonymSet) {
        const synType = synonym === genericNormalized ? 'generic' 
          : synonym === displayNormalized ? 'display' 
          : usedFallback ? 'fallback' 
          : 'brand';
          
        allSynonymRows.push({
          otc_product_id: productId,
          synonym: synonym,
          synonym_type: synType
        });
      }
    }

    console.log(`[rebuild-synonyms] Generated ${allSynonymRows.length} total synonym rows`);

    // Deduplicate by (product_id, synonym)
    const seen = new Map<string, typeof allSynonymRows[0]>();
    for (const row of allSynonymRows) {
      const key = `${row.otc_product_id}|${row.synonym}`;
      if (!seen.has(key)) {
        seen.set(key, row);
      }
    }
    const dedupedRows = Array.from(seen.values());
    console.log(`[rebuild-synonyms] After dedupe: ${dedupedRows.length} rows`);

    // Batch upsert synonyms
    const batchSize = 100;
    for (let i = 0; i < dedupedRows.length; i += batchSize) {
      const batch = dedupedRows.slice(i, i + batchSize);
      
      const { error: upsertError } = await supabase
        .from('otc_synonyms')
        .upsert(batch, { 
          onConflict: 'otc_product_id,synonym',
          ignoreDuplicates: false // Update synonym_type if changed
        });

      if (upsertError) {
        console.error(`[rebuild-synonyms] Batch ${Math.floor(i/batchSize)+1} error:`, upsertError);
        result.errors.push(`Batch error: ${upsertError.message}`);
      } else {
        result.synonymsUpserted += batch.length;
      }
    }

    // Get final count from DB
    const { count: finalCount } = await supabase
      .from('otc_synonyms')
      .select('*', { count: 'exact', head: true });

    console.log(`[rebuild-synonyms] ============ REBUILD COMPLETE ============`);
    console.log(`[rebuild-synonyms] Products processed: ${result.productsProcessed}`);
    console.log(`[rebuild-synonyms] Products with search_terms: ${result.productsWithSearchTerms}`);
    console.log(`[rebuild-synonyms] Products using fallback: ${result.productsWithFallback}`);
    console.log(`[rebuild-synonyms] Synonyms upserted: ${result.synonymsUpserted}`);
    console.log(`[rebuild-synonyms] Total synonyms in DB: ${finalCount}`);
    if (result.errors.length > 0) {
      console.log(`[rebuild-synonyms] Errors: ${result.errors.join(', ')}`);
    }

    return new Response(
      JSON.stringify({
        ...result,
        totalSynonymsInDb: finalCount
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('[rebuild-synonyms] Error:', error.message, error.stack);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
