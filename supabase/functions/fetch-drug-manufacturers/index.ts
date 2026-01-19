import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManufacturerResult {
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

interface FDANdcResponse {
  results?: Array<{
    term: string;
    count: number;
  }>;
  error?: { message: string };
}

interface FDAProductResponse {
  results?: Array<{
    product_ndc: string;
    generic_name: string;
    labeler_name: string;
    brand_name?: string;
    dosage_form: string;
    marketing_category?: string;
    active_ingredients: Array<{ strength: string }>;
    packaging?: Array<{ package_ndc: string }>;
    openfda?: {
      manufacturer_name?: string[];
      labeler_name?: string[];
      brand_name?: string[];
    };
  }>;
  error?: { message: string };
  meta?: { results?: { total: number } };
}

// ============ NORMALIZATION FUNCTION ============
function normalizeDrugName(rawName: string): string {
  let name = rawName.toLowerCase().trim();
  
  // Remove parenthetical text like "(supplement)", "(general)", "(IV)"
  name = name.replace(/\s*\([^)]*\)\s*/g, ' ');
  
  // Remove dosage form words
  const dosageForms = [
    'inhaler', 'inhalation', 'nebulizer', 'neb', 'nasal', 'topical', 'gel', 'patch',
    'eye', 'ophthalmic', 'vaginal', 'shampoo', 'oral', 'iv', 'injection', 'injectable',
    'auto-injector', 'autoinjector', 'sl', 'sublingual', 'cream', 'ointment', 'lotion',
    'solution', 'suspension', 'tablet', 'capsule', 'drops', 'spray', 'foam', 'powder',
    'suppository', 'transdermal', 'buccal', 'rectal', 'enema', 'liquid', 'syrup',
    'chewable', 'disintegrating', 'extended-release', 'immediate-release'
  ];
  const dosageFormsRegex = new RegExp(`\\b(${dosageForms.join('|')})\\b`, 'gi');
  name = name.replace(dosageFormsRegex, ' ');
  
  // Remove release tokens
  const releaseTokens = ['er', 'xr', 'sr', 'xl', 'dr', 'ec', 'cr', 'la', 'cd', 'sa', 'hfa', 'hcl'];
  const releaseTokensRegex = new RegExp(`\\b(${releaseTokens.join('|')})\\b`, 'gi');
  name = name.replace(releaseTokensRegex, ' ');
  
  // Trim and normalize spaces
  name = name.replace(/\s+/g, ' ').trim();
  
  return name;
}

