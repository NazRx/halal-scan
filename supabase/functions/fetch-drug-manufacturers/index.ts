import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const manufacturers: ManufacturerResult[] = [];

    // Step 1: Find the BRAND manufacturer (NDA holder) first
    console.log('Searching for brand manufacturer (NDA)...');
    const brandUrl = `https://api.fda.gov/drug/ndc.json?search=generic_name:"${encodeURIComponent(genericName)}"+AND+marketing_category:"NDA"&limit=10`;
    
    try {
      const brandResponse = await fetch(brandUrl);
      const brandData: FDAProductResponse = await brandResponse.json();

      if (brandData.results && brandData.results.length > 0) {
        // Group by labeler to find the primary brand manufacturer
        const brandsByLabeler = new Map<string, typeof brandData.results>();
        
        for (const product of brandData.results) {
          const labeler = product.labeler_name;
          if (!brandsByLabeler.has(labeler)) {
            brandsByLabeler.set(labeler, []);
          }
          brandsByLabeler.get(labeler)!.push(product);
        }

        // Take the brand manufacturer with most products (usually the original)
        let topBrandLabeler = '';
        let topBrandProducts: typeof brandData.results = [];
        
        for (const [labeler, products] of brandsByLabeler) {
          if (products.length > topBrandProducts.length) {
            topBrandLabeler = labeler;
            topBrandProducts = products;
          }
        }

        if (topBrandProducts.length > 0) {
          const firstProduct = topBrandProducts[0];
          const labelerCode = firstProduct.product_ndc?.split('-')[0] || '';
          
          const ndcCodes: string[] = [];
          topBrandProducts.forEach(product => {
            if (product.product_ndc) ndcCodes.push(product.product_ndc);
            product.packaging?.forEach(pkg => {
              if (pkg.package_ndc) ndcCodes.push(pkg.package_ndc);
            });
          });

          manufacturers.push({
            labelerName: topBrandLabeler,
            labelerCode,
            brandName: firstProduct.brand_name || undefined,
            isBrand: true,
            marketingCategory: 'NDA',
            ndcCodes: [...new Set(ndcCodes)],
            dosageForm: firstProduct.dosage_form || null,
            strength: firstProduct.active_ingredients?.[0]?.strength || null,
            productCount: topBrandProducts.length
          });

          console.log(`Found brand manufacturer: ${topBrandLabeler} (${firstProduct.brand_name})`);
        }
      }
    } catch (brandErr) {
      console.log('No brand (NDA) manufacturer found or error:', brandErr);
    }

    // Step 2: Get top generic manufacturers (ANDA) by product count
    console.log('Searching for top generic manufacturers (ANDA)...');
    const countUrl = `https://api.fda.gov/drug/ndc.json?search=generic_name:"${encodeURIComponent(genericName)}"+AND+marketing_category:"ANDA"&count=labeler_name.exact&limit=${limit}`;
    
    console.log(`Querying openFDA count: ${countUrl}`);
    
    const countResponse = await fetch(countUrl);
    const countData: FDANdcResponse = await countResponse.json();

    if (countData.results && countData.results.length > 0) {
      console.log(`Found ${countData.results.length} generic manufacturers for ${genericName}`);

      // For each manufacturer, get their product details
      for (const labeler of countData.results.slice(0, limit)) {
        // Skip if this manufacturer is already added as brand
        if (manufacturers.some(m => m.labelerName === labeler.term)) {
          continue;
        }

        try {
          // Add small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 100));

          const productUrl = `https://api.fda.gov/drug/ndc.json?search=generic_name:"${encodeURIComponent(genericName)}"+AND+labeler_name:"${encodeURIComponent(labeler.term)}"+AND+marketing_category:"ANDA"&limit=20`;
          
          console.log(`Fetching products for ${labeler.term}`);
          
          const productResponse = await fetch(productUrl);
          const productData: FDAProductResponse = await productResponse.json();

          if (productData.results && productData.results.length > 0) {
            const firstNdc = productData.results[0].product_ndc || '';
            const labelerCode = firstNdc.split('-')[0] || '';

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

            const dosageForm = productData.results[0].dosage_form || null;
            const strength = productData.results[0].active_ingredients?.[0]?.strength || null;

            manufacturers.push({
              labelerName: labeler.term,
              labelerCode,
              isBrand: false,
              marketingCategory: 'ANDA',
              ndcCodes: [...new Set(ndcCodes)],
              dosageForm,
              strength,
              productCount: labeler.count
            });

            console.log(`Added generic: ${labeler.term}: ${ndcCodes.length} NDCs, ${labeler.count} products`);
          }
        } catch (err) {
          console.error(`Error fetching products for ${labeler.term}:`, err);
        }
      }
    } else {
      // Fallback: Try without marketing category filter if no ANDA results
      console.log('No ANDA results, trying general search...');
      const fallbackUrl = `https://api.fda.gov/drug/ndc.json?search=generic_name:"${encodeURIComponent(genericName)}"&count=labeler_name.exact&limit=${limit}`;
      
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData: FDANdcResponse = await fallbackResponse.json();

      if (fallbackData.results) {
        for (const labeler of fallbackData.results.slice(0, limit)) {
          if (manufacturers.some(m => m.labelerName === labeler.term)) continue;

          try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const productUrl = `https://api.fda.gov/drug/ndc.json?search=generic_name:"${encodeURIComponent(genericName)}"+AND+labeler_name:"${encodeURIComponent(labeler.term)}"&limit=20`;
            
            const productResponse = await fetch(productUrl);
            const productData: FDAProductResponse = await productResponse.json();

            if (productData.results && productData.results.length > 0) {
              const firstProduct = productData.results[0];
              const labelerCode = firstProduct.product_ndc?.split('-')[0] || '';
              const marketingCategory = firstProduct.marketing_category || 'UNKNOWN';
              const isBrand = marketingCategory === 'NDA' || marketingCategory === 'BLA';

              const ndcCodes: string[] = [];
              productData.results.forEach(product => {
                if (product.product_ndc) ndcCodes.push(product.product_ndc);
                product.packaging?.forEach(pkg => {
                  if (pkg.package_ndc) ndcCodes.push(pkg.package_ndc);
                });
              });

              manufacturers.push({
                labelerName: labeler.term,
                labelerCode,
                brandName: isBrand ? firstProduct.brand_name : undefined,
                isBrand,
                marketingCategory,
                ndcCodes: [...new Set(ndcCodes)],
                dosageForm: firstProduct.dosage_form || null,
                strength: firstProduct.active_ingredients?.[0]?.strength || null,
                productCount: labeler.count
              });

              console.log(`Added (fallback): ${labeler.term}: ${isBrand ? 'BRAND' : 'GENERIC'}`);
            }
          } catch (err) {
            console.error(`Error in fallback for ${labeler.term}:`, err);
          }
        }
      }
    }

    // Sort: brand first, then generics by product count descending
    manufacturers.sort((a, b) => {
      if (a.isBrand && !b.isBrand) return -1;
      if (!a.isBrand && b.isBrand) return 1;
      return b.productCount - a.productCount;
    });

    console.log(`Successfully fetched ${manufacturers.length} manufacturers for ${genericName} (${manufacturers.filter(m => m.isBrand).length} brand, ${manufacturers.filter(m => !m.isBrand).length} generic)`);

    return new Response(
      JSON.stringify({ 
        genericName, 
        manufacturers,
        brandCount: manufacturers.filter(m => m.isBrand).length,
        genericCount: manufacturers.filter(m => !m.isBrand).length,
        totalFound: manufacturers.length
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
