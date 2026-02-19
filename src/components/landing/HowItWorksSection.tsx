import { motion } from "framer-motion";
import { Database, FileSearch, Users, BookOpen } from "lucide-react";

const steps = [
  {
    icon: Database,
    title: "Data Sources Reviewed",
    description:
      "FDA labeling databases, manufacturer package inserts, OTC ingredient disclosures, and public regulatory documentation.",
  },
  {
    icon: FileSearch,
    title: "Ingredients Flagged",
    description:
      "Ingredients commonly discussed in Islamic dietary law — such as gelatin, alcohol, and porcine derivatives — are identified for further review.",
  },
  {
    icon: BookOpen,
    title: "Context Provided",
    description:
      "Structured information is organized clearly so users can understand what is present and what may require further inquiry.",
  },
  {
    icon: Users,
    title: "You Decide",
    description:
      "Users are encouraged to speak to their pharmacist, consult scholars, and make informed personal decisions.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-28 relative" style={{ background: "#FFFFFF" }}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-3 text-foreground tracking-tight">
            How It Works
          </h2>
          <div className="flex justify-center mb-5">
            <div className="h-0.5 w-12 rounded-full" style={{ background: "rgba(31,92,82,0.3)" }} />
          </div>
          <p className="text-muted-foreground text-lg leading-[1.8]">
            AmanahRx reviews publicly available sources and provides structured context —
            not rulings.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

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
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-0.5"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E5EFEC",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
                    }}
                  >
                    <step.icon className="h-10 w-10" style={{ color: "#1F5C52" }} />
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
