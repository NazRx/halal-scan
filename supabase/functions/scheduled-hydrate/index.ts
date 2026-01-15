import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HydrateResult {
  med_id: string;
  generic_name: string;
  success: boolean;
  status?: string;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const logs: string[] = [];
  const results: HydrateResult[] = [];
  
  try {
    logs.push(`[${new Date().toISOString()}] Starting scheduled hydration job`);

    // Find rx_meds that haven't been hydrated yet (no spl_last_fetched_at)
    const { data: unhydratedMeds, error: fetchError } = await supabase
      .from('rx_meds')
      .select('id, generic_name')
      .is('spl_last_fetched_at', null)
      .limit(50); // Process up to 50 per run to avoid timeouts

    if (fetchError) {
      throw new Error(`Failed to fetch unhydrated meds: ${fetchError.message}`);
    }

    if (!unhydratedMeds || unhydratedMeds.length === 0) {
      logs.push('No unhydrated medications found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No medications to hydrate',
          logs,
          results 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logs.push(`Found ${unhydratedMeds.length} medications to hydrate`);

    // Process each medication
    for (const med of unhydratedMeds) {
      try {
        logs.push(`Processing: ${med.generic_name} (${med.id})`);

        // Call the hydrate-label-data function
        const response = await fetch(`${supabaseUrl}/functions/v1/hydrate-label-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ med_id: med.id }),
        });

        const result = await response.json();

        if (result.success) {
          logs.push(`✓ Successfully hydrated: ${med.generic_name}`);
          results.push({
            med_id: med.id,
            generic_name: med.generic_name,
            success: true,
            status: result.status,
          });
        } else {
          logs.push(`✗ Failed to hydrate: ${med.generic_name} - ${result.error || 'Unknown error'}`);
          results.push({
            med_id: med.id,
            generic_name: med.generic_name,
            success: false,
            error: result.error || 'Unknown error',
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (medError) {
        const errorMsg = medError instanceof Error ? medError.message : 'Unknown error';
        logs.push(`✗ Error processing ${med.generic_name}: ${errorMsg}`);
        results.push({
          med_id: med.id,
          generic_name: med.generic_name,
          success: false,
          error: errorMsg,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    logs.push(`[${new Date().toISOString()}] Scheduled hydration complete: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} medications: ${successCount} success, ${failCount} failed`,
        logs,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logs.push(`[${new Date().toISOString()}] Fatal error: ${errorMsg}`);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMsg,
        logs,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
