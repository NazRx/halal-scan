import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Shield, Sparkles, ArrowRight, Moon } from "lucide-react";
import { useRamadan } from "@/hooks/useRamadan";

export function PricingSection() {
  const { isRamadan, pricing } = useRamadan();

  const plans = [
    {
      name: isRamadan ? "Explore+" : "Explore",
      subtitle: isRamadan ? "Ramadan Boost" : "Free",
      price: "$0",
      period: "forever",
      description: isRamadan 
        ? "A month of clarity and intention."
        : "Try it safely. No commitment.",
      features: [
        "Unlimited OTC scans",
        `${pricing.FREE_RX_SCAN_LIMIT} lifetime Rx scans`,
        "Clear halal status",
        "Basic ingredient list",
        ...(isRamadan ? ["No ads for first 7 days"] : []),
      ],
      cta: "Start Free",
      popular: false,
      icon: isRamadan ? Moon : Shield,
    },
    {
      name: isRamadan ? "Ramadan Protect" : "Protect",
      subtitle: "Pro",
      price: isRamadan ? "$2.99" : "$4.99",
      period: "per month",
      description: isRamadan 
        ? "One month free of doubt."
        : "For Muslims who rely on medications.",
      features: [
        "Everything in Free",
        "Unlimited OTC + Rx scans",
        "Manufacturer comparison",
        "Ingredient rulings with sources",
        "Export & share reports",
        "No ads",
      ],
      cta: isRamadan ? "Ramadan Offer" : "Start Free Trial",
      popular: true,
      icon: Sparkles,
    },
  ];

  return (
    <section id="pricing" className={`py-20 ${isRamadan ? 'bg-amber-50/30 dark:bg-amber-950/10' : 'bg-muted/30'}`}>
      <div className="container px-4">
        {/* Ramadan Banner */}
        {isRamadan && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
              <Moon className="h-4 w-4" />
              <span className="text-sm font-medium">Ramadan Special Pricing</span>
              <Moon className="h-4 w-4" />
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you need more. Built by pharmacists, guided by Islamic principles.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl border p-6 ${
                  plan.popular
                    ? isRamadan
                      ? "border-amber-400 bg-card shadow-xl shadow-amber-500/10"
                      : "border-primary bg-card shadow-xl shadow-primary/10"
                    : "bg-card"
                }`}
              >
                {plan.popular && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${
                    isRamadan 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'gradient-hero text-primary-foreground'
                  }`}>
                    {isRamadan ? '🌙 Ramadan Special' : 'Most Popular'}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-lg ${
                    plan.popular 
                      ? isRamadan ? 'bg-amber-100 dark:bg-amber-900' : 'bg-primary/10'
                      : isRamadan ? 'bg-amber-50 dark:bg-amber-950' : 'bg-muted'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      plan.popular 
                        ? isRamadan ? 'text-amber-600' : 'text-primary'
                        : isRamadan ? 'text-amber-600' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold">{plan.name}</h3>
                    <span className="text-xs text-muted-foreground">{plan.subtitle}</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className={`h-4 w-4 flex-shrink-0 ${
                        isRamadan ? 'text-amber-600' : 'text-primary'
                      }`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/app">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? isRamadan
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                          : "gradient-hero text-primary-foreground hover:opacity-90"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
                
                {plan.popular && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    {isRamadan 
                      ? 'Cancel anytime · No guilt · No pressure'
                      : '🎁 7-day free trial — no credit card'
                    }
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/pricing" className={`inline-flex items-center gap-1 text-sm hover:underline ${
            isRamadan ? 'text-amber-600 dark:text-amber-400' : 'text-primary'
          }`}>
            View all plans including Professional
            <ArrowRight className="h-4 w-4" />
          </Link>
          {isRamadan && (
            <p className="text-xs text-muted-foreground mt-2">
              Supporting this app helps maintain an independent, ad-free halal medication database.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
