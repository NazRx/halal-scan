import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

export function ConfidenceExplainer() {
  return (
    <Card className="p-4 bg-muted/30 border-dashed">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium mb-2">About This Assessment</h3>
          <p className="text-sm text-muted-foreground mb-3">
            AmanahRx organizes publicly available ingredient data. It does not issue religious rulings and does not certify products as permissible or impermissible.
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              Active ingredient identity is typically known
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              Inactive ingredients vary by brand, dosage form, and lot
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              Manufacturers are not required to disclose ingredient origin
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
