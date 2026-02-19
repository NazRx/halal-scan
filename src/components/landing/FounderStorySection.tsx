import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function FounderStorySection() {
  return (
    <section className="py-24">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-10 text-foreground tracking-tight">
            About AmanahRx
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed mb-10">
            AmanahRx was created as a small independent research initiative focused on
            medication transparency for Muslim patients in the United States. The project
            is built and maintained by Muslim healthcare professionals who understand both
            clinical practice and religious sensitivity surrounding ingredients.
          </p>

          <div className="rounded-2xl border border-border bg-card p-8 md:p-10 text-left shadow-lg border-l-4 border-l-primary">
            <blockquote className="text-muted-foreground text-lg leading-relaxed italic mb-6">
              "As a pharmacist, I counseled countless patients who simply wanted
              to know whether their medications aligned with their faith. The
              information was scattered, unclear, or unavailable. AmanahRx is my
              answer to that need — clinically grounded, transparent, and built
              with responsibility for our community."
            </blockquote>

            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
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
