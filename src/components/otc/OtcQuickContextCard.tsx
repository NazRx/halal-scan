import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export function OtcQuickContextCard() {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium mb-3">What to know at a glance</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              The active ingredient is synthetic and not animal-derived.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              Tablets and caplets are usually lower concern than liquids or softgels.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              Softgels and liquids often vary by brand and may include gelatin or alcohol.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3 italic">
            OTC formulations vary by brand and lot. HalalRx only assigns confidence when evidence is available.
          </p>
        </div>
      </div>
    </Card>
  );
}
