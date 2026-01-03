import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Scan, Search, Shield, Zap } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      
      <div className="container relative px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 backdrop-blur px-4 py-1.5 text-sm mb-6">
              <Shield className="h-4 w-4 text-primary" />
              <span>Trusted by 10,000+ Muslims worldwide</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Know Your Medications.{" "}
              <span className="text-primary">Stay Halal.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Instantly check if your OTC products and prescription medications contain halal ingredients. 
              Scan barcodes, search by name, and get detailed ingredient breakdowns.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/app">
                <Button size="lg" className="gradient-hero text-primary-foreground hover:opacity-90 text-lg px-8 py-6 rounded-xl shadow-glow">
                  <Scan className="h-5 w-5 mr-2" />
                  Start Scanning Free
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl">
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span><strong>50,000+</strong> Products</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                <span><strong>10,000+</strong> Rx Meds</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span><strong>Scholar</strong> Reviewed</span>
              </div>
            </div>
          </motion.div>

          {/* Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16"
          >
            <div className="relative mx-auto max-w-md">
              {/* Phone mockup */}
              <div className="rounded-3xl border-4 border-foreground/10 bg-card p-4 shadow-2xl">
                <div className="rounded-2xl bg-muted/50 p-6 space-y-4">
                  {/* Status badge preview */}
                  <div className="flex justify-center">
                    <StatusBadge status="halal" size="xl" animate />
                  </div>
                  
                  {/* Product info */}
                  <div className="text-center space-y-1">
                    <h3 className="font-semibold text-lg">Tylenol Extra Strength</h3>
                    <p className="text-sm text-muted-foreground">500mg Acetaminophen</p>
                  </div>

                  {/* Confidence */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium text-status-halal">95%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[95%] rounded-full bg-status-halal" />
                    </div>
                  </div>

                  {/* Quick ingredients */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-status-halal-bg text-status-halal">✓ Acetaminophen</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-status-halal-bg text-status-halal">✓ Cellulose</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-status-halal-bg text-status-halal">✓ Starch</span>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
