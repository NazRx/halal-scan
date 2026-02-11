import { motion } from "framer-motion";
import { BookOpen, FlaskConical, ShieldCheck, AlertTriangle, UserCheck, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchCTA } from "@/components/landing/SearchCTA";

const analysisMethods = [
  { icon: FlaskConical, text: "We review publicly available FDA labeling data" },
  { icon: ShieldCheck, text: "We evaluate inactive ingredients" },
  { icon: AlertTriangle, text: "We flag potential animal-derived sources" },
  { icon: BookOpen, text: "We assign a confidence level" },
  { icon: UserCheck, text: "Final religious determination is personal/scholarly" },
];

const guides = [
  { title: "Understanding Gelatin in Medicines", slug: "#" },
  { title: "Alcohol in Liquid Formulations", slug: "#" },
  { title: "Magnesium Stearate: What We Know", slug: "#" },
  { title: "Capsule Sources Explained", slug: "#" },
];

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function Resources() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="container max-w-3xl px-4 pb-12 text-center space-y-3">
          <motion.h1 {...fade} className="text-4xl md:text-5xl font-bold tracking-tight">
            Resources for Halal Medication Clarity
          </motion.h1>
          <motion.p {...fade} transition={{ delay: 0.1 }} className="text-lg text-muted-foreground">
            Supporting Your Search for Certainty
          </motion.p>
          <motion.p {...fade} transition={{ delay: 0.15 }} className="text-muted-foreground max-w-xl mx-auto">
            Educational tools to help you understand medications, ingredients, and Islamic considerations.
          </motion.p>
        </section>

        {/* How We Analyze */}
        <section className="container max-w-3xl px-4 py-12 space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> How We Analyze Medications
          </h2>
          <ul className="space-y-4">
            {analysisMethods.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <item.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Educational Guides */}
        <section className="bg-muted/30 border-y">
          <div className="container max-w-3xl px-4 py-12 space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">📚 Educational Guides</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {guides.map((guide) => (
                <Card key={guide.title} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <h3 className="font-medium">{guide.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Review Request CTA */}
        <section className="container max-w-3xl px-4 py-12 text-center space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">🔍 Need a Specific Medication Reviewed?</h2>
          <Button asChild>
            <Link to="/feedback">
              <Send className="h-4 w-4 mr-2" />
              Submit a Review Request
            </Link>
          </Button>
        </section>

        <SearchCTA />
      </main>
      <Footer />
    </div>
  );
}
