import { motion } from "framer-motion";

export function ScholarlyAlignmentSection() {
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
            Respect for Scholarship
          </h2>
          <div className="flex justify-center mb-10">
            <div className="h-0.5 w-12 rounded-full" style={{ background: "rgba(30,111,103,0.30)" }} />
          </div>

          <div className="space-y-6 text-muted-foreground text-lg leading-[1.8]">
            <p>AmanahRx does not issue religious rulings.</p>

            <p>
              Our mission is to provide structured ingredient transparency so that individuals
              may consult their own scholars and make informed decisions grounded in both
              clinical understanding and spiritual mindfulness.
            </p>

            <p>
              Scholarly opinions may differ on topics such as transformation (istihalah),
              alcohol thresholds, and gelatin permissibility. AmanahRx does not adjudicate
              between these positions.
            </p>

            <p>
              In cases of medical necessity, Islamic legal principles regarding necessity
              (darura) may apply. Consultation with qualified scholars is encouraged.
            </p>

            <div
              className="rounded-[18px] p-6 space-y-2 text-base"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E1F0EE",
                boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
              }}
            >
              <p className="text-foreground leading-[1.75]">
                Health decisions deserve both clinical accuracy and spiritual mindfulness.
              </p>
              <p className="font-semibold text-foreground">We provide the former.</p>
              <p className="text-muted-foreground">We respect the latter.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
