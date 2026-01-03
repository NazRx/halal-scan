import { motion } from "framer-motion";
import { Scan, Search, CheckCircle, FileText } from "lucide-react";

const steps = [
  {
    icon: Scan,
    title: "Scan or Search",
    description: "Scan the barcode of any OTC product or search for prescription medications by name.",
  },
  {
    icon: Search,
    title: "Analyze Ingredients",
    description: "Our database cross-references every ingredient against halal certification standards.",
  },
  {
    icon: CheckCircle,
    title: "Get Your Verdict",
    description: "See a clear Halal, Questionable, or Not Halal status with confidence levels.",
  },
  {
    icon: FileText,
    title: "View Report",
    description: "Access detailed ingredient breakdowns, sources, and shareable reports.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get instant halal status checks for your medications in just a few seconds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-border" />
              )}
              
              <div className="relative bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow">
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>

                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>

                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
