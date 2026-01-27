import { motion } from "framer-motion";
import { Heart, Stethoscope, BookOpen, Users } from "lucide-react";

const trustPoints = [
  {
    icon: Stethoscope,
    title: "PharmD Founded",
    description: "Built by a Doctor of Pharmacy who understands clinical complexities.",
  },
  {
    icon: Heart,
    title: "Made by Muslims",
    description: "Created by Muslims who share your values and understand your needs.",
  },
  {
    icon: BookOpen,
    title: "Scholar Reviewed",
    description: "Every classification is reviewed against Islamic jurisprudence.",
  },
  {
    icon: Users,
    title: "For the Ummah",
    description: "Serving our community with accuracy, care, and transparency.",
  },
];

export function CredibilitySection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container px-4 relative">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
              Our Story
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Made by Muslims,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                for Muslims
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              HalalRx was founded by a Muslim Doctor of Pharmacy who saw firsthand 
              the challenges our community faces when trying to verify medication ingredients.
            </p>
          </motion.div>

          {/* Founder Quote Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative rounded-3xl border bg-card/50 backdrop-blur-sm p-8 md:p-12 mb-16"
          >
            {/* Decorative quote mark */}
            <div className="absolute -top-4 left-8 text-6xl text-primary/20 font-serif">"</div>
            
            <div className="grid md:grid-cols-[1fr,2fr] gap-8 items-center">
              {/* Avatar placeholder */}
              <div className="flex justify-center">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-4 border-primary/10">
                  <Stethoscope className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                </div>
              </div>
              
              {/* Quote */}
              <div>
                <p className="text-lg md:text-xl text-foreground/90 italic mb-6 leading-relaxed">
                  As a Muslim pharmacist, I've counseled countless patients who simply wanted to know 
                  if their medications aligned with their faith. The information was scattered, 
                  unreliable, or non-existent. HalalRx is my answer to that need—clinically accurate, 
                  Islamically mindful, and built with love for our Ummah.
                </p>
                <div>
                  <p className="font-semibold text-foreground">Dr. Sarah Ahmed, PharmD</p>
                  <p className="text-sm text-muted-foreground">Founder & Chief Pharmacist</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trust Points Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPoints.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <point.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{point.title}</h3>
                <p className="text-sm text-muted-foreground">{point.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Bottom tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12 pt-8 border-t border-border/50"
          >
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Clinically accurate.</span>
              {" "}
              <span className="text-foreground font-medium">Islamically mindful.</span>
              {" "}
              <span className="text-primary font-medium">Built for you.</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
