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
      toast.info("Contact us for Professional plans", { description: "Email us at support@halalrx.com for custom pricing." });
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

      <main className="flex-1 pt-24 pb-20">
        {/* SECTION 1 — Header */}
        <section className="text-center px-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Choose Your Level of
              <span className="block text-primary">Halal Certainty</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Start free. Upgrade when you need deeper verification. No pressure. No hidden fees.
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
                  <Card className={`p-6 h-full flex flex-col transition-shadow duration-300 ${
                    plan.popular
                      ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                      : "hover:shadow-md"
                  } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}>
                    {/* Badge */}
                    {plan.popular && !isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-hero text-primary-foreground text-xs font-semibold">
                        Most Popular
                      </div>
                    )}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        Your Plan
                      </div>
                    )}

                    {/* Header */}
                    <div className="mb-5">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className={`p-2 rounded-lg ${
                          plan.popular ? "bg-primary/10" : "bg-muted"
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            plan.popular ? "text-primary" : "text-muted-foreground"
                          }`} />
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
                            <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Limits divider */}
                      {plan.limits.length > 0 && (
                        <>
                          <div className="border-t" />
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
                        <p className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg border">
                          {plan.compliance}
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-6">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "gradient-hero text-primary-foreground hover:opacity-90"
                            : ""
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                        size="lg"
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isLoading || isCurrentPlan}
                      >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        {isCurrentPlan ? "Current Plan" : plan.cta}
                      </Button>
                      {plan.ctaNote && !isCurrentPlan && (
                        <p className="text-xs text-center text-muted-foreground mt-2.5">
                          {plan.ctaNote}
                        </p>
                      )}
                    </div>
                  </Card>
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
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-bold">No subscription? Use scan credits.</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Pay once. Credits never expire.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {scanPacks.map((pack) => (
                <Card
                  key={pack.credits}
                  className={`p-5 text-center flex flex-col items-center gap-2 ${
                    pack.highlight ? "border-primary/30 shadow-sm" : ""
                  }`}
                >
                  <span className="text-2xl font-bold">{pack.credits} scans</span>
                  <span className="text-lg font-semibold text-primary">{pack.price}</span>
                  <span className="text-xs text-muted-foreground">{pack.note}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => handleBuyCredits(pack.credits)}
                    disabled={loadingAction?.startsWith("credits")}
                  >
                    {loadingAction === `credits-${pack.credits}` && (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    )}
                    Buy {pack.credits}
                  </Button>
                </Card>
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
            <p className="text-sm font-medium">
              Built by a U.S. hospital pharmacist. Designed for religious clarity.
            </p>
            <p className="text-xs text-muted-foreground">
              No medical advice. Always consult your healthcare provider.
            </p>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
