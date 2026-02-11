import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchCTA } from "@/components/landing/SearchCTA";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            Terms of Service
          </motion.h1>

          <div className="prose prose-muted max-w-none space-y-6 text-muted-foreground">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Informational Purposes Only</h2>
              <p>All content provided on this platform is for informational and educational purposes only. It is not intended to serve as medical advice, pharmaceutical counsel, or religious guidance.</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Not Medical Advice</h2>
              <p>The information on HalalRx does not constitute medical advice. Always consult your healthcare provider before making any changes to your medication regimen.</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Not a Religious Ruling</h2>
              <p>This platform does not issue fatwas or religious rulings. Our analysis provides ingredient transparency to support your own informed decision-making in consultation with qualified Islamic scholars.</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Limitation of Liability</h2>
              <p>HalalRx is not liable for any decisions made based on the information provided. Users are solely responsible for confirming medication suitability with their healthcare providers and religious advisors.</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Subscription Terms</h2>
              <p>Pro subscriptions are billed according to the plan selected. Users may cancel at any time. Refund policies are outlined at the time of purchase.</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Right to Modify</h2>
              <p>HalalRx reserves the right to modify, update, or discontinue any feature or content on the platform at any time without prior notice.</p>
            </div>
          </div>
        </section>
        <SearchCTA />
      </main>
      <Footer />
    </div>
  );
}
