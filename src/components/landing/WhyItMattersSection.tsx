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
            <div className="h-px w-16" style={{ background: "rgba(31,92,82,0.22)" }} />
            <div className="mx-3 w-1.5 h-1.5 rounded-full" style={{ background: "rgba(31,92,82,0.32)" }} />
            <div className="h-px w-16" style={{ background: "rgba(31,92,82,0.22)" }} />
          </div>

          <h2 className="font-display text-4xl md:text-5xl font-bold mb-3 text-foreground text-center tracking-tight leading-[1.15]">
            Amanah Means Trust.
          </h2>
          <div className="flex justify-center mb-10">
            <div className="h-0.5 w-12 rounded-full" style={{ background: "rgba(31,92,82,0.3)" }} />
          </div>

          <div className="space-y-6 text-muted-foreground text-lg leading-[1.8]">
            <p className="text-foreground font-medium text-xl text-center">
              In healthcare, trust requires clarity.
            </p>

            <p>
              Medication ingredients are not always simple.
              Gelatin capsules. Alcohol-based syrups. Magnesium stearate. Glycerin.
            </p>

            <p>
              Sources may not be fully disclosed.
              Formulations may vary by manufacturer.
              Public data can be fragmented or technical.
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
              className="rounded-2xl p-6 space-y-1 text-base"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5EFEC",
                boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
              }}
            >
              <p className="font-semibold text-foreground">We do not determine permissibility.</p>
              <p className="text-muted-foreground">We provide clarity.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
