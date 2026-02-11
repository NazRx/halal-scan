import { motion } from "framer-motion";

export function WhyItMattersSection() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-foreground text-center">
            Why Halal Verification Matters
          </h2>

          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>Medication ingredients are rarely simple.</p>

            <p>
              Gelatin capsules. Alcohol-based syrups. Magnesium stearate. Glycerin.
              Sources are often unclear — and manufacturer formulations can vary.
            </p>

            <p>
              For many Muslims in the United States, verifying whether a medication
              aligns with their faith requires digging through FDA databases,
              ingredient lists, and manufacturer disclosures.
            </p>

            <p>Most people don't have the time — or the training — to do that.</p>

            <p className="text-foreground font-medium">
              HalalRx exists to bring clarity where there is uncertainty.
            </p>

            <p className="text-foreground font-medium">
              You should never have to choose between your health and your values.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