// Generate query variants for combo drugs
function generateQueryVariants(normalized: string): string[] {
  const variants: string[] = [normalized];

  // If contains "/", try multiple strategies
  if (normalized.includes('/')) {
    variants.push(normalized.replace(/\//g, ' '));
    variants.push(normalized.replace(/\//g, ' and '));

    // Always try each component separately and merge manufacturers
    const components = normalized
      .split('/')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (components.length > 0) {
      variants.push(...components);
    }
  }

  // If contains "-", try with space
  if (normalized.includes('-')) {
    variants.push(normalized.replace(/-/g, ' '));
  }

  return [...new Set(variants.map(v => v.replace(/\s+/g, ' ').trim()).filter(Boolean))];
}

// Special handling for vaccines
function normalizeVaccineName(rawName: string): string {
  const lower = rawName.toLowerCase();
  
  // Map common vaccine names to simpler search terms
  const vaccineMap: Record<string, string> = {
    'covid-19': 'covid',
    'influenza': 'influenza',
    'flu': 'influenza',
    'mmr': 'measles mumps rubella',
    'tdap': 'tetanus diphtheria pertussis',
    'dtap': 'diphtheria tetanus pertussis',
    'varicella': 'varicella',
    'chickenpox': 'varicella',
    'shingles': 'zoster',
    'zoster': 'zoster',
    'hepatitis': 'hepatitis',
    'pneumococcal': 'pneumococcal',
    'meningococcal': 'meningococcal',
    'hpv': 'papillomavirus',
    'rotavirus': 'rotavirus',
    'polio': 'poliovirus',
    'rabies': 'rabies',
  };
  
  for (const [key, value] of Object.entries(vaccineMap)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  
  // Generic cleanup for vaccines
  return lower
    .replace(/vaccine/gi, '')
    .replace(/\(general\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isVaccine(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes('vaccine') ||
         lower.includes('immunization') ||
         lower.includes('covid-19') ||
         lower.includes('influenza') ||
         lower.includes('mmr') ||
         lower.includes('tdap') ||
         lower.includes('dtap');
}

function getSpecialSynonymVariants(rawName: string): string[] {
  const lower = rawName.toLowerCase();

  // High-miss synonym mapping (try these before manual mapping)
  if (lower.includes('entresto')) return ['sacubitril valsartan'];

  if (lower.includes('erenumab')) return ['aimovig', 'erenumab-aooe'];

  if (lower.includes('amphetamine') && lower.includes('dextroamphetamine')) {
    return ['mixed salts', 'amphetamine aspartate', 'dextroamphetamine saccharate'];
  }

  if (lower.includes('ethinyl') && lower.includes('levonorgestrel')) {
    return ['levonorgestrel and ethinyl estradiol'];
  }

  if (lower.includes('insulin') && (lower.includes('nph') || lower.includes('isophane'))) {
    return ['insulin isophane', 'nph insulin', 'humulin n', 'novolin n'];
  }

  if (lower.includes('insulin') && lower.includes('regular')) {
    return ['insulin human', 'regular insulin', 'humulin r', 'novolin r'];
  }

  if (lower.includes('prep') && (lower.includes('emtricitabine') || lower.includes('tenofovir') || lower.includes('hiv'))) {
    return [
      'emtricitabine tenofovir disoproxil fumarate',
      'truvada',
      'descovy',
    ];
  }

  return [];
}

// ============ RATE LIMITING & RETRY ============
async function fetchWithRetry(
  url: string, 
  maxRetries: number = 3,
  baseDelay: number = 500
): Promise<{ ok: boolean; status: number; data: any; errorType?: string }> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add delay between attempts (exponential backoff)
      if (attempt > 0) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}, waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        return { ok: true, status: response.status, data };
      }
      
      // Handle specific error codes
      if (response.status === 429) {
        console.log(`Rate limited (429), will retry...`);
        continue;
      }
      
      if (response.status >= 500) {
        console.log(`Server error (${response.status}), will retry...`);
        continue;
      }
      
      // 404 or other client errors - don't retry
      return { 
        ok: false, 
        status: response.status, 
        data,
        errorType: response.status === 404 ? 'not_found' : 'client_error'
      };
      
    } catch (error) {
      console.error(`Fetch error on attempt ${attempt + 1}:`, error);
      if (attempt === maxRetries - 1) {
        return { ok: false, status: 0, data: null, errorType: 'network_error' };
      }
    }
  }
  
  return { ok: false, status: 0, data: null, errorType: 'max_retries_exceeded' };
}

// ============ FDA QUERY FUNCTIONS ============
async function queryFDAbyGenericName(
  genericName: string,
  limit: number = 10
): Promise<{ manufacturers: ManufacturerResult[]; queryInfo: any }> {
  const manufacturers: ManufacturerResult[] = [];
  const queryInfo: any = {
    searchedName: genericName,
    queries: [],
    totalResults: 0,
  };
  
  // Step 1: Search by generic_name (exact match)
  const exactQuery = `generic_name:"${genericName}"`;
  const exactUrl = `https://api.fda.gov/drug/ndc.json?search=${encodeURIComponent(exactQuery)}&count=labeler_name.exact&limit=${limit}`;
  
  console.log(`[QUERY] Exact generic_name: ${exactUrl}`);
  queryInfo.queries.push({ type: 'generic_name_exact', query: exactQuery, url: exactUrl });
  
  const exactResult = await fetchWithRetry(exactUrl);
  
  if (exactResult.ok && exactResult.data.results?.length > 0) {
    queryInfo.totalResults = exactResult.data.results.length;
    await collectManufacturersFromCount(exactResult.data.results, genericName, manufacturers, limit);
  }
  
  // Step 2: If no results, try brand_name
  if (manufacturers.length === 0) {
    const brandQuery = `brand_name:"${genericName}"`;
    const brandUrl = `https://api.fda.gov/drug/ndc.json?search=${encodeURIComponent(brandQuery)}&count=labeler_name.exact&limit=${limit}`;
    
    console.log(`[QUERY] Trying brand_name: ${brandUrl}`);
    queryInfo.queries.push({ type: 'brand_name', query: brandQuery, url: brandUrl });
    
    const brandResult = await fetchWithRetry(brandUrl);
    
    if (brandResult.ok && brandResult.data.results?.length > 0) {
      queryInfo.totalResults = brandResult.data.results.length;
      await collectManufacturersFromCount(brandResult.data.results, genericName, manufacturers, limit, true);
    }
  }
  
  // Step 3: If still no results, try relaxed search (no quotes)
  if (manufacturers.length === 0) {
    const relaxedQuery = `generic_name:${genericName.replace(/\s+/g, '+AND+generic_name:')}`;
    const relaxedUrl = `https://api.fda.gov/drug/ndc.json?search=${encodeURIComponent(relaxedQuery)}&count=labeler_name.exact&limit=${limit}`;
    
    console.log(`[QUERY] Trying relaxed: ${relaxedUrl}`);
    queryInfo.queries.push({ type: 'relaxed', query: relaxedQuery, url: relaxedUrl });
    
    const relaxedResult = await fetchWithRetry(relaxedUrl);
    
    if (relaxedResult.ok && relaxedResult.data.results?.length > 0) {
      queryInfo.totalResults = relaxedResult.data.results.length;
      await collectManufacturersFromCount(relaxedResult.data.results, genericName, manufacturers, limit);
    } else {
      queryInfo.errorType = relaxedResult.errorType || 'no_matches';
    }
  }
  
  return { manufacturers, queryInfo };
}

async function collectManufacturersFromCount(
  countResults: Array<{ term: string; count: number }>,
  genericName: string,
  manufacturers: ManufacturerResult[],
  limit: number,
  searchByBrand: boolean = false
): Promise<void> {
  const normalizeManufacturerName = (name: string) =>
    name.trim().replace(/\s+/g, ' ').toLowerCase();

  for (const labeler of countResults.slice(0, limit)) {
    const labelerTerm = (labeler.term || '').trim();
    if (!labelerTerm) continue;

    // Skip if already have this manufacturer (case/space-insensitive)
    if (manufacturers.some(m => normalizeManufacturerName(m.labelerName) === normalizeManufacturerName(labelerTerm))) {
      continue;
    }

    // Throttle requests
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const searchField = searchByBrand ? 'brand_name' : 'generic_name';
      const search = `${searchField}:"${genericName}" AND labeler_name:"${labelerTerm}"`;
      const productUrl = `https://api.fda.gov/drug/ndc.json?search=${encodeURIComponent(search)}&limit=20`;

      const productResult = await fetchWithRetry(productUrl);

      if (productResult.ok && productResult.data.results?.length > 0) {
        const products = productResult.data.results;
        const firstProduct = products[0];

        // Prefer labeler_name from NDC results; fallback to openfda.* fields
        const labelerName = firstProduct.labeler_name ||
          firstProduct.openfda?.labeler_name?.[0] ||
          firstProduct.openfda?.manufacturer_name?.[0] ||
          labelerTerm;

        const firstNdc = firstProduct.product_ndc || '';
        const labelerCode = firstNdc.split('-')[0] || '';
        const marketingCategory = firstProduct.marketing_category || 'UNKNOWN';
        const isBrand = marketingCategory === 'NDA' || marketingCategory === 'BLA';

        // Collect NDC codes
        const ndcCodes: string[] = [];
        products.forEach((product: any) => {
          if (product.product_ndc) ndcCodes.push(product.product_ndc);
          product.packaging?.forEach((pkg: any) => {
            if (pkg.package_ndc) ndcCodes.push(pkg.package_ndc);
          });
        });

        manufacturers.push({
          labelerName,
          labelerCode,
          brandName: isBrand ? (firstProduct.brand_name || firstProduct.openfda?.brand_name?.[0]) : undefined,
          isBrand,
          marketingCategory,
          ndcCodes: [...new Set(ndcCodes)],
          dosageForm: firstProduct.dosage_form || null,
          strength: firstProduct.active_ingredients?.[0]?.strength || null,
          productCount: labeler.count
        });

        console.log(`[FOUND] ${labelerName}: ${ndcCodes.length} NDCs, ${isBrand ? 'BRAND' : 'GENERIC'}`);
      } else {
        // IMPORTANT: If the count endpoint had results but product fetch yields none,
        // still return the labeler term as a manufacturer so we don't end up with an empty list.
        manufacturers.push({
          labelerName: labelerTerm,
          labelerCode: '',
          isBrand: false,
          marketingCategory: 'UNKNOWN',
          ndcCodes: [],
          dosageForm: null,
          strength: null,
          productCount: labeler.count
        });
        console.log(`[FOUND] ${labelerTerm}: 0 NDCs (fallback from count)`);
      }
    } catch (err) {
      console.error(`Error fetching products for ${labelerTerm}:`, err);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============ AUTHENTICATION CHECK ============
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Unauthorized: No auth header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.log('Unauthorized: Invalid token', claimsError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated user: ${claimsData.claims.sub}`);
    // ============ END AUTH CHECK ============

    const { genericName, limit = 10 } = await req.json();

    if (!genericName) {
      return new Response(
        JSON.stringify({ error: 'genericName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawName = genericName;
    console.log(`\n========================================`);
    console.log(`[RAW NAME] ${rawName}`);
    
    // ============ NORMALIZATION ============
    const isVacc = isVaccine(rawName);
    let normalized: string;
    
    if (isVacc) {
      normalized = normalizeVaccineName(rawName);
      console.log(`[VACCINE DETECTED] Normalized to: "${normalized}"`);
    } else {
      normalized = normalizeDrugName(rawName);
      console.log(`[NORMALIZED] "${normalized}"`);
    }
    
    // Generate query variants
    const queryVariants = [...new Set([
      ...generateQueryVariants(normalized),
      ...getSpecialSynonymVariants(rawName),
    ])];
    console.log(`[QUERY VARIANTS] ${JSON.stringify(queryVariants)}`);

    const isCombo = normalized.includes('/');

    let allManufacturers: ManufacturerResult[] = [];
    let allQueryInfo: any[] = [];

    // Try each query variant
    for (const variant of queryVariants) {
      // For combo drugs, always try each ingredient variant and merge manufacturers
      if (!isCombo && allManufacturers.length >= limit) break;

      console.log(`\n--- Trying variant: "${variant}" ---`);
      const { manufacturers, queryInfo } = await queryFDAbyGenericName(variant, limit);

      allQueryInfo.push({ variant, ...queryInfo });

      // Merge manufacturers (dedupe by normalized labeler name)
      const normalizeManufacturerName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();
      for (const mfr of manufacturers) {
        const key = normalizeManufacturerName(mfr.labelerName);
        if (!allManufacturers.some(m => normalizeManufacturerName(m.labelerName) === key)) {
          allManufacturers.push(mfr);
        }
      }

      if (manufacturers.length > 0) {
        console.log(`[SUCCESS] Found ${manufacturers.length} manufacturers for variant "${variant}"`);
      }
    }
    
    // ============ VACCINE PLACEHOLDER ============
    if (allManufacturers.length === 0 && isVacc) {
      console.log(`[VACCINE FALLBACK] Adding placeholder manufacturer`);
      allManufacturers.push({
        labelerName: 'Multiple manufacturers (vaccine)',
        labelerCode: 'VACCINE',
        isBrand: false,
        marketingCategory: 'VACCINE',
        ndcCodes: [],
        dosageForm: 'INJECTION',
        strength: null,
        productCount: 0
      });
    }
    
    // Sort: brand first, then generics by product count descending
    allManufacturers.sort((a, b) => {
      if (a.isBrand && !b.isBrand) return -1;
      if (!a.isBrand && b.isBrand) return 1;
      return b.productCount - a.productCount;
    });

    const resultCount = allManufacturers.length;
    console.log(`\n[RESULT] Found ${resultCount} manufacturers for "${rawName}"`);
    console.log(`  - Brands: ${allManufacturers.filter(m => m.isBrand).length}`);
    console.log(`  - Generics: ${allManufacturers.filter(m => !m.isBrand).length}`);
    console.log(`========================================\n`);

    return new Response(
      JSON.stringify({ 
        genericName: rawName,
        normalizedName: normalized,
        manufacturers: allManufacturers,
        brandCount: allManufacturers.filter(m => m.isBrand).length,
        genericCount: allManufacturers.filter(m => !m.isBrand).length,
        totalFound: resultCount,
        queryInfo: allQueryInfo,
        needsManualMapping: resultCount === 0 || (isVacc && allManufacturers[0]?.labelerCode === 'VACCINE')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in fetch-drug-manufacturers:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
