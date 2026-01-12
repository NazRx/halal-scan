import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RxNormResult {
  rxcui: string;
  name: string;
  synonym?: string;
  tty: string; // Term type (e.g., IN = Ingredient, BN = Brand Name)
}

interface RxNormDrugResponse {
  drugGroup?: {
    conceptGroup?: Array<{
      tty: string;
      conceptProperties?: Array<{
        rxcui: string;
        name: string;
        synonym?: string;
        tty: string;
      }>;
    }>;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { genericName } = await req.json();

    if (!genericName) {
      return new Response(
        JSON.stringify({ error: 'genericName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching RxNorm data for: ${genericName}`);

    // Query RxNorm drugs endpoint
    const rxnormUrl = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(genericName)}`;
    
    console.log(`Querying RxNorm: ${rxnormUrl}`);
    
    const response = await fetch(rxnormUrl);
    const data: RxNormDrugResponse = await response.json();

    const results: RxNormResult[] = [];

    if (data.drugGroup?.conceptGroup) {
      for (const group of data.drugGroup.conceptGroup) {
        if (group.conceptProperties) {
          for (const concept of group.conceptProperties) {
            results.push({
              rxcui: concept.rxcui,
              name: concept.name,
              synonym: concept.synonym,
              tty: concept.tty
            });
          }
        }
      }
    }

    // Find the best match - prefer IN (Ingredient) type
    const ingredientMatch = results.find(r => r.tty === 'IN');
    const primaryRxcui = ingredientMatch?.rxcui || results[0]?.rxcui || null;

    console.log(`Found ${results.length} RxNorm concepts for ${genericName}, primary RxCUI: ${primaryRxcui}`);

    return new Response(
      JSON.stringify({ 
        genericName, 
        rxcui: primaryRxcui,
        allConcepts: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in fetch-rxnorm:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
