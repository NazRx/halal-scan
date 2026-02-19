import { motion } from "framer-motion";

export function WhyItMattersSection() {
  return (
    <section className="py-28" style={{ background: "#F3F9F8" }}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          {/* Accent divider */}
          <div className="flex items-center justify-center mb-12">
            <div className="h-px w-16" style={{ background: "rgba(30,111,103,0.22)" }} />
            <div className="mx-3 w-1.5 h-1.5 rounded-full" style={{ background: "rgba(30,111,103,0.35)" }} />
            <div className="h-px w-16" style={{ background: "rgba(30,111,103,0.22)" }} />
          </div>

          <h2 className="font-sans text-4xl md:text-5xl font-bold mb-3 text-foreground text-center tracking-tight leading-[1.15]">
            Amanah Means Trust.
          </h2>
          <div className="flex justify-center mb-10">
            <div className="h-0.5 w-12 rounded-full" style={{ background: "rgba(30,111,103,0.30)" }} />
          </div>

          <div className="space-y-6 text-muted-foreground text-lg leading-[1.8]">
            <p className="text-foreground font-medium text-xl text-center">
              And trust requires clarity.
            </p>

            <p>
              Medication ingredients are rarely simple.
              Gelatin capsules. Alcohol-based syrups. Magnesium stearate. Glycerin.
              Sources are often unclear — and formulations can change over time.
            </p>

            <p>
              For many Muslim patients in the United States, understanding these details
              requires navigating regulatory databases, manufacturer inserts, and labeling
              documents — resources that are not always easy to interpret.
            </p>

            <p>
              AmanahRx exists to organize this information into structured, accessible
              summaries — without issuing religious rulings.
            </p>

            <div
              className="rounded-[18px] p-6 space-y-1 text-base"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E1F0EE",
                boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
              }}
            >
              <p className="font-semibold text-foreground">We do not determine permissibility.</p>
              <p className="text-muted-foreground">We provide structured clarity.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
