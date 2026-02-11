import { motion } from "framer-motion";
import { HeroSearchInput } from "./HeroSearchInput";

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-20 md:py-32">
      <div className="container relative px-4 z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground"
          >
            The First U.S. Halal Medication Verification Platform
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Transparent ingredient analysis for prescription and over-the-counter
            medications — so you can protect your health without compromising your faith.
          </motion.p>

          {/* Interactive Search Input */}
          <HeroSearchInput />

          {/* Micro trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-sm text-muted-foreground"
          >
            Pharmacist-developed. Evidence-based. Built for Muslims in America.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
