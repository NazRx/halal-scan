import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Tag } from "lucide-react";

export type ManufacturerSignal =
  | "publishes_ingredients"
  | "formulation_varies"
  | "contract_manufactured"
  | "gelatin_common"
  | "alcohol_common"
  | "flavor_dependent";

interface SignalConfig {
  label: string;
  variant: "default" | "secondary" | "outline";
}

const SIGNAL_CONFIG: Record<ManufacturerSignal, SignalConfig> = {
  publishes_ingredients: {
    label: "Publishes inactive ingredient list",
    variant: "secondary",
  },
  formulation_varies: {
    label: "Formulation varies by brand",
    variant: "outline",
  },
  contract_manufactured: {
    label: "Contract-manufactured",
    variant: "outline",
  },
  gelatin_common: {
    label: "Gelatin commonly used in this form",
    variant: "outline",
  },
  alcohol_common: {
    label: "Alcohol sometimes used in liquids",
    variant: "outline",
  },
  flavor_dependent: {
    label: "Ingredients change by flavor",
    variant: "outline",
  },
};

const TOOLTIP_TEXT =
  "This tag highlights common formulation practices. It is not a halal ruling.";

interface OtcManufacturerSignalsProps {
  signals: ManufacturerSignal[];
  dosageForm?: string | null;
}

/**
 * Derives signals based on dosage form when no explicit signals are provided
 */
function deriveSignalsFromDosageForm(
  dosageForm: string | null | undefined
): ManufacturerSignal[] {
  if (!dosageForm) return ["formulation_varies"];

  const form = dosageForm.toLowerCase();

  if (form.includes("softgel") || form.includes("gelcap")) {
    return ["gelatin_common", "formulation_varies"];
  }

  if (
    form.includes("liquid") ||
    form.includes("syrup") ||
    form.includes("solution") ||
    form.includes("suspension")
  ) {
    return ["alcohol_common", "formulation_varies"];
  }

  if (form.includes("gummy") || form.includes("chewable")) {
    return ["gelatin_common", "flavor_dependent"];
  }

  if (form.includes("tablet") || form.includes("caplet")) {
    return ["formulation_varies"];
  }

  return ["formulation_varies"];
}

export function OtcManufacturerSignals({
  signals,
  dosageForm,
}: OtcManufacturerSignalsProps) {
  // Use provided signals or derive from dosage form
  const displaySignals =
    signals.length > 0 ? signals : deriveSignalsFromDosageForm(dosageForm);

  if (displaySignals.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">Formulation signals</h4>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-center">
              <p className="text-xs">{TOOLTIP_TEXT}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-wrap gap-2">
        {displaySignals.map((signal) => {
          const config = SIGNAL_CONFIG[signal];
          if (!config) return null;

          return (
            <TooltipProvider key={signal}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant={config.variant}
                    className="cursor-help text-xs font-normal"
                  >
                    {config.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-center">
                  <p className="text-xs">{TOOLTIP_TEXT}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </Card>
  );
}
