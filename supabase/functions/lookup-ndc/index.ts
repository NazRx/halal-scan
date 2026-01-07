import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OpenFDAProduct {
  product_ndc: string;
  generic_name: string;
  brand_name: string;
  labeler_name: string;
  dosage_form: string;
  route: string[];
  marketing_category: string;
  product_type: string;
  active_ingredients: Array<{
    name: string;
    strength: string;
  }>;
  packaging: Array<{
    package_ndc: string;
    description: string;
  }>;
}

interface OpenFDAResponse {
  meta: {
    results: {
      total: number;
    };
  };
  results: OpenFDAProduct[];
}

interface NDCLookupResult {
  success: boolean;
  ndc: string;
  labeler: string | null;
  genericName: string | null;
  brandName: string | null;
  dosageForm: string | null;
  route: string[] | null;
  activeIngredients: Array<{ name: string; strength: string }> | null;
  packaging: Array<{ ndc: string; description: string }> | null;
  marketingCategory: string | null;
  error?: string;
}

// Normalize NDC to different formats for search
function normalizeNDC(ndc: string): string[] {
  // Remove all non-alphanumeric characters
  const cleaned = ndc.replace(/[^0-9]/g, "");
  
  // NDC can be 10 or 11 digits
  // Common formats: 4-4-2, 5-3-2, 5-4-1 (all equal 10 digits)
  // FDA uses 5-4-2 format (11 digits with leading zeros)
  
  const variants: string[] = [];
  
  // Add the cleaned version
  variants.push(cleaned);
  
  // If 10 digits, try adding leading zeros to get 11-digit version
  if (cleaned.length === 10) {
    // 4-4-2 -> 5-4-2 (add leading zero to first segment)
    variants.push("0" + cleaned);
    // Also try the original 10-digit formats
    variants.push(`${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`);
    variants.push(`${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}-${cleaned.slice(8)}`);
    variants.push(`${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`);
  }
  
  if (cleaned.length === 11) {
    // 5-4-2 format
    variants.push(`${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`);
    // Also add without leading zero
    if (cleaned.startsWith("0")) {
      variants.push(cleaned.slice(1));
    }
  }
  
  return [...new Set(variants)]; // Remove duplicates
}

async function lookupNDC(ndc: string): Promise<NDCLookupResult> {
  const variants = normalizeNDC(ndc);
  
  // Try each variant until we get a result
  for (const variant of variants) {
    try {
      // Search by product_ndc or package_ndc
      const searchQueries = [
        `product_ndc:"${variant}"`,
        `packaging.package_ndc:"${variant}"`,
      ];
      
      for (const query of searchQueries) {
        const url = `https://api.fda.gov/drug/ndc.json?search=${encodeURIComponent(query)}&limit=1`;
        
        console.log(`Querying openFDA: ${url}`);
        
        const response = await fetch(url);
        
        if (response.status === 404) {
          // No results for this query, try next
          continue;
        }
        
        if (!response.ok) {
          console.error(`openFDA API error: ${response.status}`);
          continue;
        }
        
        const data: OpenFDAResponse = await response.json();
        
        if (data.results && data.results.length > 0) {
          const product = data.results[0];
          
          return {
            success: true,
            ndc: ndc,
            labeler: product.labeler_name || null,
            genericName: product.generic_name || null,
            brandName: product.brand_name || null,
            dosageForm: product.dosage_form || null,
            route: product.route || null,
            activeIngredients: product.active_ingredients || null,
            packaging: product.packaging?.map(p => ({
              ndc: p.package_ndc,
              description: p.description,
            })) || null,
            marketingCategory: product.marketing_category || null,
          };
        }
      }
    } catch (error) {
      console.error(`Error querying variant ${variant}:`, error);
    }
  }
  
  // No results found
  return {
    success: false,
    ndc: ndc,
    labeler: null,
    genericName: null,
    brandName: null,
    dosageForm: null,
    route: null,
    activeIngredients: null,
    packaging: null,
    marketingCategory: null,
    error: "NDC not found in openFDA database",
  };
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
    
    // Validate NDC format (should be 10-11 digits, possibly with dashes)
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
    
    const result = await lookupNDC(ndc);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in lookup-ndc function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
