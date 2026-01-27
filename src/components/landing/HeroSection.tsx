import { motion } from "framer-motion";
import { Heart, Stethoscope, Zap, Shield } from "lucide-react";
import { HeroSearchInput } from "./HeroSearchInput";
import { GradientOrb } from "./GradientOrb";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 md:py-32">
      {/* Animated gradient orbs */}
      <GradientOrb 
        color="primary" 
        size="xl" 
        className="-top-20 -right-20 md:right-20" 
        delay={0} 
      />
      <GradientOrb 
        color="accent" 
        size="lg" 
        className="-bottom-10 -left-10 md:left-20" 
        delay={0.5} 
      />
      <GradientOrb 
        color="secondary" 
        size="md" 
        className="top-1/3 left-1/4 hidden md:block" 
        delay={1} 
      />

      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container relative px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-xl px-4 py-2 text-sm">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20">
                <Heart className="h-3 w-3 text-primary" />
              </div>
              <span className="text-muted-foreground">Made by <span className="text-foreground font-medium">Muslims</span>, for Muslims</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-xl px-4 py-2 text-sm">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20">
                <Stethoscope className="h-3 w-3 text-primary" />
              </div>
              <span className="text-muted-foreground"><span className="text-foreground font-medium">PharmD</span> Reviewed</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          >
            Know Your Meds.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Stay Halal.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto"
          >
            Instantly verify halal status of medications. Scan barcodes or search by name.
          </motion.p>

          {/* Interactive Search Input */}
          <HeroSearchInput />

          {/* Social Proof Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-12 pt-12 border-t border-border/30"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm"><span className="text-foreground font-semibold">50,000+</span> Products</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Stethoscope className="h-4 w-4 text-primary" />
              <span className="text-sm"><span className="text-foreground font-semibold">PharmD</span> Reviewed</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm"><span className="text-foreground font-semibold">Scholar</span> Approved</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
