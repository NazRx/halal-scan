import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface BentoCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  size?: "sm" | "md" | "lg" | "xl";
  gradient?: boolean;
  className?: string;
  delay?: number;
}

const sizeClasses = {
  sm: "col-span-1 row-span-1",
  md: "col-span-1 row-span-1 md:col-span-1",
  lg: "col-span-1 md:col-span-2 row-span-1",
  xl: "col-span-1 md:col-span-2 row-span-2",
};

export function BentoCard({
  title,
  description,
  icon: Icon,
  size = "md",
  gradient = false,
  className,
  delay = 0,
}: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={cn(
        "group relative rounded-3xl border bg-card/50 backdrop-blur-sm p-6 overflow-hidden transition-all duration-300",
        "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
        sizeClasses[size],
        className
      )}
    >
      {/* Gradient overlay on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        gradient && "bg-gradient-to-br from-primary/5 via-transparent to-accent/5"
      )} />

      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 h-full flex flex-col">
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300",
          gradient 
            ? "bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30" 
            : "bg-primary/10 group-hover:bg-primary/20"
        )}>
          <Icon className="h-6 w-6 text-primary" />
        </div>

        {/* Content */}
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground flex-1">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
