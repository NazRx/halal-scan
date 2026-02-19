import { motion } from "framer-motion";
import { ArrowLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchCTA } from "@/components/landing/SearchCTA";

export default function Disclaimer() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <section className="container max-w-3xl px-4 pb-16 space-y-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/legal">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Legal
            </Link>
          </Button>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight"
          >
            Disclaimer
          </motion.h1>

          <div className="rounded-lg border border-border bg-muted/30 p-6 space-y-4">
            <div className="flex items-center gap-2 text-foreground">
              <Info className="h-5 w-5 text-primary" />
              <span className="font-semibold">About AmanahRx</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AmanahRx is an informational research platform. We do not issue religious rulings (fatwa).
              We do not certify products as halal or haram. We provide structured ingredient
              transparency based on publicly available data.
            </p>
          </div>

          <div className="space-y-6 text-muted-foreground">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">This Platform Does Not:</h2>
              <ul className="space-y-2">
                {[
                  "Issue religious rulings (fatwa) on any ingredient or product",
                  "Certify products as halal or haram",
                  "Replace your pharmacist or physician",
                  "Guarantee formulation consistency — ingredients can change without notice",
                  "Access proprietary manufacturer sourcing data",
                  "Verify raw material origin unless explicitly disclosed in public records",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">User Responsibility</h2>
              <p className="text-sm leading-relaxed">
                Users are responsible for consulting qualified Islamic scholars and licensed
                healthcare professionals before making medical or religious decisions.
                The information provided on this platform is intended to support — not
                replace — professional and scholarly guidance.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Data Accuracy</h2>
              <p className="text-sm leading-relaxed">
                Medication ingredients may change without notice. Manufacturers may alter
                inactive ingredient sources, suppliers, or formulations at any time.
                AmanahRx makes reasonable efforts to maintain current information but
                cannot guarantee that all data reflects the current state of a product.
              </p>
              <p className="text-sm leading-relaxed">
                When in doubt, contact the manufacturer directly and consult a qualified pharmacist.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Scholarly Differences</h2>
              <p className="text-sm leading-relaxed">
                Scholarly opinions differ on several ingredient categories including gelatin
                permissibility, alcohol thresholds in medication, transformation (istihalah),
                and insect-derived ingredients. AmanahRx does not adjudicate these differences.
                Users should consult scholars whose positions they trust.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Medical Necessity</h2>
              <p className="text-sm leading-relaxed">
                In cases where medical necessity applies, Islamic legal principles (darura)
                may be relevant to a user's situation. This determination requires qualified
                scholarly guidance. AmanahRx encourages users to consult trusted scholars
                and healthcare providers in such situations.
              </p>
            </div>
          </div>
        </section>
        <SearchCTA />
      </main>
      <Footer />
    </div>
  );
}
