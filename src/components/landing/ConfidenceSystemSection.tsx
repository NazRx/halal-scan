import { motion } from "framer-motion";

const tiers = [
  {
    title: "No Flagged Concerns Identified",
    description:
      "Based on publicly available disclosures, no ingredients commonly questioned in Islamic dietary law were identified.",
    borderColor: "#2F7E72",
  },
  {
    title: "Ingredients Requiring Further Review",
    description:
      "One or more ingredients commonly discussed in Islamic dietary law were identified. Further review or scholarly consultation may be appropriate.",
    borderColor: "#C8A23E",
  },
  {
    title: "Insufficient Public Disclosure",
    description:
      "Public documentation is not sufficient to make a reliable determination. Manufacturer clarification may be required.",
    borderColor: "#9AA6A3",
  },
];

export function ConfidenceSystemSection() {
  return (
    <section className="py-28" style={{ background: "#FFFFFF" }}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="font-sans text-4xl md:text-5xl font-bold mb-3 text-foreground text-center tracking-tight leading-[1.15]">
            How Results Are Structured
          </h2>
          <div className="flex justify-center mb-6">
            <div className="h-0.5 w-12 rounded-full" style={{ background: "rgba(47,126,114,0.30)" }} />
          </div>

          <p className="text-muted-foreground text-lg leading-[1.8] text-center mb-10">
            Ingredient sourcing is not always fully disclosed.
            When information is limited, we say so.
            AmanahRx uses three structured categories:
          </p>

          <div className="space-y-4">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-[18px] p-6 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-md"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #DFF1EC",
                  borderLeftWidth: "4px",
                  borderLeftColor: tier.borderColor,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
                }}
              >
                <h3 className="font-semibold text-foreground mb-1.5">{tier.title}</h3>
                <p className="text-muted-foreground leading-[1.75] text-sm">{tier.description}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-10 text-sm italic leading-relaxed">
            Scholarly opinions may differ on certain ingredient categories. Users are encouraged to consult trusted scholars.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
