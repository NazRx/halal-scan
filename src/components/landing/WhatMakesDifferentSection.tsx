import { motion } from "framer-motion";
import { Check } from "lucide-react";

const items = [
  "Ingredient-level analysis",
  "Manufacturer-specific variation tracking",
  "Public FDA labeling cross-reference",
  "Clear confidence indicators",
  "Honest disclosure when information is limited",
];

export function WhatMakesDifferentSection() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-10 text-foreground text-center tracking-tight">
            Built on Transparency, Not Assumptions
          </h2>

          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>HalalRx does not guess.</p>
            <p>We do not rely on internet rumors or generalized claims.</p>
            <p>Each medication review includes:</p>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-foreground font-medium">
              We believe transparency about uncertainty is more ethical than absolute claims.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
