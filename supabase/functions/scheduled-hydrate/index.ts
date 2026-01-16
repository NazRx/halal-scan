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

    // Pull up to N meds that are NOT hydrated yet
    const { data: meds, error: medsError } = await supabase
      .from("rx_meds")
      .select("id, generic_name")
      .is("spl_last_fetched_at", null)
      .order("generic_name", { ascending: true })
      .limit(limit);

    if (medsError) throw medsError;

    if (!meds || meds.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No unhydrated medications found.",
        logs,
        results: [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ med_id: string; generic_name: string; success: boolean; status?: string; error?: string }> = [];

    for (let i = 0; i < meds.length; i++) {
      const med = meds[i];
      logs.push(`→ (${i + 1}/${meds.length}) Hydrating: ${med.generic_name}`);

      // Runtime guard: stop before edge runtime kills us
      const elapsed = Date.now() - startedAt;
      if (elapsed > 45_000) {
        logs.push(`⚠︎ Stopping early to avoid timeout. Elapsed=${elapsed}ms`);
        break;
      }

      try {
        // Call your existing per-med hydrator
        const { data, error } = await supabase.functions.invoke("hydrate-label-data", {
          body: { med_id: med.id },
        });

        if (error || !data?.success) {
          results.push({
            med_id: med.id,
            generic_name: med.generic_name,
            success: false,
            status: data?.status,
            error: error?.message || data?.status_reason || "Hydration incomplete",
          });
          logs.push(`✗ Failed: ${med.generic_name}`);
        } else {
          results.push({
            med_id: med.id,
            generic_name: med.generic_name,
            success: true,
            status: data?.status,
          });
          logs.push(`✓ Success: ${med.generic_name} (${data?.status ?? "status unknown"})`);
        }
      } catch (e) {
        results.push({
          med_id: med.id,
          generic_name: med.generic_name,
          success: false,
          error: e instanceof Error ? e.message : String(e),
        });
        logs.push(`✗ Exception: ${med.generic_name}`);
      }

      // Throttle to protect openFDA/DailyMed + avoid worker churn
      await sleep(900);
    }

    const ok = results.filter(r => r.success).length;
    const bad = results.length - ok;

    return new Response(JSON.stringify({
      success: true,
      message: `Batch complete: ${ok} successful, ${bad} failed`,
      logs,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    logs.push(`Fatal: ${err instanceof Error ? err.message : String(err)}`);
    return new Response(JSON.stringify({
      success: false,
      message: err instanceof Error ? err.message : "Unknown error",
      logs,
      results: [],
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
