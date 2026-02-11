import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchCTA } from "@/components/landing/SearchCTA";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is this a fatwa?",
    a: "No. This platform provides ingredient transparency and research analysis. Religious rulings should be discussed with qualified scholars.",
  },
  {
    q: "How accurate is the data?",
    a: "We use FDA labeling databases and manufacturer documentation when available. Formulations can change — always confirm with your pharmacist or provider.",
  },
  {
    q: 'Why are some results labeled "Uncertain"?',
    a: "Some inactive ingredients do not disclose animal or plant origin publicly.",
  },
  {
    q: "Do you contact manufacturers?",
    a: "Planned for future Pro-level analysis.",
  },
  {
    q: "Why is Pro paid?",
    a: "To support research time, data verification, and platform sustainability.",
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <section className="container max-w-3xl px-4 pb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight"
          >
            Frequently Asked Questions
          </motion.h1>
        </section>

        <section className="container max-w-3xl px-4 pb-16">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-medium">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <SearchCTA />
      </main>
      <Footer />
    </div>
  );
}
