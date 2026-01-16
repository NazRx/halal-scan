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
  
  // Parse request body for batch size override
  let batchSize = 75; // Default batch size (increased from 50)
  try {
    const body = await req.json();
    if (body?.batch_size && typeof body.batch_size === 'number') {
      batchSize = Math.min(Math.max(body.batch_size, 10), 100); // Clamp between 10-100
    }
  } catch {
    // No body or invalid JSON, use defaults
  }
  
  try {
    logs.push(`[${new Date().toISOString()}] Starting scheduled hydration job (batch size: ${batchSize})`);

    // Get total count of unhydrated meds first
    const { count: totalUnhydrated } = await supabase
      .from('rx_meds')
      .select('id', { count: 'exact', head: true })
      .is('spl_last_fetched_at', null);

    logs.push(`Total unhydrated medications: ${totalUnhydrated || 0}`);

    // Find rx_meds that haven't been hydrated yet (no spl_last_fetched_at)
    const { data: unhydratedMeds, error: fetchError } = await supabase
      .from('rx_meds')
      .select('id, generic_name')
      .is('spl_last_fetched_at', null)
      .limit(batchSize);

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
          results,
          remaining_count: 0,
          total_processed: 0,
          batch_size: batchSize,
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
        await new Promise(resolve => setTimeout(resolve, 300));

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
    
    // Re-count remaining after processing
    const { count: remainingCount } = await supabase
      .from('rx_meds')
      .select('id', { count: 'exact', head: true })
      .is('spl_last_fetched_at', null);
    
    logs.push(`[${new Date().toISOString()}] Scheduled hydration complete: ${successCount} success, ${failCount} failed, ${remainingCount || 0} remaining`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} medications: ${successCount} success, ${failCount} failed`,
        logs,
        results,
        remaining_count: remainingCount || 0,
        total_processed: results.length,
        batch_size: batchSize,
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
        remaining_count: -1,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
