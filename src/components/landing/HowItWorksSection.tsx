import { motion } from "framer-motion";
import { Scan, Search, CheckCircle, FileText } from "lucide-react";

const steps = [
  {
    icon: Scan,
    title: "Search or Scan",
    description: "Search by medication name or scan an OTC barcode instantly.",
  },
  {
    icon: Search,
    title: "Analyze",
    description:
      "We review publicly available FDA labeling data and manufacturer-specific inactive ingredients.",
  },
  {
    icon: CheckCircle,
    title: "Get a Verdict",
    description:
      "Clear status labels: Halal, Questionable, or Contains Non-Halal Ingredients.",
  },
  {
    icon: FileText,
    title: "Understand Why",
    description:
      "View ingredient-level flags, manufacturer differences, and confidence levels — not just a label.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 relative">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Simple. Transparent. Fast.
          </h2>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-2xl bg-card border border-border/50 flex items-center justify-center shadow-lg">
                    <step.icon className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                </div>

                <h3 className="font-semibold text-base mb-1 text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground max-w-[180px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
