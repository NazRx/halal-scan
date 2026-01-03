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

const features = [
  {
    icon: Camera,
    title: "Barcode Scanner",
    description: "Instantly scan OTC product barcodes using your phone's camera for quick lookups.",
  },
  {
    icon: Database,
    title: "Extensive Database",
    description: "Access 50,000+ OTC products and 10,000+ prescription medications with ingredient data.",
  },
  {
    icon: Building2,
    title: "Manufacturer Variants",
    description: "Rx medications track manufacturer-specific inactive ingredients that may vary.",
  },
  {
    icon: Shield,
    title: "Scholar Reviewed",
    description: "Ingredient classifications reviewed by qualified Islamic scholars and halal certifiers.",
  },
  {
    icon: FileText,
    title: "Shareable Reports",
    description: "Generate detailed PDF reports to share with healthcare providers or family.",
  },
  {
    icon: AlertTriangle,
    title: "Request Reviews",
    description: "Can't find a product? Submit it for review and get notified when it's added.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Designed for use at the pharmacy counter when you need answers fast.",
  },
  {
    icon: Clock,
    title: "Recent History",
    description: "Quickly access your recently scanned products and saved medications.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools to help you make informed decisions about medications.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group p-6 rounded-2xl border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
