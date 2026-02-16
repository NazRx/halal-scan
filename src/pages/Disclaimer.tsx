import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle } from "lucide-react";
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
            Medical & Religious Disclaimer
          </motion.h1>

          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">Important Notice</span>
            </div>
            <p className="text-muted-foreground">This platform:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                Does not replace your pharmacist
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                Does not replace your physician
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                Does not issue fatwas
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                Does not guarantee formulation consistency
              </li>
            </ul>
          </div>

          <div className="space-y-4 text-muted-foreground">
            <p>
              Medication ingredients may change without notice. Manufacturers may alter inactive ingredient sources, suppliers, or formulations at any time.
            </p>
            <p>
              Users must confirm with healthcare professionals and qualified Islamic scholars when needed. The information provided on this platform is intended to support — not replace — professional guidance.
            </p>
          </div>
        </section>
        <SearchCTA />
      </main>
      <Footer />
    </div>
  );
}
