import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function FounderStorySection() {
  return (
    <section className="py-28" style={{ background: "#F3F7F6" }}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-3 text-foreground tracking-tight">
            About AmanahRx
          </h2>
          <div className="flex justify-center mb-10">
            <div className="h-0.5 w-12 rounded-full" style={{ background: "rgba(31,92,82,0.3)" }} />
          </div>

          <p className="text-muted-foreground text-lg leading-[1.8] mb-10">
            AmanahRx was created as a small independent research initiative focused on
            medication transparency for Muslim patients in the United States. The project
            is built and maintained by Muslim healthcare professionals who understand both
            clinical practice and religious sensitivity surrounding ingredients.
          </p>

          <div
            className="rounded-2xl p-8 md:p-10 text-left"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5EFEC",
              borderLeftWidth: "4px",
              borderLeftColor: "#2F6F64",
              boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
            }}
          >
            <blockquote className="text-muted-foreground text-lg leading-[1.8] italic mb-6">
              "As a pharmacist, I counseled countless patients who simply wanted
              to know whether their medications aligned with their faith. The
              information was scattered, unclear, or unavailable. AmanahRx is my
              answer to that need — clinically grounded, transparent, and built
              with responsibility for our community."
            </blockquote>

            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="font-semibold" style={{ background: "rgba(47,111,100,0.1)", color: "#2F6F64" }}>
                  SA
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">Dr. Sarah Ahmed, PharmD</p>
                <p className="text-sm text-muted-foreground">Founder, AmanahRx</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
