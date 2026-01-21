import { motion } from "framer-motion";
import { 
  Camera, 
  Database, 
  Shield, 
  FileText, 
  Building2, 
  AlertTriangle,
  Smartphone,
  Clock
} from "lucide-react";
import { BentoCard } from "./BentoCard";

const features = [
  {
    icon: Camera,
    title: "Barcode Scanner",
    description: "Instantly scan OTC product barcodes using your phone's camera for quick lookups.",
    size: "lg" as const,
    gradient: true,
  },
  {
    icon: Database,
    title: "Extensive Database",
    description: "Access 50,000+ OTC products and 10,000+ prescription medications with ingredient data.",
    size: "md" as const,
  },
  {
    icon: Building2,
    title: "Manufacturer Variants",
    description: "Rx medications track manufacturer-specific inactive ingredients that may vary.",
    size: "md" as const,
  },
  {
    icon: Shield,
    title: "Scholar Reviewed",
    description: "Ingredient classifications reviewed by qualified Islamic scholars and halal certifiers.",
    size: "lg" as const,
    gradient: true,
  },
  {
    icon: FileText,
    title: "Shareable Reports",
    description: "Generate detailed PDF reports to share with healthcare providers or family.",
    size: "md" as const,
  },
  {
    icon: AlertTriangle,
    title: "Request Reviews",
    description: "Can't find a product? Submit it for review and get notified when it's added.",
    size: "md" as const,
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Designed for use at the pharmacy counter when you need answers fast.",
    size: "md" as const,
  },
  {
    icon: Clock,
    title: "Recent History",
    description: "Quickly access your recently scanned products and saved medications.",
    size: "md" as const,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent pointer-events-none" />
      
      <div className="container px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Comprehensive tools to help you make informed decisions about medications.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
          {features.map((feature, index) => (
            <BentoCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              size={feature.size}
              gradient={feature.gradient}
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
