import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADD-SCAN-CREDITS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Get session_id from request body (passed after successful Stripe checkout)
    const { session_id } = await req.json().catch(() => ({}));
    
    if (!session_id) {
      throw new Error("Missing session_id");
    }

    logStep("Verifying Stripe session", { session_id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session to verify payment
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    const userId = session.metadata?.user_id;
    const credits = parseInt(session.metadata?.credits || '0', 10);
    const type = session.metadata?.type;

    if (!userId || !credits || type !== 'scan_credits') {
      throw new Error("Invalid session metadata");
    }

    logStep("Session verified", { userId, credits, paymentStatus: session.payment_status });

    // Add credits to user's profile
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('purchased_credits')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const newCredits = (profile?.purchased_credits || 0) + credits;

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ purchased_credits: newCredits })
      .eq('id', userId);

    if (updateError) throw updateError;

    logStep("Credits added successfully", { userId, previousCredits: profile?.purchased_credits, newCredits });

    return new Response(JSON.stringify({ 
      success: true, 
      credits_added: credits,
      total_credits: newCredits 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in add-scan-credits", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
