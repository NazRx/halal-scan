import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Check, AlertTriangle, X, HelpCircle } from "lucide-react";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
  {
    variants: {
      status: {
        halal: "bg-status-halal-bg text-status-halal border border-status-halal/20",
        questionable: "bg-status-questionable-bg text-status-questionable border border-status-questionable/20",
        "not-halal": "bg-status-not-halal-bg text-status-not-halal border border-status-not-halal/20",
        unknown: "bg-status-unknown-bg text-status-unknown border border-status-unknown/20",
      },
      size: {
        sm: "text-xs px-3 py-1",
        md: "text-sm px-4 py-2",
        lg: "text-lg px-6 py-3",
        xl: "text-2xl px-8 py-4 font-bold",
      },
    },
    defaultVariants: {
      status: "unknown",
      size: "md",
    },
  }
);

const statusIcons = {
  halal: Check,
  questionable: AlertTriangle,
  "not-halal": X,
  unknown: HelpCircle,
};

const statusLabels = {
  halal: "Halal",
  questionable: "Questionable",
  "not-halal": "Not Halal",
  unknown: "Unknown",
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  showIcon?: boolean;
  showLabel?: boolean;
  animate?: boolean;
}

export function StatusBadge({
  className,
  status,
  size,
  showIcon = true,
  showLabel = true,
  animate = false,
  ...props
}: StatusBadgeProps) {
  const Icon = statusIcons[status || "unknown"];
  const label = statusLabels[status || "unknown"];

  return (
    <div
      className={cn(
        statusBadgeVariants({ status, size }),
        animate && "animate-status-glow",
        className
      )}
      {...props}
    >
      {showIcon && <Icon className={size === "xl" ? "h-7 w-7" : size === "lg" ? "h-5 w-5" : "h-4 w-4"} />}
      {showLabel && <span>{label}</span>}
    </div>
  );
}
