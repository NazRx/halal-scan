import { motion } from "framer-motion";

export function ScholarlyAlignmentSection() {
  return (
    <section className="py-28" style={{ background: "#FFFFFF" }}>
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

          <h2 className="text-4xl md:text-5xl font-bold mb-3 text-foreground text-center tracking-tight">
            Our Relationship with Scholarship
          </h2>
          <div className="flex justify-center mb-10">
            <div className="h-0.5 w-12 rounded-full" style={{ background: "rgba(31,92,82,0.3)" }} />
          </div>

          <div className="space-y-6 text-muted-foreground text-lg leading-[1.8]">
            <p>AmanahRx does not issue religious rulings (fatwa).</p>

            <p>
              Our mission is to provide structured, transparent ingredient information
              so that Muslims can consult their own scholars and make informed decisions.
            </p>

            <p>
              Scholarly opinions differ on several ingredient categories — including
              transformation (istihalah), alcohol thresholds, and gelatin permissibility.
              AmanahRx does not adjudicate these differences.
            </p>

            <p>
              In cases of medical necessity, Islamic legal principles regarding necessity
              (darura) may apply. Users are encouraged to consult qualified scholars for
              guidance in such situations.
            </p>

            <p className="text-foreground font-semibold">
              Health decisions deserve both clinical accuracy and spiritual mindfulness.
              We provide the former. We respect the latter.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
