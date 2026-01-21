import { motion } from "framer-motion";
import { Scan, Search, CheckCircle, FileText } from "lucide-react";

const steps = [
  {
    icon: Scan,
    title: "Scan or Search",
    description: "Scan any OTC barcode or search Rx by name.",
  },
  {
    icon: Search,
    title: "Analyze",
    description: "Cross-reference against halal standards.",
  },
  {
    icon: CheckCircle,
    title: "Get Verdict",
    description: "Clear Halal, Questionable, or Not Halal status.",
  },
  {
    icon: FileText,
    title: "View Report",
    description: "Detailed breakdown with sources.",
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
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple & Fast
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Get instant halal status checks in just a few seconds.
          </p>
        </motion.div>

        {/* Horizontal Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connection Line */}
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
                {/* Step Number + Icon Container */}
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-2xl bg-card border border-border/50 flex items-center justify-center shadow-lg">
                    <step.icon className="h-10 w-10 text-primary" />
                  </div>
                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                </div>

                <h3 className="font-semibold text-base mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-[160px]">
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
