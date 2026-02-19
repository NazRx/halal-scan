import { motion } from "framer-motion";

const tiers = [
  {
    title: "No Flagged Concerns Identified",
    description:
      "Based on publicly available ingredient data, no ingredients commonly questioned in Islamic dietary law were identified.",
    borderColor: "#2F6F64",
  },
  {
    title: "Ingredients Requiring Further Review",
    description:
      "One or more ingredients that are frequently discussed in Islamic dietary law were identified. Further review is recommended.",
    borderColor: "#C9870A",
  },
  {
    title: "Insufficient Public Disclosure",
    description:
      "Publicly available data is insufficient to make a reliable determination. Manufacturer clarification may be required.",
    borderColor: "rgba(31,92,82,0.25)",
  },
];

export function ConfidenceSystemSection() {
  return (
    <section className="py-28" style={{ background: "#F3F7F6" }}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-3 text-foreground text-center tracking-tight">
            How We Classify Results
          </h2>
          <div className="flex justify-center mb-6">
            <div className="h-0.5 w-12 rounded-full" style={{ background: "rgba(31,92,82,0.3)" }} />
          </div>

          <p className="text-muted-foreground text-lg leading-[1.8] text-center mb-10">
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
                className="rounded-2xl p-6 hover:-translate-y-0.5 transition-all duration-200"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5EFEC",
                  borderLeftWidth: "4px",
                  borderLeftColor: tier.borderColor,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
                }}
              >
                <h3 className="font-semibold text-foreground mb-1">{tier.title}</h3>
                <p className="text-muted-foreground leading-[1.7]">{tier.description}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-8 text-sm italic leading-relaxed">
            Scholarly opinions may differ regarding certain ingredients. Users are encouraged to consult trusted scholars.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
