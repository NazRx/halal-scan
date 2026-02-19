import { motion } from "framer-motion";
import { Check } from "lucide-react";

const items = [
  "Ingredient-level analysis from public sources",
  "Manufacturer-specific variation when documented",
  "Cross-reference to regulatory labeling",
  "Clear disclosure when certainty is not possible",
  "Careful language that avoids overstatement",
];

const notItems = [
  "Does not access proprietary sourcing data",
  "Does not independently verify raw material origin unless explicitly disclosed",
  "Does not issue religious rulings (fatwa)",
  "Does not replace consultation with qualified scholars or healthcare professionals",
];

export function WhatMakesDifferentSection() {
  return (
    <section className="py-28" style={{ background: "#F4FBFA" }}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="font-sans text-4xl md:text-5xl font-bold mb-3 text-foreground text-center tracking-tight leading-[1.15]">
            Built on Transparency, Not Assumption
          </h2>
          <div className="flex justify-center mb-10">
            <div className="h-0.5 w-12 rounded-full" style={{ background: "rgba(42,140,127,0.30)" }} />
          </div>

          <div className="space-y-7 text-muted-foreground text-lg leading-[1.8]">
            <p>Each review includes:</p>

            <div
              className="rounded-[18px] p-6"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E6F5F2",
                boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
              }}
            >
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(42,140,127,0.10)" }}
                    >
                      <Check className="h-3 w-3" style={{ color: "#2A8C7F" }} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Limitations section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mt-20"
        >
          <h2 className="font-sans text-3xl md:text-4xl font-bold mb-3 text-foreground text-center tracking-tight leading-[1.15]">
            Important Limitations
          </h2>
          <div className="flex justify-center mb-10">
            <div className="h-0.5 w-12 rounded-full" style={{ background: "rgba(42,140,127,0.30)" }} />
          </div>

          <div className="space-y-7 text-muted-foreground text-lg leading-[1.8]">
            <p>AmanahRx:</p>

            <div
              className="rounded-[18px] p-6"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E6F5F2",
                boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
              }}
            >
              <ul className="space-y-3">
                {notItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted-foreground">
                    <span className="mt-1 flex-shrink-0" style={{ color: "rgba(42,140,127,0.45)" }}>
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-base italic text-center text-muted-foreground">
              Where certainty is not possible, uncertainty is stated.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
