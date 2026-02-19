import { motion } from "framer-motion";

export function WhyItMattersSection() {
  return (
    <section className="py-28" style={{ background: "#F3F7F6" }}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          {/* Accent divider */}
          <div className="flex items-center justify-center mb-12">
            <div className="h-px w-16" style={{ background: "rgba(31,92,82,0.25)" }} />
            <div className="mx-3 w-1.5 h-1.5 rounded-full" style={{ background: "rgba(31,92,82,0.35)" }} />
            <div className="h-px w-16" style={{ background: "rgba(31,92,82,0.25)" }} />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground text-center tracking-tight">
            What AmanahRx Is
          </h2>
          <div className="flex justify-center mb-10">
            <div className="h-0.5 w-12 rounded-full" style={{ background: "rgba(31,92,82,0.3)" }} />
          </div>

          <div className="space-y-7 text-muted-foreground text-lg leading-[1.8]">
            <p className="text-foreground font-semibold text-xl text-center">
              Amanah means trust.
              <span className="block font-normal text-muted-foreground mt-1 text-base">And trust requires clarity.</span>
            </p>

            <div className="text-center space-y-1 text-muted-foreground/80 text-base tracking-wide">
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

            <div
              className="rounded-2xl p-6 space-y-2 text-base"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5EFEC",
                boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
              }}
            >
              <p className="font-semibold text-foreground">We do not issue rulings.</p>
              <p className="text-muted-foreground">We provide structured clarity.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
