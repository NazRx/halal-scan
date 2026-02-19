import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Scan } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20" style={{ background: "#1F5C52" }}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto rounded-3xl p-12 md:p-16 text-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #2F6F64 0%, #1F5C52 100%)" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.06)_0%,_transparent_60%)] rounded-3xl" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Review Your Medication
            </h2>

            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Structured ingredient research. Publicly available data. No overstatement.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/rx/search">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-[#F3F7F6] text-lg px-8 py-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Search Medication
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/otc/scan">
                <Button
                  size="lg"
                  className="bg-white/12 border border-white/35 text-white hover:bg-white hover:text-primary hover:border-white text-lg px-8 py-6 rounded-xl transition-all hover:shadow-md"
                >
                  <Scan className="h-5 w-5 mr-2" />
                  Scan Barcode
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-sm text-primary-foreground/60">
              AmanahRx does not issue rulings. Always consult qualified scholars and healthcare professionals.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
