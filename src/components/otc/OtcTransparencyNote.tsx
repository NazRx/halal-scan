import { Card } from "@/components/ui/card";
import { ShieldQuestion } from "lucide-react";

export function OtcTransparencyNote() {
  return (
    <Card className="p-5 bg-muted/30">
      <div className="flex items-start gap-3">
        <ShieldQuestion className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-base mb-2">
            Why some OTC products have limited information
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            OTC manufacturers are not required to disclose full ingredient sourcing, and many store brands are produced by different contract manufacturers over time. Formulations can change without notice.
          </p>
          <p className="text-sm font-medium text-foreground/80">
            Rather than guess, HalalRx only assigns halal confidence when evidence is available.
          </p>
        </div>
      </div>
    </Card>
  );
}
