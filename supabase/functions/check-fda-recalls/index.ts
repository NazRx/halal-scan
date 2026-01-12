import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecallInfo {
  recallNumber: string;
  recallingFirm: string;
  reason: string;
  status: string;
  classification: string;
  productDescription: string;
  recallInitiationDate: string;
}

interface ManufacturerRecallStatus {
  labelerName: string;
  hasActiveRecall: boolean;
  recalls: RecallInfo[];
}

interface FDAEnforcementResponse {
  results?: Array<{
    recall_number: string;
    recalling_firm: string;
    reason_for_recall: string;
    status: string;
    classification: string;
    product_description: string;
    recall_initiation_date: string;
  }>;
  error?: { message: string };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { genericName, manufacturers } = await req.json();

    if (!genericName) {
      return new Response(
        JSON.stringify({ error: 'genericName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking FDA recalls for: ${genericName}`);

    // Query openFDA enforcement (recalls) endpoint
    const recallUrl = `https://api.fda.gov/drug/enforcement.json?search=openfda.generic_name:"${encodeURIComponent(genericName)}"&limit=100`;
    
    console.log(`Querying openFDA enforcement: ${recallUrl}`);
    
    const response = await fetch(recallUrl);
    const data: FDAEnforcementResponse = await response.json();

    const allRecalls: RecallInfo[] = [];
    
    if (data.results) {
      for (const recall of data.results) {
        allRecalls.push({
          recallNumber: recall.recall_number,
          recallingFirm: recall.recalling_firm,
          reason: recall.reason_for_recall,
          status: recall.status,
          classification: recall.classification,
          productDescription: recall.product_description,
          recallInitiationDate: recall.recall_initiation_date
        });
      }
    }

    console.log(`Found ${allRecalls.length} recalls for ${genericName}`);

    // If manufacturers provided, check each one for recalls
    const manufacturerStatuses: ManufacturerRecallStatus[] = [];
    
    if (manufacturers && Array.isArray(manufacturers)) {
      for (const mfr of manufacturers) {
        const mfrRecalls = allRecalls.filter(recall => 
          recall.recallingFirm.toLowerCase().includes(mfr.toLowerCase()) ||
          mfr.toLowerCase().includes(recall.recallingFirm.toLowerCase().split(' ')[0])
        );
        
        manufacturerStatuses.push({
          labelerName: mfr,
          hasActiveRecall: mfrRecalls.some(r => r.status === 'Ongoing'),
          recalls: mfrRecalls
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        genericName, 
        totalRecalls: allRecalls.length,
        recalls: allRecalls,
        manufacturerStatuses: manufacturerStatuses.length > 0 ? manufacturerStatuses : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in check-fda-recalls:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
