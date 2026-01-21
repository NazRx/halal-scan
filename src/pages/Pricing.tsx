import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, Zap, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for occasional use",
    features: [
      "5 scans per day",
      "Basic ingredient info",
      "OTC products only",
      "Community support",
      "Ads supported",
    ],
    notIncluded: [
      "Rx medications",
      "Manufacturer variants",
      "Detailed reports",
      "Export & share",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "per month",
    description: "For individuals who need full access",
    features: [
      "Unlimited scans",
      "OTC + Rx medications",
      "Manufacturer variants",
      "Detailed reports",
      "Export & share",
      "Priority support",
      "No ads",
      "Scan history sync",
    ],
    notIncluded: [],
    cta: "Start 7-Day Free Trial",
    popular: true,
  },
  {
    name: "Clinic",
    price: "$29.99",
    period: "per month",
    description: "For healthcare providers",
    features: [
      "Everything in Pro",
      "5 team members",
      "API access",
      "Bulk lookups",
      "Custom branding",
      "Dedicated support",
      "HIPAA compliance",
      "Usage analytics",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! Pro plan includes a 7-day free trial. No credit card required to start.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and PayPal.",
  },
  {
    question: "Can I switch plans?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.",
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, session } = useAuth();
  const { tier, isPro, isClinic } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planName: string) => {
    if (!isAuthenticated) {
      toast.info("Please sign in first", {
        description: "You need to be signed in to subscribe.",
      });
      navigate("/auth");
      return;
    }

    if (planName === "Clinic") {
      toast.info("Contact us for Clinic plans", {
        description: "Email us at support@halalrx.com for custom enterprise pricing.",
      });
      return;
    }

    if (planName === "Free") {
      navigate("/app");
      return;
    }

    setLoadingPlan(planName);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planName.toLowerCase() },
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
      setLoadingPlan(null);
    }
  };

  // Determine which plan the user is currently on
  const getCurrentPlanBadge = (planName: string) => {
    if (planName === "Free" && tier === "free") return true;
    if (planName === "Pro" && isPro && !isClinic) return true;
    if (planName === "Clinic" && isClinic) return true;
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
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span>Simple, transparent pricing</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade when you need more. All plans include core scanning features.
            </p>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            {plans.map((plan, index) => {
              const isCurrentPlan = getCurrentPlanBadge(plan.name);
              const isLoading = loadingPlan === plan.name;
              
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
                >
                  <Card className={`p-8 h-full flex flex-col ${
                    plan.popular
                      ? "border-primary shadow-xl shadow-primary/10 bg-gradient-to-b from-primary/5 to-transparent"
                      : ""
                  } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}>
                    {plan.popular && !isCurrentPlan && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-hero text-primary-foreground text-sm font-medium">
                        Most Popular
                      </div>
                    )}
                    {isCurrentPlan && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        Your Plan
                      </div>
                    )}

                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>

                  <div className="flex-1">
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-status-halal-bg flex items-center justify-center">
                            <Check className="h-3 w-3 text-status-halal" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.notIncluded.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs">—</span>
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "gradient-hero text-primary-foreground hover:opacity-90"
                          : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleSubscribe(plan.name)}
                      disabled={isLoading || isCurrentPlan}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {isCurrentPlan ? "Current Plan" : plan.cta}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Enterprise CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mb-20"
          >
            <Card className="p-8 bg-muted/50 text-center">
              <h2 className="text-2xl font-bold mb-2">Need a custom solution?</h2>
              <p className="text-muted-foreground mb-6">
                For hospitals, pharmacy chains, or large organizations, we offer custom enterprise plans 
                with volume pricing, dedicated support, and custom integrations.
              </p>
              <Button size="lg">Contact Sales</Button>
            </Card>
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
