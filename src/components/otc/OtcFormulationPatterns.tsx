import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function OtcFormulationPatterns() {
  return (
    <Card className="p-5">
      <h3 className="font-semibold text-base mb-2">
        Common OTC formulation patterns
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Based on pharmacist review of publicly available U.S. OTC ingredient disclosures.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Lower concern block */}
        <div className="rounded-lg border border-status-halal/20 bg-status-halal-bg/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-status-halal" />
            <span className="font-medium text-sm">Generally lower concern</span>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-status-halal mt-0.5">•</span>
              Plain tablets and caplets
            </li>
            <li className="flex items-start gap-2">
              <span className="text-status-halal mt-0.5">•</span>
              Products without gelatin shells
            </li>
            <li className="flex items-start gap-2">
              <span className="text-status-halal mt-0.5">•</span>
              Brands that publish full inactive ingredient lists online
            </li>
          </ul>
        </div>

        {/* Sources of concern block */}
        <div className="rounded-lg border border-status-questionable/20 bg-status-questionable-bg/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-status-questionable" />
            <span className="font-medium text-sm">Common sources of concern</span>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-status-questionable mt-0.5">•</span>
              Softgels (often gelatin-based)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-status-questionable mt-0.5">•</span>
              Liquids and syrups (may contain alcohol or glycerin)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-status-questionable mt-0.5">•</span>
              Gummies and chewables (gelatin, dyes, flavorings)
            </li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 italic">
        These are patterns, not product-specific rulings.
      </p>
    </Card>
  );
}
