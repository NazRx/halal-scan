import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Scan, Command } from "lucide-react";
import { cn } from "@/lib/utils";

const placeholderExamples = [
  "Search for Tylenol...",
  "Search for Advil...",
  "Search for Atorvastatin...",
  "Search for Lisinopril...",
  "Search for Metformin...",
];

export function HeroSearchInput() {
  const navigate = useNavigate();
  const [placeholder, setPlaceholder] = useState(placeholderExamples[0]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setPlaceholder(placeholderExamples[placeholderIndex]);
  }, [placeholderIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/rx-search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleScan = () => {
    navigate("/otc-scan");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "relative flex items-center gap-3 rounded-2xl border-2 bg-card/80 backdrop-blur-xl px-4 py-3 transition-all duration-300",
            isFocused 
              ? "border-primary shadow-lg shadow-primary/10" 
              : "border-border hover:border-primary/50"
          )}
        >
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-lg"
          />

          <div className="flex items-center gap-2 shrink-0">
            {/* Keyboard shortcut hint */}
            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>

            {/* Scan button */}
            <button
              type="button"
              onClick={handleScan}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              <Scan className="h-4 w-4" />
              <span className="hidden sm:inline">Scan</span>
            </button>
          </div>
        </div>
      </form>

      {/* Quick action pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
        <button
          onClick={() => navigate("/otc-scan")}
          className="px-4 py-2 rounded-full border bg-card/50 hover:bg-card hover:border-primary/50 text-sm transition-all"
        >
          📦 Scan OTC
        </button>
        <button
          onClick={() => navigate("/rx-search")}
          className="px-4 py-2 rounded-full border bg-card/50 hover:bg-card hover:border-primary/50 text-sm transition-all"
        >
          💊 Search Rx
        </button>
        <button
          onClick={() => navigate("/browse")}
          className="px-4 py-2 rounded-full border bg-card/50 hover:bg-card hover:border-primary/50 text-sm transition-all"
        >
          📋 Browse All
        </button>
      </div>
    </motion.div>
  );
}
