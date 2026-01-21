import { useState } from "react";
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
import { useScanCredits } from "@/hooks/useScanCredits";
import { toast } from "sonner";

const plans = [
  {
    id: "free",
    name: "Explore",
    subtitle: "Free",
    price: "$0",
    period: "forever",
    description: "Try it safely. No commitment.",
    features: [
      "Unlimited OTC scans",
      "10 lifetime Rx scans",
      "Clear halal status (Halal / Not Halal / Unclear)",
      "Ingredient list (basic)",
      "Community explanations",
    ],
    limits: [
      "No manufacturer comparison",
      "No exports",
      "Ads appear after scan #5",
    ],
    cta: "Start Free",
    popular: false,
    icon: Shield,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: "pro",
    name: "Protect",
    subtitle: "Pro",
    price: "$4.99",
    yearlyPrice: "$39",
    period: "per month",
    yearlyPeriod: "per year",
    yearlySavings: "Save 35%",
    description: "For Muslims who rely on medications and want certainty.",
    features: [
      "Everything in Free, plus:",
      "Unlimited OTC + Rx scans",
      "Manufacturer-level comparison",
      "Ingredient rulings with sources",
      "Confidence score with explanation",
      "Export & share reports (PDF)",
      "No ads",
      "Priority support",
    ],
    limits: [],
    cta: "Start Free Trial",
    popular: true,
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-primary/10",
    trialDays: 7,
  },
  {
    id: "clinic",
    name: "Professional",
    subtitle: "Clinic",
    price: "From $49",
    period: "per month",
    description: "For pharmacists, clinics, and healthcare teams.",
    features: [
      "Everything in Protect, plus:",
      "Multi-user access",
      "Bulk lookups",
      "Exportable patient-friendly reports",
      "Optional API access",
      "Custom branding (Pro tier)",
      "Dedicated support",
    ],
    limits: [],
    compliance: "HIPAA-aware workflows — no patient identifiers stored.",
    cta: "Request Access",
    popular: false,
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
];

const scanPacks = [
  { credits: 25, price: "$2.99" },
  { credits: 100, price: "$6.99" },
];

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! Protect plan includes a 7-day free trial. No credit card required to start.",
  },
  {
    question: "What are scan credits?",
    answer: "Scan credits let you check Rx medications without a subscription. Credits never expire and can be used anytime.",
  },
  {
    question: "How is halal status determined?",
    answer: "Our pharmacist team reviews each ingredient against established Islamic rulings. We respect the principle of necessity (darura) and provide clear confidence levels.",
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, session } = useAuth();
  const { tier, isPro, isClinic } = useSubscription();
  const { freeScansRemaining, purchasedCredits, FREE_RX_SCAN_LIMIT } = useScanCredits();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async (planId: string, yearly = false) => {
    if (!isAuthenticated) {
      toast.info("Please sign in first", {
        description: "You need to be signed in to subscribe.",
      });
      navigate("/auth");
      return;
    }

    if (planId === "clinic") {
      toast.info("Contact us for Professional plans", {
        description: "Email us at support@halalrx.com for custom pricing.",
      });
      return;
    }

    if (planId === "free") {
      navigate("/app");
      return;
    }

    setLoadingAction(`subscribe-${planId}-${yearly ? 'yearly' : 'monthly'}`);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId, yearly },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error("Failed to start checkout", {
        description: "Please try again or contact support.",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBuyCredits = async (credits: number) => {
    if (!isAuthenticated) {
      toast.info("Please sign in first", {
        description: "You need to be signed in to purchase credits.",
      });
      navigate("/auth");
      return;
    }

    setLoadingAction(`credits-${credits}`);
    try {
      const { data, error } = await supabase.functions.invoke('create-credit-purchase', {
        body: { credits },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
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
      
      <main className="flex-1 py-16">
        <div className="container px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Know what you're taking.
              <span className="block text-primary">With confidence.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Instant halal screening for medications — built by pharmacists, guided by Islamic principles.
            </p>
          </motion.div>

          {/* Billing toggle for Pro */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 p-1 rounded-full bg-muted">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === 'monthly' 
                    ? 'bg-background shadow text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setBillingPeriod('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  billingPeriod === 'yearly' 
                    ? 'bg-background shadow text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setBillingPeriod('yearly')}
              >
                Yearly
                <span className="text-xs bg-status-halal-bg text-status-halal px-2 py-0.5 rounded-full">
                  Save 35%
                </span>
              </button>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            {plans.map((plan, index) => {
              const isCurrentPlan = getCurrentPlanBadge(plan.id);
              const isLoading = loadingAction?.startsWith(`subscribe-${plan.id}`);
              const Icon = plan.icon;
              const showYearly = billingPeriod === 'yearly' && !!plan.yearlyPrice;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
                >
                  <Card className={`p-6 h-full flex flex-col ${
                    plan.popular
                      ? "border-primary shadow-xl shadow-primary/10 bg-gradient-to-b from-primary/5 to-transparent"
                      : ""
                  } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}>
                    {plan.popular && !isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-hero text-primary-foreground text-xs font-medium">
                        Most Popular
                      </div>
                    )}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        Your Plan
                      </div>
                    )}

                    {/* Plan header */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${plan.bgColor}`}>
                          <Icon className={`h-5 w-5 ${plan.color}`} />
                        </div>
                        <div>
                          <h2 className="font-bold text-lg">{plan.name}</h2>
                          <span className="text-xs text-muted-foreground">{plan.subtitle}</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">
                          {showYearly ? plan.yearlyPrice : plan.price}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          /{showYearly ? plan.yearlyPeriod : plan.period}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                    </div>

                    {/* Features */}
                    <div className="flex-1">
                      <ul className="space-y-2 mb-4">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm">
                            <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-status-halal-bg flex items-center justify-center">
                              <Check className="h-2.5 w-2.5 text-status-halal" />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {plan.limits.length > 0 && (
                        <ul className="space-y-2 mb-4">
                          {plan.limits.map((limit) => (
                            <li key={limit} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-[10px]">—</span>
                              </div>
                              <span>{limit}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {plan.compliance && (
                        <p className="text-xs text-muted-foreground mb-4 p-2 bg-muted/50 rounded">
                          {plan.compliance}
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "gradient-hero text-primary-foreground hover:opacity-90"
                          : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleSubscribe(plan.id, showYearly)}
                      disabled={isLoading || isCurrentPlan}
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {isCurrentPlan ? "Current Plan" : plan.cta}
                    </Button>
                    
                    {plan.trialDays && !isCurrentPlan && (
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        🎁 {plan.trialDays}-day free trial — no credit card
                      </p>
                    )}
                    
                    {plan.id === 'free' && (
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        No credit card required
                      </p>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Scan Credit Packs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto mb-16"
          >
            <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900">
                  <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold">One-Time Scan Packs</h3>
                  <p className="text-sm text-muted-foreground">No subscription required</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {scanPacks.map((pack) => (
                  <Button
                    key={pack.credits}
                    variant="outline"
                    className="flex flex-col h-auto py-3 bg-background hover:bg-violet-50 dark:hover:bg-violet-950"
                    onClick={() => handleBuyCredits(pack.credits)}
                    disabled={loadingAction?.startsWith('credits')}
                  >
                    {loadingAction === `credits-${pack.credits}` && (
                      <Loader2 className="h-4 w-4 mb-1 animate-spin" />
                    )}
                    <span className="font-semibold">{pack.credits} Scans</span>
                    <span className="text-sm text-muted-foreground">{pack.price}</span>
                  </Button>
                ))}
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                Credits never expire • Use anytime
              </p>
            </Card>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm text-muted-foreground">
              Designed by a PharmD · Islamic necessity (darura) respected
            </p>
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-8">Common Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.question} className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
