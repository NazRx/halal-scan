import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

export function ConfidenceExplainer() {
  return (
    <Card className="p-4 bg-muted/30 border-dashed">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium mb-2">What this confidence score means</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Confidence reflects how complete the formulation information is — not the safety or effectiveness of the medication.
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              Active ingredient is known
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              Inactive ingredients may vary by brand and dosage form
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              Higher confidence requires verified formulation details
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
