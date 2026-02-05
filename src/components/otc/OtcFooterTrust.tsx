import { Shield } from "lucide-react";

export function OtcFooterTrust() {
  return (
    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md p-3 mt-6">
      <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <p>
        OTC formulations may change over time and vary by brand and lot. This app prioritizes transparency and does not issue religious rulings.
      </p>
    </div>
  );
}
