import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Scan } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24" style={{ background: "#1F5C52" }}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-3xl mx-auto rounded-3xl p-12 md:p-16 text-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #2F6F64 0%, #1F5C52 100%)" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.05)_0%,_transparent_60%)] rounded-3xl" />

          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 leading-[1.15]">
              Review Your Medication
            </h2>

            <p className="text-base text-primary-foreground/75 mb-8 max-w-md mx-auto leading-[1.8]">
              Structured ingredient research. Publicly available data. No overstatement.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/rx/search">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-[#F3F7F6] text-base px-8 py-6 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  Search Medication
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/otc/scan">
                <Button
                  size="lg"
                  className="bg-white/12 border border-white/35 text-white hover:bg-white hover:text-primary hover:border-white text-base px-8 py-6 rounded-full transition-all duration-200 hover:shadow-md"
                >
                  <Scan className="h-5 w-5 mr-2" />
                  Scan Barcode
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-xs text-primary-foreground/50 tracking-wide">
              AmanahRx does not issue rulings. Always consult qualified scholars and healthcare professionals.
            </p>
          </div>
        </motion.div>

        <p className="text-center text-white/40 text-xs mt-10 tracking-wide">
          AmanahRx is an independent research initiative and is not affiliated with any regulatory agency or religious authority.
        </p>
      </div>
    </section>
  );
}
