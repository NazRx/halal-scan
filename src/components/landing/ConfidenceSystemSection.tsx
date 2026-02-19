import { motion } from "framer-motion";

const tiers = [
  {
    title: "No Flagged Concerns Identified",
    description:
      "Based on publicly available ingredient data, no ingredients commonly questioned in Islamic dietary law were identified.",
    accent: "border-l-primary",
  },
  {
    title: "Contains Ingredients Commonly Questioned",
    description:
      "One or more ingredients that are frequently discussed in Islamic dietary law were identified. Further review is recommended.",
    accent: "border-l-warning",
  },
  {
    title: "Insufficient Public Disclosure",
    description:
      "Publicly available data is insufficient to make a reliable determination. Manufacturer clarification may be required.",
    accent: "border-l-muted-foreground/40",
  },
];

export function ConfidenceSystemSection() {
  return (
    <section className="py-24">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground text-center tracking-tight">
            How We Classify Results
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed text-center mb-10">
            Ingredient sourcing is not always fully disclosed publicly.
            When data is limited, we say so. AmanahRx uses three structured result categories:
          </p>

          <div className="space-y-4">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl border border-border bg-card p-6 border-l-4 ${tier.accent} shadow-sm hover:shadow-md transition-shadow`}
              >
                <h3 className="font-semibold text-foreground mb-1">{tier.title}</h3>
                <p className="text-muted-foreground">{tier.description}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-8 text-sm italic">
            Scholarly opinions may differ regarding certain ingredients. Users are encouraged to consult trusted scholars.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
