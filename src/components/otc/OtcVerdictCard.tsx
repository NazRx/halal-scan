import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, HelpCircle, XCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { OtcVerdictOutput } from "@/lib/otcVerdict";

interface OtcVerdictCardProps {
  verdict: OtcVerdictOutput;
  hasIngredientProfile: boolean;
  profileSource: "brand_override" | "generic" | "none";
}

const statusConfig = {
  likely_halal: {
    label: "Likely halal",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    iconClassName: "text-green-600 dark:text-green-400",
  },
  use_caution: {
    label: "Use caution",
    icon: AlertTriangle,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    iconClassName: "text-yellow-600 dark:text-yellow-400",
  },
  unknown: {
    label: "Brand-specific details not yet verified",
    icon: HelpCircle,
    className: "bg-muted text-muted-foreground border-muted",
    iconClassName: "text-muted-foreground",
  },
  likely_haram: {
    label: "Likely not halal",
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    iconClassName: "text-red-600 dark:text-red-400",
  },
};

export function OtcVerdictCard({ verdict, hasIngredientProfile, profileSource }: OtcVerdictCardProps) {
  const config = statusConfig[verdict.status];
  const Icon = config.icon;

  return (
    <Card className={`p-6 border-2 ${config.className}`}>
      <div className="flex flex-col items-center text-center">
        <Icon className={`h-12 w-12 mb-3 ${config.iconClassName}`} />
        
        <h2 className="text-xl font-bold mb-2">{config.label}</h2>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium">
            Confidence: {verdict.confidence}%
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Confidence reflects how complete the ingredient/formulation info is and whether common high-risk excipients are present. It's not a religious ruling.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {verdict.status === "unknown" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              We don't yet have the inactive ingredient details for this specific OTC product and brand.
            </p>
            <p className="text-xs italic">
              We do not assume halal status when formulation details are unclear.
            </p>
          </div>
        )}

        {verdict.status !== "unknown" && verdict.rationaleShort && (
          <p className="text-sm text-muted-foreground">
            {verdict.rationaleShort}
          </p>
        )}

        {/* Profile source indicator */}
        {profileSource === "brand_override" && (
          <Badge variant="secondary" className="mt-3 text-xs">
            Verdict reflects the selected brand's formulation
          </Badge>
        )}
        {profileSource === "generic" && hasIngredientProfile && (
          <p className="text-xs text-muted-foreground mt-3">
            Formulations can vary by brand. Select a brand to refine confidence.
          </p>
        )}
      </div>
    </Card>
  );
}
