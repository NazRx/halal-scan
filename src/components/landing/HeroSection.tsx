import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scan, ArrowRight, Search, ScanLine } from "lucide-react";

const PLACEHOLDER_DRUGS = [
  "Search Lisinopril…",
  "Search Metformin…",
  "Search Vitamin D…",
  "Search Ibuprofen…",
  "Search Amoxicillin…",
];

export function HeroSection() {
  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDER_DRUGS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const handleSearch = () => {
    if (query.trim()) navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center py-24 md:py-36 gradient-hero overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.06)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.07)_0%,_transparent_60%)]" />

      <div className="container relative px-4 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-primary-foreground/60 text-xs font-semibold uppercase tracking-[0.22em] mb-7"
          >
            A Medication Transparency Initiative
          </motion.p>

          {/* Search bar — above headline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="max-w-xl mx-auto mb-10"
          >
            <div className="flex items-center gap-2 bg-white/10 border border-white/25 rounded-2xl px-4 py-2 backdrop-blur-sm">
              <Search className="h-4 w-4 text-white/50 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={PLACEHOLDER_DRUGS[placeholderIdx]}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base outline-none border-none"
              />
              <button
                onClick={() => navigate("/otc/scan")}
                className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium bg-white/20 border border-white/40 text-white hover:bg-white/30 transition-colors"
              >
                <ScanLine className="h-4 w-4" />
                Scan
              </button>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-tight mb-6 text-primary-foreground leading-[1.1]"
          >
            Clarity on What's Inside
            <br className="hidden sm:block" />
            Your Medicine.{" "}
            <span className="block text-primary-foreground/80 mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-semibold leading-[1.15]">
              So You Can Decide with Confidence.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-base md:text-lg text-primary-foreground/70 mb-4 max-w-xl mx-auto leading-[1.8]"
          >
            Structured ingredient research based on publicly available regulatory and
            manufacturer disclosures — presented with transparency and restraint.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-primary-foreground/50 text-sm mb-12 tracking-wide"
          >
            Developed by Muslim healthcare professionals. Independent. Methodical. Community-focused.
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
                className="bg-white text-primary hover:bg-[#F3F7F6] text-base px-8 py-6 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                <Scan className="h-5 w-5 mr-2" />
                Scan Medication
              </Button>
            </Link>
            <Link to="/methodology">
              <Button
                size="lg"
                className="bg-white/12 border border-white/35 text-white hover:bg-white hover:text-primary hover:border-white text-base px-8 py-6 rounded-full transition-all duration-200 hover:shadow-md"
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
