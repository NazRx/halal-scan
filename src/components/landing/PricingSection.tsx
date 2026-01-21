import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Shield, Sparkles, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Explore",
    subtitle: "Free",
    price: "$0",
    period: "forever",
    description: "Try it safely. No commitment.",
    features: [
      "Unlimited OTC scans",
      "10 lifetime Rx scans",
      "Clear halal status",
      "Basic ingredient list",
    ],
    cta: "Start Free",
    popular: false,
    icon: Shield,
  },
  {
    name: "Protect",
    subtitle: "Pro",
    price: "$4.99",
    period: "per month",
    description: "For Muslims who rely on medications.",
    features: [
      "Everything in Free",
      "Unlimited OTC + Rx scans",
      "Manufacturer comparison",
      "Ingredient rulings with sources",
      "Export & share reports",
      "No ads",
    ],
    cta: "Start Free Trial",
    popular: true,
    icon: Sparkles,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container px-4">
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
                    ? "border-primary bg-card shadow-xl shadow-primary/10"
                    : "bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-hero text-primary-foreground text-xs font-medium">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-lg ${plan.popular ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`h-4 w-4 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
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
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/app">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "gradient-hero text-primary-foreground hover:opacity-90"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
                
                {plan.popular && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    🎁 7-day free trial — no credit card
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
          <Link to="/pricing" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            View all plans including Professional
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
