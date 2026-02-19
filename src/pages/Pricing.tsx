import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, Shield, Sparkles, Users, Loader2, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, session } = useAuth();
  const { tier, isPro, isClinic } = useSubscription();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const plans = [
    {
      id: "free",
      name: "Explore",
      price: "$0",
      period: "forever",
      subtitle: "For quick halal clarity.",
      features: [
        "Unlimited OTC scans",
        "5 lifetime Rx scans",
        "Clear halal status (Halal / Not Halal / Unclear)",
        "Basic ingredient list",
        "Community explanations",
      ],
      limits: [
        "No manufacturer comparison",
        "No ingredient source references",
        "No confidence score",
        "No exports",
        "Ads appear after scan #3",
      ],
      cta: "Start Free",
      ctaNote: "No credit card required",
      popular: false,
      icon: Shield,
    },
    {
      id: "pro",
      name: "Protect",
      price: "$4.99",
      period: "month",
      subtitle: "For Muslims who cannot afford doubt.",
      features: [
        "Everything in Free",
        "Unlimited OTC + Rx scans",
        "Manufacturer-level comparison",
        "Ingredient rulings with scholarly sources",
        "Confidence score with explanation",
        "Exportable PDF reports",
        "No ads",
        "Priority support",
      ],
      limits: [],
      cta: "Start Free Trial",
      ctaNote: "7-day free trial — no credit card required",
      popular: true,
      icon: Sparkles,
    },
    {
      id: "clinic",
      name: "Clinic",
      price: "From $49",
      period: "month",
      subtitle: "For healthcare teams serving Muslim patients.",
      features: [
        "Everything in Protect",
        "Multi-user access",
        "Bulk lookups",
        "Patient-friendly exports",
        "Optional API access",
        "Custom branding",
        "Dedicated support",
      ],
      limits: [],
      compliance: "HIPAA-aware workflows — no patient identifiers stored.",
      cta: "Request Demo",
      ctaNote: null,
      popular: false,
      icon: Users,
    },
  ];

  const scanPacks = [
    { credits: 25, price: "$3.99", note: "Credits never expire." },
    { credits: 100, price: "$9.99", note: "Best value.", highlight: true },
  ];

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      toast.info("Please sign in first", { description: "You need to be signed in to subscribe." });
      navigate("/auth");
      return;
    }
    if (planId === "clinic") {
      toast.info("Contact us for Professional plans", { description: "Email us at support@amanahrx.com for custom pricing." });
      return;
    }
    if (planId === "free") {
      navigate("/app");
      return;
    }
    setLoadingAction(`subscribe-${planId}`);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error("Failed to start checkout", { description: "Please try again or contact support." });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBuyCredits = async (credits: number) => {
    if (!isAuthenticated) {
      toast.info("Please sign in first", { description: "You need to be signed in to purchase credits." });
      navigate("/auth");
      return;
    }
    setLoadingAction(`credits-${credits}`);
    try {
      const { data, error } = await supabase.functions.invoke('create-credit-purchase', {
        body: { credits },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error('Credit purchase error:', err);
      toast.error("Failed to start checkout");
    } finally {
      setLoadingAction(null);
    }
  };

  const getCurrentPlanBadge = (planId: string) => {
    if (planId === "free" && tier === "free") return true;
    if (planId === "pro" && isPro && !isClinic) return true;
    if (planId === "clinic" && isClinic) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20" style={{ background: "#F4FBFA" }}>
        {/* SECTION 1 — Header */}
        <section className="text-center px-4 mb-16 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <h1 className="font-sans text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground leading-[1.15]">
              Choose Clarity That Fits
              <span className="block" style={{ color: "#2A8C7F" }}>Your Needs</span>
            </h1>
            <div className="flex justify-center mb-5">
              <div className="h-0.5 w-12 rounded-full" style={{ background: "rgba(42,140,127,0.30)" }} />
            </div>
            <p className="text-lg text-muted-foreground leading-[1.8]">
              Start free. Upgrade when you need deeper formulation insight.
            </p>
          </motion.div>
        </section>

        {/* SECTION 2 — Pricing Cards */}
        <section className="px-4 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {plans.map((plan, index) => {
              const isCurrentPlan = getCurrentPlanBadge(plan.id);
              const isLoading = loadingAction?.startsWith(`subscribe-${plan.id}`);
              const Icon = plan.icon;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
                >
                  <div
                    className="relative p-6 h-full flex flex-col rounded-[18px] transition-shadow duration-300 bg-white"
                    style={{
                      border: plan.popular ? "2px solid #67C5B6" : "1px solid #E6F5F2",
                      boxShadow: plan.popular
                        ? "0 20px 40px rgba(42,140,127,0.12)"
                        : "0 10px 25px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* Badge */}
                    {plan.popular && !isCurrentPlan && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-semibold"
                        style={{ background: "#67C5B6" }}
                      >
                        Most Popular
                      </div>
                    )}
                    {isCurrentPlan && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-semibold"
                        style={{ background: "#2A8C7F" }}
                      >
                        Your Plan
                      </div>
                    )}

                    {/* Header */}
                    <div className="mb-5">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{
                            background: plan.popular ? "rgba(42,140,127,0.10)" : "rgba(42,140,127,0.06)",
                          }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{ color: "#2A8C7F" }}
                          />
                        </div>
                        <h2 className="text-xl font-bold">{plan.name}</h2>
                      </div>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                        <span className="text-muted-foreground">/ {plan.period}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                    </div>

                    {/* Features */}
                    <div className="flex-1 space-y-4">
                      <ul className="space-y-2.5">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5 text-sm">
                            <Check className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#2A8C7F" }} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {plan.limits.length > 0 && (
                        <>
                          <div className="border-t" style={{ borderColor: "#E6F5F2" }} />
                          <ul className="space-y-2">
                            {plan.limits.map((limit) => (
                              <li key={limit} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                <span className="flex-shrink-0 mt-0.5 w-4 text-center">—</span>
                                <span>{limit}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      {plan.compliance && (
                        <p
                          className="text-xs text-muted-foreground p-3 rounded-lg"
                          style={{ background: "rgba(42,140,127,0.04)", border: "1px solid #E6F5F2" }}
                        >
                          {plan.compliance}
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-6">
                      {plan.popular ? (
                        <button
                          className="w-full py-3 px-6 rounded-[14px] font-semibold text-white text-base transition-all duration-200 disabled:opacity-60"
                          style={{ background: isCurrentPlan ? "#9AA6A3" : "#2A8C7F" }}
                          onClick={() => handleSubscribe(plan.id)}
                          disabled={isLoading || isCurrentPlan}
                          onMouseEnter={e => {
                            if (!isCurrentPlan) (e.currentTarget as HTMLElement).style.background = "#237469";
                          }}
                          onMouseLeave={e => {
                            if (!isCurrentPlan) (e.currentTarget as HTMLElement).style.background = "#2A8C7F";
                          }}
                        >
                          {isLoading && <Loader2 className="h-4 w-4 animate-spin inline mr-2" />}
                          {isCurrentPlan ? "Current Plan" : plan.cta}
                        </button>
                      ) : plan.id === "clinic" ? (
                        <button
                          className="w-full py-3 px-6 rounded-[14px] font-semibold text-white text-base transition-all duration-200"
                          style={{ background: "#67C5B6" }}
                          onClick={() => handleSubscribe(plan.id)}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#58BCAE")}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#67C5B6")}
                        >
                          {plan.cta}
                        </button>
                      ) : (
                        <button
                          className="w-full py-3 px-6 rounded-[14px] font-semibold text-base transition-all duration-200 bg-white disabled:opacity-60"
                          style={{
                            border: "1px solid #2A8C7F",
                            color: "#2A8C7F",
                          }}
                          onClick={() => handleSubscribe(plan.id)}
                          disabled={isLoading || isCurrentPlan}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#F4FBFA")}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#FFFFFF")}
                        >
                          {isLoading && <Loader2 className="h-4 w-4 animate-spin inline mr-2" />}
                          {isCurrentPlan ? "Current Plan" : plan.cta}
                        </button>
                      )}
                      {plan.ctaNote && !isCurrentPlan && (
                        <p className="text-xs text-center text-muted-foreground mt-2.5">
                          {plan.ctaNote}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3 — Scan Packs */}
        <section className="px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="flex items-center gap-2 justify-center mb-2">
              <CreditCard className="h-5 w-5" style={{ color: "#2A8C7F" }} />
              <h2 className="text-2xl font-bold">No subscription? Use scan credits.</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Pay once. Credits never expire.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {scanPacks.map((pack) => (
                <div
                  key={pack.credits}
                  className="p-5 text-center flex flex-col items-center gap-2 rounded-[18px] bg-white"
                  style={{
                    border: pack.highlight ? "1px solid #67C5B6" : "1px solid #E6F5F2",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
                  }}
                >
                  <span className="text-2xl font-bold">{pack.credits} scans</span>
                  <span className="text-lg font-semibold" style={{ color: "#2A8C7F" }}>{pack.price}</span>
                  <span className="text-xs text-muted-foreground">{pack.note}</span>
                  <button
                    className="mt-2 w-full py-2 px-4 rounded-[10px] text-sm font-medium transition-all duration-200 bg-white"
                    style={{ border: "1px solid #2A8C7F", color: "#2A8C7F" }}
                    onClick={() => handleBuyCredits(pack.credits)}
                    disabled={!!loadingAction?.startsWith("credits")}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#F4FBFA")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#FFFFFF")}
                  >
                    {loadingAction === `credits-${pack.credits}` && (
                      <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                    )}
                    Buy {pack.credits}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* SECTION 4 — Trust Footer */}
        <section className="px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-lg mx-auto space-y-2"
          >
            <p className="text-sm font-medium text-foreground">
              Built by Muslim healthcare professionals. Independent. Transparent. Community-driven.
            </p>
            <p className="text-xs text-muted-foreground">
              AmanahRx does not issue rulings. Always consult qualified scholars and healthcare providers.
            </p>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
