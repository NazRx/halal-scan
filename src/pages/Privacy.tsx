import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchCTA } from "@/components/landing/SearchCTA";

export default function Privacy() {
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
            Privacy Policy
          </motion.h1>

          <div className="prose prose-muted max-w-none space-y-6 text-muted-foreground">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Data Collection</h2>
              <p>We collect minimal data necessary to provide our services. This includes your email address for account creation and basic usage analytics to improve the platform.</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">No Selling of Personal Data</h2>
              <p>We do not sell, trade, or share your personal data with third parties for marketing purposes. Your trust is paramount to our mission.</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Secure Storage</h2>
              <p>All data is stored using industry-standard encryption and secure cloud infrastructure. We follow best practices for data protection and access control.</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Payment Handling</h2>
              <p>Payment processing is handled securely through Stripe. We do not store your credit card information on our servers.</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal data at any time. You may also request a copy of all data we hold about you.</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Contact</h2>
              <p>For any privacy-related questions or requests, please contact us at <span className="text-primary">privacy@halalrx.com</span>.</p>
            </div>
          </div>
        </section>
        <SearchCTA />
      </main>
      <Footer />
    </div>
  );
}
