import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InactiveIngredient {
  name: string;
  unii?: string;
}

interface SPLParseResult {
  success: boolean;
  setId?: string;
  ndc?: string;
  labeler?: string;
  productName?: string;
  inactiveIngredients: InactiveIngredient[];
  error?: string;
  source: "dailymed";
}

// DailyMed SPL API endpoints
const DAILYMED_BASE = "https://dailymed.nlm.nih.gov/dailymed/services/v2";

// Fetch SPL document by NDC from DailyMed
async function fetchSPLByNDC(ndc: string): Promise<{ setId: string; splUrl: string } | null> {
  // Clean NDC - remove dashes
  const cleanedNdc = ndc.replace(/[^0-9]/g, "");
  
  // Try different NDC formats
  const ndcVariants = [
    ndc, // Original with dashes
    cleanedNdc, // Without dashes
  ];
  
  // Add formatted versions
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
  
  // Find inactive ingredient section
  // SPL uses structured product labeling with specific codes
  // Code 416800000X = inactive ingredient
  
  // Match inactive ingredient components
  // Pattern: <ingredient classCode="IACT"> or within inactiveIngredient section
  const ingredientMatches = xmlText.matchAll(
    /<ingredient[^>]*classCode\s*=\s*["']IACT["'][^>]*>[\s\S]*?<ingredientSubstance>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?(?:<code[^>]*code\s*=\s*["']([A-Z0-9]+)["'][^>]*\/>)?[\s\S]*?<\/ingredientSubstance>[\s\S]*?<\/ingredient>/gi
  );
  
  for (const match of ingredientMatches) {
    const name = match[1]?.trim();
    const unii = match[2]; // UNII code if present
    
    if (name && !ingredients.some(i => i.name.toLowerCase() === name.toLowerCase())) {
      ingredients.push({
        name,
        unii: unii || undefined,
      });
    }
  }
  
  // Also try alternate pattern for inactive ingredients section
  if (ingredients.length === 0) {
    // Look for inactive ingredients in the characteristic section
    const altMatches = xmlText.matchAll(
      /<characteristic>[\s\S]*?<code[^>]*displayName\s*=\s*["']([^"']+)["'][^>]*\/>[\s\S]*?<\/characteristic>/gi
    );
    
    for (const match of altMatches) {
      const name = match[1]?.trim();
      if (name && !ingredients.some(i => i.name.toLowerCase() === name.toLowerCase())) {
        ingredients.push({ name });
      }
    }
  }
  
  // Try yet another pattern - looking for IACT ingredients in component/product
  if (ingredients.length === 0) {
    const componentMatches = xmlText.matchAll(
      /<ingredientSubstance>[\s\S]*?<code[^>]*codeSystem="2\.16\.840\.1\.113883\.4\.9"[^>]*code\s*=\s*["']([A-Z0-9]+)["'][^>]*\/>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/ingredientSubstance>/gi
    );
    
    // Track which ones are inactive vs active
    const inactiveSection = xmlText.match(
      /<inactiveIngredient>[\s\S]*?<\/inactiveIngredient>/gi
    );
    
    if (inactiveSection) {
      for (const section of inactiveSection) {
        const names = section.matchAll(/<name>([^<]+)<\/name>/gi);
        for (const nameMatch of names) {
          const name = nameMatch[1]?.trim();
          if (name && !ingredients.some(i => i.name.toLowerCase() === name.toLowerCase())) {
            ingredients.push({ name });
          }
        }
      }
    }
  }
  
  // Final fallback: look for any ingredient with IACT classCode
  if (ingredients.length === 0) {
    // Simpler regex to find inactive ingredients
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
  
  console.log(`Parsed ${ingredients.length} inactive ingredients from SPL`);
  return ingredients;
}

// Extract labeler and product info from SPL
function extractProductInfo(xmlText: string): { labeler?: string; productName?: string } {
  let labeler: string | undefined;
  let productName: string | undefined;
  
  // Find labeler (manufacturer)
  const labelerMatch = xmlText.match(
    /<representedOrganization>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/representedOrganization>/i
  );
  if (labelerMatch) {
    labeler = labelerMatch[1]?.trim();
  }
  
  // Find product name
  const productMatch = xmlText.match(
    /<manufacturedProduct>[\s\S]*?<name>([^<]+)<\/name>/i
  );
  if (productMatch) {
    productName = productMatch[1]?.trim();
  }
  
  return { labeler, productName };
}

async function parseDailyMedSPL(ndc: string): Promise<SPLParseResult> {
  try {
    // Step 1: Get SPL document reference from NDC
    const splRef = await fetchSPLByNDC(ndc);
    
    if (!splRef) {
      return {
        success: false,
        inactiveIngredients: [],
        error: "NDC not found in DailyMed database",
        source: "dailymed",
      };
    }
    
    // Step 2: Fetch the SPL XML document
    console.log(`Fetching SPL XML from: ${splRef.splUrl}`);
    const splResponse = await fetch(splRef.splUrl);
    
    if (!splResponse.ok) {
      return {
        success: false,
        setId: splRef.setId,
        inactiveIngredients: [],
        error: `Failed to fetch SPL document: ${splResponse.status}`,
        source: "dailymed",
      };
    }
    
    const splXml = await splResponse.text();
    
    // Step 3: Parse the XML to extract inactive ingredients
    const inactiveIngredients = parseSPLXML(splXml);
    const { labeler, productName } = extractProductInfo(splXml);
    
    return {
      success: true,
      setId: splRef.setId,
      ndc,
      labeler,
      productName,
      inactiveIngredients,
      source: "dailymed",
    };
  } catch (error) {
    console.error("Error parsing DailyMed SPL:", error);
    return {
      success: false,
      inactiveIngredients: [],
      error: error instanceof Error ? error.message : "Unknown error parsing SPL",
      source: "dailymed",
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ndc } = await req.json();
    
    if (!ndc || typeof ndc !== "string") {
      return new Response(
        JSON.stringify({ error: "NDC code is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Validate NDC format
    const cleanedNDC = ndc.replace(/[^0-9]/g, "");
    if (cleanedNDC.length < 10 || cleanedNDC.length > 11) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid NDC format. NDC should be 10-11 digits." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log(`Parsing DailyMed SPL for NDC: ${ndc}`);
    const result = await parseDailyMedSPL(ndc);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in parse-dailymed-spl function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
