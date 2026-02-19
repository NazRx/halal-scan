import { motion } from "framer-motion";
import { Check } from "lucide-react";

const items = [
  "Ingredient-level analysis from public sources",
  "Manufacturer-specific variation tracking",
  "FDA labeling cross-reference (DailyMed)",
  "Clear disclosure when information is limited",
  "No overstatement of certainty",
];

const notItems = [
  "Does not access proprietary manufacturer sourcing data",
  "Does not verify raw material origin unless explicitly disclosed",
  "Does not provide religious rulings",
  "Does not replace scholarly consultation",
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
            <p>Each medication review is based on publicly available data. Each analysis includes:</p>

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

            <p className="font-medium text-foreground">Important Limitations</p>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <ul className="space-y-3">
                {notItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted-foreground">
                    <span className="mt-1 flex-shrink-0 text-muted-foreground/50">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-foreground font-medium">
              Transparency about uncertainty is more responsible than absolute claims.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
