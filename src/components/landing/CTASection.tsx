import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Scan } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24" style={{ background: "#1E6F67" }}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-3xl mx-auto rounded-[18px] p-12 md:p-16 text-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #3FAF9F 0%, #329E8F 100%)" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.10)_0%,_transparent_60%)] rounded-[18px]" />

          <div className="relative">
            <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-[1.15]">
              Review Your Medication
            </h2>

            <p className="text-base text-white/80 mb-8 max-w-md mx-auto leading-[1.8]">
              Structured ingredient research. Publicly available data. No overstatement.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/rx/search">
                <Button
                  size="lg"
                  style={{
                    background: "#FFFFFF",
                    color: "#1E6F67",
                    borderRadius: "14px",
                    fontWeight: 600,
                  }}
                  className="text-base px-8 py-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                  onMouseEnter={e => (e.currentTarget.style.background = "#F3F9F8")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#FFFFFF")}
                >
                  Search Medication
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/otc/scan">
                <Button
                  size="lg"
                  style={{
                    background: "rgba(255,255,255,0.22)",
                    border: "1px solid rgba(255,255,255,0.55)",
                    color: "#FFFFFF",
                    borderRadius: "14px",
                  }}
                  className="text-base px-8 py-6 font-medium transition-all duration-200"
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#FFFFFF";
                    e.currentTarget.style.color = "#1E6F67";
                    e.currentTarget.style.border = "1px solid #FFFFFF";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.10)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.22)";
                    e.currentTarget.style.color = "#FFFFFF";
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.55)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Scan className="h-5 w-5 mr-2" />
                  Scan Barcode
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-xs text-white/50 tracking-wide">
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
