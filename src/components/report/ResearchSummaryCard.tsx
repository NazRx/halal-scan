import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileSearch, BookOpen, Info, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type DisclosureLevel = "high" | "moderate" | "limited";

export interface FlaggedIngredient {
  name: string;
  reason: string;
}

export interface ResearchSummaryCardProps {
  disclosureLevel: DisclosureLevel;
  flaggedIngredients?: FlaggedIngredient[];
  scholarlyNote?: string;
  limitations?: string[];
  nextSteps?: string[];
  className?: string;
}

const disclosureLevelConfig: Record<DisclosureLevel, {
  label: string;
  description: string;
  badgeClass: string;
}> = {
  high: {
    label: "High",
    description: "Manufacturer inactive ingredient data is publicly available with source documentation.",
    badgeClass: "bg-muted text-foreground border-border",
  },
  moderate: {
    label: "Moderate",
    description: "Partial ingredient information is available. Some excipients may not be fully disclosed.",
    badgeClass: "bg-muted text-foreground border-border",
  },
  limited: {
    label: "Limited",
    description: "Insufficient public information is available to assess this formulation's ingredients.",
    badgeClass: "bg-muted text-foreground border-border",
  },
};

const DEFAULT_SCHOLARLY_NOTE =
  "Scholars differ on the permissibility of certain ingredients including gelatin (istihalah transformation), alcohol thresholds in liquid formulations, and the sourcing of glycerin and magnesium stearate. No ruling is issued here. Consult a trusted scholar for personal guidance.";

const DEFAULT_LIMITATIONS = [
  "Formulations may change without public notice.",
  "Manufacturers are not required to disclose the origin (animal vs. plant vs. synthetic) of inactive ingredients.",
  "This research is based on publicly available regulatory and manufacturer data only.",
  "This is not a fatwa (religious ruling) and does not replace scholarly consultation.",
];

const DEFAULT_NEXT_STEPS = [
  "Ask your pharmacist about the inactive ingredients in your specific dispensed product.",
  "Contact the manufacturer directly and request their full excipient sourcing information.",
  "Consult a trusted Islamic scholar, especially if you are avoiding doubtful ingredients (shubuhaat).",
  "If medically necessary and no alternative exists, Islamic legal principles regarding necessity (darura) may apply — consult a scholar.",
];

export function ResearchSummaryCard({
  disclosureLevel,
  flaggedIngredients = [],
  scholarlyNote,
  limitations,
  nextSteps,
  className,
}: ResearchSummaryCardProps) {
  const config = disclosureLevelConfig[disclosureLevel];
  const resolvedLimitations = limitations ?? DEFAULT_LIMITATIONS;
  const resolvedNextSteps = nextSteps ?? DEFAULT_NEXT_STEPS;
  const resolvedScholarly = scholarlyNote ?? DEFAULT_SCHOLARLY_NOTE;

  return (
    <Card className={cn("divide-y divide-border overflow-hidden", className)}>
      {/* Header */}
      <div className="px-5 py-4 bg-muted/30">
        <div className="flex items-center gap-2">
          <FileSearch className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Research Summary
          </h3>
        </div>
      </div>

      {/* Disclosure Level */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Ingredient Disclosure Level</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {config.description}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn("shrink-0 font-semibold", config.badgeClass)}
          >
            {config.label}
          </Badge>
        </div>
      </div>

      {/* Flagged Ingredients */}
      <div className="px-5 py-4">
        <p className="text-sm font-medium mb-2">
          Flagged Ingredients
        </p>
        {flaggedIngredients.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No ingredients commonly questioned in Islamic dietary law were identified in available data.
          </p>
        ) : (
          <ul className="space-y-2">
            {flaggedIngredients.map((item) => (
              <li key={item.name} className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-foreground/50" />
                <span>
                  <span className="font-medium text-foreground">{item.name}</span>
                  {" — "}
                  {item.reason}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Scholarly Considerations */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-2">
          <BookOpen className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium mb-1">Scholarly Considerations</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {resolvedScholarly}
            </p>
          </div>
        </div>
      </div>

      {/* Limitations */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-2">Limitations</p>
            <ul className="space-y-1.5">
              {resolvedLimitations.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="px-5 py-4">
        <p className="text-sm font-medium mb-2">Next Steps</p>
        <ul className="space-y-2">
          {resolvedNextSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
              {step}
            </li>
          ))}
        </ul>

        {/* Methodology Link */}
        <div className="mt-4 pt-3 border-t border-border">
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground gap-1" asChild>
            <Link to="/methodology">
              <ExternalLink className="h-3 w-3" />
              View AmanahRx Research Methodology
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
