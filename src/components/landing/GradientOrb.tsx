import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientOrbProps {
  className?: string;
  color?: "primary" | "accent" | "secondary";
  size?: "sm" | "md" | "lg" | "xl";
  delay?: number;
}

const sizeClasses = {
  sm: "h-32 w-32",
  md: "h-48 w-48",
  lg: "h-64 w-64",
  xl: "h-96 w-96",
};

const colorClasses = {
  primary: "bg-primary/20",
  accent: "bg-accent/30",
  secondary: "bg-secondary/20",
};

export function GradientOrb({ 
  className, 
  color = "primary", 
  size = "lg",
  delay = 0 
}: GradientOrbProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -20, 0],
      }}
      transition={{
        opacity: { duration: 1, delay },
        scale: { duration: 1, delay },
        y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={cn(
        "absolute rounded-full blur-3xl pointer-events-none",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}
