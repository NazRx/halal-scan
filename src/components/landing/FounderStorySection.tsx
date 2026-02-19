import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function FounderStorySection() {
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
            <div className="h-px w-16" style={{ background: "rgba(30,111,103,0.22)" }} />
            <div className="mx-3 w-1.5 h-1.5 rounded-full" style={{ background: "rgba(30,111,103,0.35)" }} />
            <div className="h-px w-16" style={{ background: "rgba(30,111,103,0.22)" }} />
          </div>

          <h2 className="font-sans text-4xl md:text-5xl font-bold mb-3 text-foreground text-center tracking-tight leading-[1.15]">
            About the Initiative
          </h2>
          <div className="flex justify-center mb-10">
            <div className="h-0.5 w-12 rounded-full" style={{ background: "rgba(30,111,103,0.30)" }} />
          </div>

          <div className="space-y-6 text-muted-foreground text-lg leading-[1.8] mb-10">
            <p>
              AmanahRx was established as an independent medication transparency initiative
              serving Muslim patients in the United States.
            </p>

            <p>
              It is developed and maintained by Muslim healthcare professionals who understand
              both clinical practice and the religious sensitivities surrounding medication ingredients.
            </p>

            <div className="space-y-1 text-base text-muted-foreground">
              <p>The goal is not to create new rulings.</p>
              <p>It is to reduce confusion.</p>
            </div>

            <div
              className="rounded-[18px] p-5 text-base space-y-1"
              style={{
                background: "rgba(30,111,103,0.04)",
                border: "1px solid #E1F0EE",
              }}
            >
              <p className="text-foreground font-medium">Clarity reduces anxiety.</p>
              <p className="text-muted-foreground">Transparency supports trust.</p>
            </div>
          </div>

          <div
            className="rounded-[18px] p-8 md:p-10"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E1F0EE",
              borderLeftWidth: "4px",
              borderLeftColor: "#3FAF9F",
              boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
            }}
          >
            <blockquote className="text-muted-foreground text-lg leading-[1.85] italic mb-6">
              "As a pharmacist, I counseled countless patients who simply wanted
              to know whether their medications aligned with their faith. The
              information was scattered, unclear, or unavailable. AmanahRx is my
              answer to that need — clinically grounded, transparent, and built
              with responsibility for our community."
            </blockquote>

            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback
                  className="font-semibold text-sm"
                  style={{ background: "rgba(30,111,103,0.12)", color: "#1E6F67" }}
                >
                  SA
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground text-sm">Dr. Sarah Ahmed, PharmD</p>
                <p className="text-sm text-muted-foreground">Founder, AmanahRx</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
