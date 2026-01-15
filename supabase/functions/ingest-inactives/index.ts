import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InactiveIngredient {
  name: string;
  unii?: string;
}

interface SPLProductInfo {
  setId: string;
  labeler?: string;
  productName?: string;
  genericName?: string;
  dosageForm?: string;
  strength?: string;
  route?: string;
  splVersion?: string;
}

interface IngestResult {
  success: boolean;
  ndc: string;
  setId?: string;
  productInfo?: SPLProductInfo;
  inactiveIngredients: InactiveIngredient[];
  insertedCount: number;
  matchedCount: number;
  error?: string;
}

// DailyMed SPL API endpoints
const DAILYMED_BASE = "https://dailymed.nlm.nih.gov/dailymed/services/v2";

// Normalize ingredient name for matching
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove punctuation except hyphens
    .replace(/\s+/g, ' ')         // Collapse multiple spaces
    .trim();
}

// Fetch SPL document by NDC from DailyMed
async function fetchSPLByNDC(ndc: string): Promise<{ setId: string; splUrl: string } | null> {
  const cleanedNdc = ndc.replace(/[^0-9]/g, "");
  
  const ndcVariants = [
    ndc,
    cleanedNdc,
  ];
  
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
      console.log(`Querying DailyMed NDC: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`DailyMed NDC query failed: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const setId = data.data[0].setid;
        console.log(`Found SPL setId: ${setId}`);
        
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

// Parse SPL XML to extract inactive ingredients
function parseSPLXML(xmlText: string): InactiveIngredient[] {
  const ingredients: InactiveIngredient[] = [];
  
  // Match inactive ingredient components with classCode="IACT"
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
  
  // Fallback: Look for IACT classCode with simpler pattern
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
  
  // Try to extract UNII codes for ingredients that don't have them
  for (const ingredient of ingredients) {
    if (!ingredient.unii) {
      const uniiPattern = new RegExp(
        `<name>${ingredient.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</name>[\\s\\S]*?<code[^>]*codeSystem="2\\.16\\.840\\.1\\.113883\\.4\\.9"[^>]*code\\s*=\\s*["']([A-Z0-9]+)["']`,
        'i'
      );
      const uniiMatch = xmlText.match(uniiPattern);
      if (uniiMatch) {
        ingredient.unii = uniiMatch[1];
      }
    }
  }
  
  console.log(`Parsed ${ingredients.length} inactive ingredients from SPL`);
  return ingredients;
}

// Extract product info from SPL
function extractProductInfo(xmlText: string, setId: string): SPLProductInfo {
  const info: SPLProductInfo = { setId };
  
  // Labeler (manufacturer)
  const labelerMatch = xmlText.match(
    /<representedOrganization>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/representedOrganization>/i
  );
  if (labelerMatch) info.labeler = labelerMatch[1]?.trim();
  
  // Product name
  const productMatch = xmlText.match(
    /<manufacturedProduct>[\s\S]*?<name>([^<]+)<\/name>/i
  );
  if (productMatch) info.productName = productMatch[1]?.trim();
  
  // Generic name
  const genericMatch = xmlText.match(
    /<genericMedicine>[\s\S]*?<name>([^<]+)<\/name>/i
  );
  if (genericMatch) info.genericName = genericMatch[1]?.trim();
  
  // Dosage form
  const formMatch = xmlText.match(
    /<formCode[^>]*displayName\s*=\s*["']([^"']+)["']/i
  );
  if (formMatch) info.dosageForm = formMatch[1]?.trim();
  
  // Route
  const routeMatch = xmlText.match(
    /<routeCode[^>]*displayName\s*=\s*["']([^"']+)["']/i
  );
  if (routeMatch) info.route = routeMatch[1]?.trim();
  
  // SPL version
  const versionMatch = xmlText.match(
    /<versionNumber\s+value\s*=\s*["']([^"']+)["']/i
  );
  if (versionMatch) info.splVersion = versionMatch[1]?.trim();
  
  return info;
}

// Match ingredient against database
async function matchIngredient(
  supabase: any,
  normalizedName: string
): Promise<{ id: string; status: string; confidence: string } | null> {
  // Try exact name match first
  const { data: exactMatch } = await supabase
    .from('ingredients')
    .select('id, default_status')
    .ilike('name', normalizedName)
    .limit(1)
    .single();
  
  if (exactMatch) {
    return {
      id: (exactMatch as any).id,
      status: (exactMatch as any).default_status || 'needs_verification',
      confidence: 'exact'
    };
  }
  
  // Try synonym match
  const { data: synonymMatches } = await supabase
    .from('ingredients')
    .select('id, default_status, synonyms')
    .not('synonyms', 'is', null);
  
  if (synonymMatches) {
    for (const ing of synonymMatches as any[]) {
      const synonyms = ing.synonyms as string[] | null;
      if (synonyms?.some((s: string) => normalizeIngredientName(s) === normalizedName)) {
        return {
          id: ing.id,
          status: ing.default_status || 'needs_verification',
          confidence: 'synonym'
        };
      }
    }
  }
  
  // Try partial match (contains)
  const { data: partialMatch } = await supabase
    .from('ingredients')
    .select('id, default_status')
    .or(`name.ilike.%${normalizedName}%,name.ilike.${normalizedName}%`)
    .limit(1)
    .single();
  
  if (partialMatch) {
    return {
      id: (partialMatch as any).id,
      status: (partialMatch as any).default_status || 'needs_verification',
      confidence: 'partial'
    };
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Unauthorized: No auth header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Use anon key for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.log('Unauthorized: Invalid token', claimsError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const userId = claimsData.claims.sub as string;
    const { data: isAdmin } = await supabaseAuth.rpc('is_admin', { _user_id: userId });
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { ndc, forceRefresh = false } = await req.json();
    
    if (!ndc || typeof ndc !== "string") {
      return new Response(
        JSON.stringify({ error: "NDC code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const cleanedNDC = ndc.replace(/[^0-9]/g, "");
    if (cleanedNDC.length < 10 || cleanedNDC.length > 11) {
      return new Response(
        JSON.stringify({ error: "Invalid NDC format. NDC should be 10-11 digits." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Ingesting inactive ingredients for NDC: ${ndc}`);
    
    // Check if already ingested
    if (!forceRefresh) {
      const { data: existing } = await supabase
        .from('ndc_products')
        .select('ndc, set_id, last_ingested_at')
        .eq('ndc', ndc)
        .single();
      
      if (existing?.last_ingested_at) {
        console.log(`NDC ${ndc} already ingested at ${existing.last_ingested_at}`);
        
        // Get existing ingredients
        const { data: existingIngredients } = await supabase
          .from('ndc_inactive_ingredients')
          .select('*')
          .eq('ndc', ndc);
        
        return new Response(
          JSON.stringify({
            success: true,
            ndc,
            setId: existing.set_id,
            cached: true,
            inactiveIngredients: existingIngredients?.map(i => ({
              name: i.ingredient_text_raw,
              unii: i.unii_code
            })) || [],
            insertedCount: 0,
            matchedCount: existingIngredients?.filter(i => i.status === 'matched').length || 0
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Fetch SPL from DailyMed
    const splRef = await fetchSPLByNDC(ndc);
    
    if (!splRef) {
      return new Response(
        JSON.stringify({
          success: false,
          ndc,
          inactiveIngredients: [],
          insertedCount: 0,
          matchedCount: 0,
          error: "NDC not found in DailyMed database"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Fetching SPL XML from: ${splRef.splUrl}`);
    const splResponse = await fetch(splRef.splUrl);
    
    if (!splResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          ndc,
          setId: splRef.setId,
          inactiveIngredients: [],
          insertedCount: 0,
          matchedCount: 0,
          error: `Failed to fetch SPL document: ${splResponse.status}`
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const splXml = await splResponse.text();
    const inactiveIngredients = parseSPLXML(splXml);
    const productInfo = extractProductInfo(splXml, splRef.setId);
    
    // Upsert product info
    const { error: productError } = await supabase
      .from('ndc_products')
      .upsert({
        ndc,
        generic_name: productInfo.genericName,
        brand_name: productInfo.productName,
        dosage_form: productInfo.dosageForm,
        route: productInfo.route,
        labeler_name: productInfo.labeler,
        set_id: splRef.setId,
        spl_version: productInfo.splVersion,
        last_ingested_at: new Date().toISOString()
      }, { onConflict: 'ndc' });
    
    if (productError) {
      console.error('Error upserting product:', productError);
      throw productError;
    }
    
    // Delete existing ingredients if refreshing
    if (forceRefresh) {
      await supabase
        .from('ndc_inactive_ingredients')
        .delete()
        .eq('ndc', ndc);
    }
    
    // Process and insert ingredients
    let insertedCount = 0;
    let matchedCount = 0;
    
    for (const ingredient of inactiveIngredients) {
      const normalizedName = normalizeIngredientName(ingredient.name);
      const match = await matchIngredient(supabase, normalizedName);
      
      const { error: insertError } = await supabase
        .from('ndc_inactive_ingredients')
        .insert({
          ndc,
          ingredient_text_raw: ingredient.name,
          ingredient_name_normalized: normalizedName,
          unii_code: ingredient.unii,
          matched_ingredient_id: match?.id || null,
          matched_status: match?.status || null,
          match_confidence: match?.confidence || 'none',
          status: match ? 'matched' : 'unmatched'
        });
      
      if (insertError) {
        console.error(`Error inserting ingredient ${ingredient.name}:`, insertError);
      } else {
        insertedCount++;
        if (match) matchedCount++;
      }
    }
    
    console.log(`Ingested ${insertedCount} ingredients, ${matchedCount} matched for NDC ${ndc}`);
    
    const result: IngestResult = {
      success: true,
      ndc,
      setId: splRef.setId,
      productInfo,
      inactiveIngredients,
      insertedCount,
      matchedCount
    };
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ingest-inactives function:", error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
