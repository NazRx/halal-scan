import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type LogLine = string;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const logs: LogLine[] = [];
  const startedAt = Date.now();

  try {
    // Admin check (same style as your other function)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, message: "Missing authorization header", logs, results: [] }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, message: "Invalid token", logs, results: [] }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roles) {
      return new Response(JSON.stringify({ success: false, message: "Admin access required", logs, results: [] }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Number(body?.limit ?? 50), 50);

    logs.push(`✓ Starting batch hydration (limit=${limit})`);

    // Count total unhydrated BEFORE we start
    // A med is "unhydrated" if spl_last_fetched_at IS NULL
    // (This means it has never reached a terminal state: complete or no_data)
    // Partial hydrations intentionally do NOT set spl_last_fetched_at, so they stay in queue
    const { count: totalBefore, error: countError } = await supabase
      .from("rx_meds")
      .select("id", { count: "exact", head: true })
      .is("spl_last_fetched_at", null);

    if (countError) throw countError;

    logs.push(`📊 Total unhydrated medications before: ${totalBefore ?? 0}`);

    // Pull up to N meds that are NOT hydrated yet (spl_last_fetched_at IS NULL)
    // These are meds that have never reached a terminal state (complete or no_data)
    const { data: meds, error: medsError } = await supabase
      .from("rx_meds")
      .select("id, generic_name")
      .is("spl_last_fetched_at", null)
      .order("generic_name", { ascending: true })
      .limit(limit);

    if (medsError) throw medsError;

    if (!meds || meds.length === 0) {
      const elapsedMs = Date.now() - startedAt;
      return new Response(JSON.stringify({
        success: true,
        message: "No unhydrated medications found.",
        logs,
        results: [],
        // Stats
        total_before: totalBefore ?? 0,
        processed: 0,
        remaining_after: 0,
        elapsed_ms: elapsedMs,
        has_more: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ 
      med_id: string; 
      generic_name: string; 
      success: boolean; 
      status: "complete" | "partial" | "no_data" | "error";
      status_detail?: string;
      error?: string;
    }> = [];
    let processed = 0;
    let terminalCount = 0; // Meds that reached terminal state (complete or no_data)

    for (let i = 0; i < meds.length; i++) {
      const med = meds[i];
      logs.push(`→ (${i + 1}/${meds.length}) Hydrating: ${med.generic_name}`);

      // Runtime guard: stop before edge runtime kills us
      const elapsed = Date.now() - startedAt;
      if (elapsed > 45_000) {
        logs.push(`⚠︎ Stopping early to avoid timeout. Elapsed=${elapsed}ms, processed=${processed}`);
        break;
      }

      try {
        // Call the per-med hydrator
        const { data, error } = await supabase.functions.invoke("hydrate-label-data", {
          body: { med_id: med.id },
          headers: {
            Authorization: authHeader,
          },
        });

        processed++;

        if (error) {
          // Actual invocation error (network, auth, etc.)
          results.push({
            med_id: med.id,
            generic_name: med.generic_name,
            success: false,
            status: "error",
            error: error.message,
          });
          logs.push(`✗ Error: ${med.generic_name} - ${error.message}`);
        } else {
          // Classify based on hydrate-label-data response
          const hydrateStatus = data?.hydrate_status || (data?.success ? "complete" : "partial");
          const isSuccess = data?.success !== false;
          
          // Track terminal states (complete or no_data set spl_last_fetched_at)
          if (hydrateStatus === "complete" || hydrateStatus === "no_data") {
            terminalCount++;
          }
          
          results.push({
            med_id: med.id,
            generic_name: med.generic_name,
            success: isSuccess,
            status: hydrateStatus,
            status_detail: data?.hydrate_status_detail || data?.status_reason,
          });
          
          const icon = hydrateStatus === "complete" ? "✓" : 
                       hydrateStatus === "partial" ? "◐" : 
                       hydrateStatus === "no_data" ? "○" : "✗";
          logs.push(`${icon} ${med.generic_name} (${hydrateStatus})`);
        }
      } catch (e) {
        processed++;
        results.push({
          med_id: med.id,
          generic_name: med.generic_name,
          success: false,
          status: "error",
          error: e instanceof Error ? e.message : String(e),
        });
        logs.push(`✗ Exception: ${med.generic_name}`);
      }

      // Throttle to protect openFDA/DailyMed
      await sleep(150);
    }

    // Calculate summary counts
    const complete = results.filter(r => r.status === "complete").length;
    const partial = results.filter(r => r.status === "partial").length;
    const noData = results.filter(r => r.status === "no_data").length;
    const failed = results.filter(r => r.status === "error").length;

    // Calculate remaining_after: 
    // Only terminal states (complete, no_data) remove meds from queue
    // Partial and error stay in queue for retry
    const remainingAfter = Math.max(0, (totalBefore ?? 0) - terminalCount);
    const hasMore = remainingAfter > 0;
    const elapsedMs = Date.now() - startedAt;

    logs.push(`📊 Batch summary: ${processed} processed (${terminalCount} terminal), ${remainingAfter} remaining, has_more=${hasMore}, elapsed=${elapsedMs}ms`);

    return new Response(JSON.stringify({
      success: true,
      message: `Batch complete: ${complete} complete, ${partial} partial, ${noData} no_data, ${failed} failed`,
      logs,
      results,
      // Summary counts
      summary: { complete, partial, no_data: noData, failed },
      // Queue stats for UI
      total_before: totalBefore ?? 0,
      processed,
      terminal_count: terminalCount,
      remaining_after: remainingAfter,
      elapsed_ms: elapsedMs,
      has_more: hasMore,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    const elapsedMs = Date.now() - startedAt;
    logs.push(`Fatal: ${err instanceof Error ? err.message : String(err)}`);
    return new Response(JSON.stringify({
      success: false,
      message: err instanceof Error ? err.message : "Unknown error",
      logs,
      results: [],
      total_before: 0,
      processed: 0,
      remaining_after: 0,
      elapsed_ms: elapsedMs,
      has_more: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});