import { motion } from "framer-motion";
import { Check } from "lucide-react";

const items = [
  "Ingredient-level analysis from public sources",
  "Manufacturer-specific variation tracking",
  "FDA labeling cross-reference (DailyMed)",
  "Clear disclosure when information is limited",
  "Clear disclosure when certainty is not possible.",
];

const notItems = [
  "Does not access proprietary manufacturer sourcing data",
  "Does not verify raw material origin unless explicitly disclosed",
  "Does not provide religious rulings",
  "Does not replace scholarly consultation",
];

export function WhatMakesDifferentSection() {
  return (
    <section className="py-28" style={{ background: "#FFFFFF" }}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-3 text-foreground text-center tracking-tight">
            Built on Transparency, Not Assumptions
          </h2>
          <div className="flex justify-center mb-10">
            <div className="h-0.5 w-12 rounded-full" style={{ background: "rgba(31,92,82,0.3)" }} />
          </div>

          <div className="space-y-7 text-muted-foreground text-lg leading-[1.8]">
            <p>Each medication review is based on publicly available data. Each analysis includes:</p>

            <div
              className="rounded-2xl p-6"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5EFEC",
                boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
              }}
            >
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(31,92,82,0.08)" }}>
                      <Check className="h-3 w-3" style={{ color: "#1F5C52" }} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="font-semibold text-foreground">Important Limitations</p>

            <div
              className="rounded-2xl p-6"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5EFEC",
                boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
              }}
            >
              <ul className="space-y-3">
                {notItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted-foreground">
                    <span className="mt-1 flex-shrink-0" style={{ color: "rgba(31,92,82,0.4)" }}>—</span>
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
