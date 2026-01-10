import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManufacturerResult {
  labelerName: string;
  labelerCode: string;
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
    dosage_form: string;
    active_ingredients: Array<{ strength: string }>;
    packaging?: Array<{ package_ndc: string }>;
  }>;
  error?: { message: string };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { genericName, limit = 10 } = await req.json();

    if (!genericName) {
      return new Response(
        JSON.stringify({ error: 'genericName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching manufacturers for: ${genericName}`);

    // Step 1: Get top manufacturers by frequency from openFDA
    const countUrl = `https://api.fda.gov/drug/ndc.json?search=generic_name:"${encodeURIComponent(genericName)}"&count=labeler_name.exact&limit=${limit}`;
    
    console.log(`Querying openFDA count: ${countUrl}`);
    
    const countResponse = await fetch(countUrl);
    const countData: FDANdcResponse = await countResponse.json();

    if (countData.error || !countData.results) {
      console.log(`No manufacturers found for ${genericName}: ${countData.error?.message || 'No results'}`);
      return new Response(
        JSON.stringify({ 
          genericName, 
          manufacturers: [],
          message: countData.error?.message || 'No manufacturers found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${countData.results.length} manufacturers for ${genericName}`);

    // Step 2: For each manufacturer, get their product details
    const manufacturers: ManufacturerResult[] = [];

    for (const labeler of countData.results.slice(0, limit)) {
      try {
        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

        const productUrl = `https://api.fda.gov/drug/ndc.json?search=generic_name:"${encodeURIComponent(genericName)}"+AND+labeler_name:"${encodeURIComponent(labeler.term)}"&limit=20`;
        
        console.log(`Fetching products for ${labeler.term}`);
        
        const productResponse = await fetch(productUrl);
        const productData: FDAProductResponse = await productResponse.json();

        if (productData.results && productData.results.length > 0) {
          // Extract labeler code from the first NDC (first 5 digits or first segment)
          const firstNdc = productData.results[0].product_ndc || '';
          const labelerCode = firstNdc.split('-')[0] || '';

          // Collect all NDC codes
          const ndcCodes: string[] = [];
          productData.results.forEach(product => {
            if (product.product_ndc) {
              ndcCodes.push(product.product_ndc);
            }
            product.packaging?.forEach(pkg => {
              if (pkg.package_ndc) {
                ndcCodes.push(pkg.package_ndc);
              }
            });
          });

          // Get common dosage form and strength
          const dosageForm = productData.results[0].dosage_form || null;
          const strength = productData.results[0].active_ingredients?.[0]?.strength || null;

          manufacturers.push({
            labelerName: labeler.term,
            labelerCode,
            ndcCodes: [...new Set(ndcCodes)], // Dedupe
            dosageForm,
            strength,
            productCount: labeler.count
          });

          console.log(`Added ${labeler.term}: ${ndcCodes.length} NDCs`);
        }
      } catch (err) {
        console.error(`Error fetching products for ${labeler.term}:`, err);
        // Continue with other manufacturers
      }
    }

    console.log(`Successfully fetched ${manufacturers.length} manufacturers for ${genericName}`);

    return new Response(
      JSON.stringify({ 
        genericName, 
        manufacturers,
        totalFound: countData.results.length
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
