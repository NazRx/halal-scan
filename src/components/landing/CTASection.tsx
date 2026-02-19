import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Scan } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto rounded-3xl gradient-hero p-12 md:p-16 text-center overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Review Your Medication
            </h2>

            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Structured ingredient research. Publicly available data. No overstatement.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/rx/search">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-xl"
                >
                  Search Medication
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/otc/scan">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-primary-foreground hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
                >
                  <Scan className="h-5 w-5 mr-2" />
                  Scan Barcode
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-sm text-primary-foreground/60">
              AmanahRx does not issue rulings. Always consult qualified scholars and healthcare professionals.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
