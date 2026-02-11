import { motion } from "framer-motion";

export function ScholarlyAlignmentSection() {
  return (
    <section className="py-24">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-foreground text-center">
            Committed to Scholarly Alignment
          </h2>

          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>HalalRx does not issue religious rulings.</p>

            <p>
              Our mission is to provide medically accurate, transparent ingredient
              analysis so that Muslims can consult their own scholars and make
              informed decisions.
            </p>

            <p>
              As the platform grows, we are working toward formal scholarly
              consultation to ensure alignment with established halal principles.
            </p>

            <p className="text-foreground font-medium">
              Health decisions deserve both clinical accuracy and spiritual mindfulness.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
