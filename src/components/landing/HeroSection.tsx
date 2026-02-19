import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scan, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section
      className="relative min-h-[85vh] flex items-center justify-center py-24 md:py-36 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #67C5B6 0%, #8ED9CC 100%)" }}
    >
      {/* Subtle depth layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.04)_0%,_transparent_60%)]" />

      <div className="container relative px-4 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white/65 text-xs font-semibold uppercase tracking-[0.22em] mb-7"
          >
            A Medication Transparency Initiative
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-tight mb-6 text-white leading-[1.1]"
          >
            Clarity on What's Inside
            <br className="hidden sm:block" />
            Your Medicine.{" "}
            <span className="block text-white/85 mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-semibold leading-[1.15]">
              So You Can Decide with Confidence.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-base md:text-lg text-white/80 mb-4 max-w-xl mx-auto leading-[1.8]"
          >
            Structured ingredient research to help you make informed healthcare
            decisions aligned with your values.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/60 text-sm mb-12 tracking-wide"
          >
            Built by Muslim healthcare professionals. Independent. Transparent. Community-driven.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/app">
              <Button
                size="lg"
                style={{
                  background: "#FFFFFF",
                  color: "#2A8C7F",
                  borderRadius: "14px",
                  fontWeight: 600,
                }}
                className="text-base px-8 py-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                onMouseEnter={e => (e.currentTarget.style.background = "#F4FBFA")}
                onMouseLeave={e => (e.currentTarget.style.background = "#FFFFFF")}
              >
                <Scan className="h-5 w-5 mr-2" />
                Scan Medication
              </Button>
            </Link>
            <Link to="/methodology">
              <Button
                size="lg"
                style={{
                  background: "rgba(255,255,255,0.25)",
                  border: "1px solid rgba(255,255,255,0.55)",
                  color: "#FFFFFF",
                  borderRadius: "14px",
                }}
                className="text-base px-8 py-6 font-medium transition-all duration-200 hover:bg-white hover:shadow-md"
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#FFFFFF";
                  e.currentTarget.style.color = "#2A8C7F";
                  e.currentTarget.style.border = "1px solid #FFFFFF";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.55)";
                }}
              >
                Learn How It Works
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
