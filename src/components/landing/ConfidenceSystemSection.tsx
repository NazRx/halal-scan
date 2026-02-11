import { motion } from "framer-motion";

const tiers = [
  {
    title: "High Confidence",
    description: "Verified ingredient information with clear manufacturer data.",
  },
  {
    title: "Moderate Confidence",
    description:
      "No red-flag ingredients detected, but limited sourcing transparency.",
  },
  {
    title: "Limited Data",
    description:
      "Insufficient publicly available information. Manufacturer clarification may be required.",
  },
];

export function ConfidenceSystemSection() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground text-center">
            Our Confidence System
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed text-center mb-10">
            Ingredient sourcing is not always fully disclosed publicly.
            When data is limited, we say so. HalalRx assigns a confidence level
            to each analysis:
          </p>

          <div className="space-y-4">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="font-semibold text-foreground mb-1">{tier.title}</h3>
                <p className="text-muted-foreground">{tier.description}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-8 text-sm italic">
            Clarity includes acknowledging uncertainty.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
