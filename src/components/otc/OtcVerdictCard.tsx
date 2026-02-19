import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, HelpCircle, Info } from "lucide-react";
import type { OtcVerdictOutput } from "@/lib/otcVerdict";

interface OtcVerdictCardProps {
  verdict: OtcVerdictOutput;
  hasIngredientProfile: boolean;
  profileSource: "brand_override" | "generic" | "none";
}

const statusConfig = {
  likely_halal: {
    label: "No Flagged Concerns Identified",
    icon: Search,
    className: "bg-muted text-foreground border-border",
    iconClassName: "text-muted-foreground",
  },
  use_caution: {
    label: "Contains Ingredients Commonly Questioned",
    icon: AlertTriangle,
    className: "bg-muted text-foreground border-border",
    iconClassName: "text-muted-foreground",
  },
  unknown: {
    label: "Insufficient Public Disclosure",
    icon: HelpCircle,
    className: "bg-muted text-muted-foreground border-border",
    iconClassName: "text-muted-foreground",
  },
  likely_haram: {
    label: "Contains Ingredients Commonly Questioned",
    icon: Info,
    className: "bg-muted text-foreground border-border",
    iconClassName: "text-muted-foreground",
  },
};

export function OtcVerdictCard({ verdict, hasIngredientProfile, profileSource }: OtcVerdictCardProps) {
  const config = statusConfig[verdict.status];
  const Icon = config.icon;

  return (
    <Card className={`p-6 border ${config.className}`}>
      <div className="flex flex-col items-center text-center">
        <Icon className={`h-10 w-10 mb-3 ${config.iconClassName}`} />
        
        <h2 className="text-lg font-bold mb-3">{config.label}</h2>

        {verdict.status === "unknown" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Detailed inactive ingredient data for this product has not yet been verified from public sources.
            </p>
            <p className="text-xs italic">
              AmanahRx does not assume ingredient safety when formulation data is unavailable.
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
            Reflects the selected brand's formulation data
          </Badge>
        )}
        {profileSource === "generic" && hasIngredientProfile && (
          <p className="text-xs text-muted-foreground mt-3">
            Formulations vary by brand. Select a specific brand to refine this summary.
          </p>
        )}
      </div>
    </Card>
  );
}
