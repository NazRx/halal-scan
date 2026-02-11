import { motion } from "framer-motion";

const items = [
  "Ingredient-level analysis",
  "Manufacturer-specific variation tracking",
  "Public FDA labeling cross-reference",
  "Clear confidence indicators",
  "Honest disclosure when information is limited",
];

export function WhatMakesDifferentSection() {
  return (
    <section className="py-24">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-foreground text-center">
            Built on Transparency, Not Assumptions
          </h2>

          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>HalalRx does not guess.</p>
            <p>We do not rely on internet rumors or generalized claims.</p>
            <p>Each medication review includes:</p>

            <ul className="space-y-3 pl-1">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-foreground font-medium">
              We believe transparency about uncertainty is more ethical than absolute claims.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
