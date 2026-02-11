import { motion } from "framer-motion";
import { HeroSearchInput } from "./HeroSearchInput";

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-20 md:py-32 gradient-hero overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

      <div className="container relative px-4 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-primary-foreground"
          >
            The First U.S. Halal Medication Verification Platform
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Transparent ingredient analysis for prescription and over-the-counter
            medications — so you can protect your health without compromising your faith.
          </motion.p>

          <HeroSearchInput />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-sm text-primary-foreground/70"
          >
            Pharmacist-developed. Evidence-based. Built for Muslims in America.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
