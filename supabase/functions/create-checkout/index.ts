import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Ramadan date detection (server-side)
function isRamadan(): boolean {
  const RAMADAN_DATES = [
    { start: new Date('2025-02-28'), end: new Date('2025-03-29') },
    { start: new Date('2026-02-17'), end: new Date('2026-03-18') },
    { start: new Date('2027-02-07'), end: new Date('2027-03-08') },
  ];
  
  const today = new Date();
  for (const period of RAMADAN_DATES) {
    if (today >= period.start && today <= period.end) {
      return true;
    }
  }
  return false;
}

// Price IDs for subscription plans
const PRICE_IDS = {
  // Normal pricing
  pro_monthly: "price_1RlS6oKmYDfGMDbI9cO2K0nk",    // HalalRx Pro - $4.99/month
  pro_yearly: "price_1Rq6HuKmYDfGMDbIWJH3Ykza",     // HalalRx Pro Yearly - $39/year
  clinic: "price_1RlS3HKmYDfGMDbIaUbQLqY3",         // HalalRx Clinic - $49/month
  
  // Ramadan pricing (to be created in Stripe dashboard)
  // Using normal prices as fallback until Ramadan-specific prices are created
  ramadan_pro_monthly: "price_1RlS6oKmYDfGMDbI9cO2K0nk", // Should be $2.99/month
  ramadan_pro_yearly: "price_1Rq6HuKmYDfGMDbIWJH3Ykza",  // Should be $29/year
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Get plan, billing period, and Ramadan flag from request body
    const { plan = 'pro', yearly = false, isRamadanOffer = false } = await req.json().catch(() => ({}));
    
    const ramadanActive = isRamadan();
    logStep("Ramadan check", { ramadanActive, isRamadanOffer });
    
    let priceId: string;
    if (plan === 'clinic') {
      priceId = PRICE_IDS.clinic;
    } else if (ramadanActive && isRamadanOffer) {
      // Use Ramadan-specific pricing
      priceId = yearly ? PRICE_IDS.ramadan_pro_yearly : PRICE_IDS.ramadan_pro_monthly;
    } else if (yearly) {
      priceId = PRICE_IDS.pro_yearly;
    } else {
      priceId = PRICE_IDS.pro_monthly;
    }
    
    logStep("Plan selected", { plan, yearly, isRamadanOffer, priceId });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    // Create checkout session
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/app?subscription=success`,
      cancel_url: `${origin}/pricing?subscription=canceled`,
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          is_ramadan_offer: ramadanActive && isRamadanOffer ? 'true' : 'false',
        },
      },
      allow_promotion_codes: true,
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
