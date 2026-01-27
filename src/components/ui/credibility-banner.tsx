import { Stethoscope, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface CredibilityBannerProps {
  variant?: "default" | "compact";
  className?: string;
}

export function CredibilityBanner({ variant = "default", className }: CredibilityBannerProps) {
  if (variant === "compact") {
    return (
      <div className={cn(
        "flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground",
        className
      )}>
        <div className="flex items-center gap-1.5">
          <Stethoscope className="h-3.5 w-3.5 text-primary" />
          <span>PharmD Reviewed</span>
        </div>
        <div className="hidden sm:block w-px h-3 bg-border" />
        <div className="flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-primary" />
          <span>Made by Muslims, for Muslims</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl border bg-card/50 backdrop-blur-sm p-4",
      className
    )}>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Clinically Reviewed</p>
            <p className="text-xs text-muted-foreground">by a Doctor of Pharmacy</p>
          </div>
        </div>
        <div className="hidden sm:block w-px h-10 bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Heart className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Made by Muslims</p>
            <p className="text-xs text-muted-foreground">for the Ummah</p>
          </div>
        </div>
      </div>
    </div>
  );
}
