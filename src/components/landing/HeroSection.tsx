import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scan, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-20 md:py-32 gradient-hero overflow-hidden">
      {/* Subtle depth layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.06)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.08)_0%,_transparent_60%)]" />

      <div className="container relative px-4 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-primary-foreground/65 text-xs font-semibold uppercase tracking-[0.2em] mb-5"
          >
            A Medication Transparency Initiative
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-primary-foreground leading-[1.08]"
          >
            Clarity on What's Inside Your Medicine.{" "}
            <span className="block text-primary-foreground/85">So You Can Decide with Confidence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-primary-foreground/75 mb-4 max-w-2xl mx-auto leading-[1.75]"
          >
            Structured ingredient research to help you make informed healthcare
            decisions aligned with your values.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-primary-foreground/55 text-sm mb-12 tracking-wide"
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
                className="bg-white text-primary hover:bg-[#F3F7F6] text-base px-8 py-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <Scan className="h-5 w-5 mr-2" />
                Scan Medication
              </Button>
            </Link>
            <Link to="/methodology">
              <Button
                size="lg"
                className="bg-white/12 border border-white/35 text-white hover:bg-white hover:text-primary hover:border-white text-base px-8 py-6 rounded-xl transition-all hover:shadow-md"
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
