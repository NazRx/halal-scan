import { motion } from "framer-motion";

export function ScholarlyAlignmentSection() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          {/* Decorative divider */}
          <div className="flex items-center justify-center mb-10">
            <div className="h-px w-12 bg-primary/30" />
            <div className="mx-3 w-2 h-2 rounded-full bg-primary/30" />
            <div className="h-px w-12 bg-primary/30" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-10 text-foreground text-center tracking-tight">
            Our Relationship with Scholarship
          </h2>

          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
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

            <p className="text-foreground font-medium">
              Health decisions deserve both clinical accuracy and spiritual mindfulness.
              We provide the former. We respect the latter.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
