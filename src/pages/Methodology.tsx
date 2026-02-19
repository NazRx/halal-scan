import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database, AlertTriangle, BookOpen, Scale, Heart } from "lucide-react";

const sections = [
  {
    icon: Database,
    title: "Data Sources",
    content: [
      {
        heading: "Primary Sources Used",
        items: [
          "FDA DailyMed labeling database",
          "Manufacturer package inserts",
          "OTC product labeling disclosures",
          "Inactive ingredient listings from regulatory filings",
          "Public regulatory documentation",
        ],
      },
    ],
  },
  {
    icon: AlertTriangle,
    title: "Ingredient Flagging Criteria",
    content: [
      {
        heading: "Ingredients Flagged for Review",
        items: [
          "Porcine (pig-derived) derivatives — including gelatin, lard, and porcine glycerin",
          "Gelatin — when source is not specified as bovine or plant-based",
          "Ethanol and alcohol-based excipients — including alcohol-containing syrups and solutions",
          "Magnesium stearate — when animal origin is disclosed or suspected",
          "Unspecified flavoring components — when source cannot be determined from public data",
          "Carmine and cochineal extract — insect-derived colorants",
        ],
      },
    ],
  },
  {
    icon: BookOpen,
    title: "Disclosure Limitations",
    content: [
      {
        heading: "What We Cannot Determine",
        items: [
          "Many manufacturers do not publicly disclose raw material origin",
          "Some inactive ingredients are listed without source details (e.g., 'gelatin' without specifying bovine, porcine, or plant-based)",
          "Formulations can and do change — ingredient lists may not reflect current production",
          "Supply chain sourcing for excipients is rarely disclosed in FDA labeling",
          "AmanahRx does not have access to proprietary manufacturer records",
        ],
      },
    ],
  },
  {
    icon: Scale,
    title: "Interpretation Differences",
    content: [
      {
        heading: "Where Scholarly Opinions Differ",
        items: [
          "Transformation (istihalah) — whether a substance changes enough chemically to alter its ruling",
          "Alcohol thresholds — opinions differ on permissible concentrations in medications",
          "Gelatin permissibility — views vary on bovine gelatin and transformation-based arguments",
          "Carmine and insect-derived ingredients — different scholarly positions exist",
          "AmanahRx does not adjudicate these differences and presents information neutrally",
        ],
      },
    ],
  },
  {
    icon: Heart,
    title: "Medical Necessity",
    content: [
      {
        heading: "Darura (Necessity) Principle",
        items: [
          "Islamic legal principles recognize that medical necessity (darura) may affect rulings",
          "In certain medical circumstances, ingredients that would otherwise be of concern may be permissible",
          "This determination requires qualified scholarly guidance — not an app",
          "AmanahRx encourages users to consult trusted scholars in situations of medical necessity",
          "Healthcare providers should also be consulted regarding treatment decisions",
        ],
      },
    ],
  },
];

export default function Methodology() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <section className="container max-w-3xl px-4 pb-20">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
              AmanahRx
            </p>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Our Research Methodology
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AmanahRx organizes publicly available information to help Muslims review medication
              ingredients. This page describes our data sources, flagging criteria, known limitations,
              and areas where scholarly interpretation varies.
            </p>
          </motion.div>

          {/* Disclaimer box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-muted/30 p-6 mb-12 space-y-2"
          >
            <p className="font-semibold text-foreground text-sm">Important Clarification</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AmanahRx does not issue religious rulings. We do not certify products as halal or haram.
              We provide structured ingredient transparency based on publicly available data.
              Users are responsible for consulting qualified scholars and healthcare professionals
              before making medical or religious decisions.
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                  </div>

                  {section.content.map((block) => (
                    <div key={block.heading} className="space-y-3">
                      <h3 className="font-semibold text-foreground">{block.heading}</h3>
                      <ul className="space-y-2">
                        {block.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 text-muted-foreground text-sm leading-relaxed"
                          >
                            <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/40" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </div>

          {/* Footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 pt-8 border-t border-border space-y-3"
          >
            <p className="font-semibold text-foreground">A Note on Responsibility</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AmanahRx is an informational platform maintained by a small independent team.
              We make every effort to use accurate and current public data, but formulations
              change and information may not always reflect the current state of a product.
              Always verify with the manufacturer, your pharmacist, and your scholar when
              making decisions of religious significance.
            </p>
            <div className="flex gap-3 pt-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/disclaimer">Full Disclaimer</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/feedback">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
