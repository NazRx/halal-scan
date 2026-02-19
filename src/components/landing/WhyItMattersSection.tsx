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
          <div className="flex items-center justify-center mb-10">
            <div className="h-px w-12 bg-primary/30" />
            <div className="mx-3 w-2 h-2 rounded-full bg-primary/30" />
            <div className="h-px w-12 bg-primary/30" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-foreground text-center tracking-tight">
            What AmanahRx Is
          </h2>

          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p className="text-foreground font-semibold text-xl text-center">Amanah means trust.</p>

            <div className="text-center space-y-1 text-muted-foreground">
              <p>Healthcare is a trust.</p>
              <p>Information is a trust.</p>
              <p>Transparency is a trust.</p>
            </div>

            <p>
              Medication ingredients are rarely simple. Gelatin capsules. Alcohol-based syrups.
              Magnesium stearate. Glycerin. Sources are often unclear — and manufacturer
              formulations can change over time.
            </p>

            <p>
              For many Muslims in the United States, verifying whether a medication's
              ingredients are of concern requires navigating FDA databases, manufacturer
              inserts, and technical disclosures. Most people don't have the time — or the
              training — to do that.
            </p>

            <p className="text-foreground font-medium">
              AmanahRx exists to help Muslims better understand medication ingredients
              using publicly available regulatory and manufacturer data.
            </p>

            <div className="rounded-xl border border-border bg-card p-6 space-y-2 text-base">
              <p className="font-medium text-foreground">We do not issue rulings.</p>
              <p>We organize information.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
