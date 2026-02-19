import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Search, AlertTriangle, Info, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { STATUS_LABELS_SHORT, STATUS_TOOLTIPS, type UIStatus } from "@/lib/status-labels";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all cursor-help",
  {
    variants: {
      status: {
        halal: "bg-muted text-foreground border border-border",
        questionable: "bg-muted text-foreground border border-border",
        "not-halal": "bg-muted text-foreground border border-border",
        unknown: "bg-muted text-muted-foreground border border-border",
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
  halal: Search,
  questionable: AlertTriangle,
  "not-halal": Info,
  unknown: HelpCircle,
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  showIcon?: boolean;
  showLabel?: boolean;
  showEmoji?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
}

export function StatusBadge({
  className,
  status,
  size,
  showIcon = true,
  showLabel = true,
  showTooltip = true,
  ...props
}: StatusBadgeProps) {
  const statusKey = (status || "unknown") as UIStatus;
  const Icon = statusIcons[statusKey];
  const label = STATUS_LABELS_SHORT[statusKey];
  const tooltip = STATUS_TOOLTIPS[statusKey];

  const badge = (
    <div
      className={cn(
        statusBadgeVariants({ status, size }),
        !showTooltip && "cursor-default",
        className
      )}
      {...props}
    >
      {showIcon && <Icon className={size === "xl" ? "h-7 w-7" : size === "lg" ? "h-5 w-5" : "h-4 w-4"} />}
      {showLabel && <span>{label}</span>}
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-center" side="bottom">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}
