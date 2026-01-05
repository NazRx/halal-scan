import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariantAwarenessBannerProps {
  className?: string;
}

export function VariantAwarenessBanner({ className }: VariantAwarenessBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl bg-status-questionable-bg border border-status-questionable/20",
        className
      )}
    >
      <AlertTriangle className="h-5 w-5 text-status-questionable flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-status-questionable">
          Inactive ingredients vary by manufacturer and formulation
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Select a manufacturer from your bottle label for the most accurate information.
        </p>
      </div>
    </div>
  );
}
