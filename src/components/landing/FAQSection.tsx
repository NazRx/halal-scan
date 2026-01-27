import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Who is behind HalalRx?",
    answer:
      "HalalRx was founded by a Muslim Doctor of Pharmacy (PharmD) who saw firsthand the challenges Muslims face when trying to verify medication ingredients. Our team combines clinical pharmacy expertise with Islamic scholarship to provide accurate, trustworthy guidance. We're Muslims building for Muslims—we understand your needs because we share them.",
  },
  {
    question: "How accurate is the halal status determination?",
    answer:
      "Our database is compiled from manufacturer ingredient lists, halal certification bodies, and reviewed by Islamic scholars. We provide confidence levels with each result. However, we always recommend verifying with the manufacturer or a certified halal organization for final confirmation.",
  },
  {
    question: "Why do prescription medications vary by manufacturer?",
    answer:
      "While the active ingredient in prescription medications is the same across manufacturers (generic vs. brand), the inactive ingredients (fillers, coatings, dyes) can vary significantly. Some inactive ingredients may be derived from animal sources. That's why we track manufacturer-specific formulations.",
  },
  {
    question: "What if a product shows 'Unknown' status?",
    answer:
      "An 'Unknown' status means we don't have enough verified information about one or more ingredients. You can submit a 'Request Review' and our team will research the product. We'll notify you when the review is complete.",
  },
  {
    question: "Does 'Questionable' mean I can't take it?",
    answer:
      "'Questionable' means there are ingredients that have differing scholarly opinions or uncertain sourcing. We recommend consulting with a knowledgeable Islamic scholar about your specific situation. In cases of medical necessity (darura), permissibility rules may differ.",
  },
  {
    question: "Do you store my medical information?",
    answer:
      "No. We do not collect, store, or share any patient-identifying information or medical records. Your scan history is stored locally on your device unless you create an account, in which case it's encrypted and private to you.",
  },
  {
    question: "Can I use this for my pharmacy or clinic?",
    answer:
      "Yes! Our Clinic plan is designed for healthcare providers. It includes team access, API integration, bulk lookups, and can be white-labeled. Contact our sales team for enterprise solutions.",
  },
  {
    question: "What about medical necessity (darura)?",
    answer:
      "Islamic jurisprudence recognizes that in cases of genuine medical necessity where no halal alternative exists, normally impermissible ingredients may become permissible. This is a personal religious decision that should be made in consultation with a qualified scholar and your healthcare provider.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about HalalRx.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-xl px-6 bg-card"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
