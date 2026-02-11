import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function FounderStorySection() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-foreground">
            Made by Muslims, for Muslims
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed mb-10">
            HalalRx was founded by a Muslim Doctor of Pharmacy who witnessed
            firsthand the uncertainty patients face when trying to verify
            medication ingredients.
          </p>

          <div className="rounded-2xl border border-border bg-card p-8 md:p-10 text-left">
            <blockquote className="text-muted-foreground text-lg leading-relaxed italic mb-6">
              "As a pharmacist, I counseled countless patients who simply wanted
              to know whether their medications aligned with their faith. The
              information was scattered, unclear, or unavailable. HalalRx is my
              answer to that need — clinically accurate, transparent, and built
              with care for our Ummah."
            </blockquote>

            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  SA
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">Dr. Sarah Ahmed, PharmD</p>
                <p className="text-sm text-muted-foreground">Founder & Chief Pharmacist</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
