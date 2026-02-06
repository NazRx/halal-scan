import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Info } from "lucide-react";

interface ReviewedExample {
  name: string;
  notes: string[];
}

const REVIEWED_EXAMPLES: ReviewedExample[] = [
  {
    name: "Tylenol® tablet formulations",
    notes: [
      "No gelatin detected",
      "No alcohol detected",
      "Inactive ingredients vary by product line",
    ],
  },
  {
    name: "Store-brand acetaminophen tablets (Walmart / CVS)",
    notes: [
      "Often similar to name brands",
      "Contract manufacturers may vary",
    ],
  },
  {
    name: "Softgel pain relievers (multiple brands)",
    notes: [
      "Gelatin commonly present",
      "Source usually undisclosed",
    ],
  },
];

export function OtcReviewedExamples() {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-2 mb-2">
        <FileCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-base">
            Examples of OTC formulations we've reviewed
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            These examples show how formulations can differ. They are not endorsements and may change over time.
          </p>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {REVIEWED_EXAMPLES.map((example, index) => (
          <div
            key={index}
            className="rounded-lg border bg-muted/30 p-3"
          >
            <h4 className="font-medium text-sm mb-2">{example.name}</h4>
            <ul className="space-y-1">
              {example.notes.map((note, noteIndex) => (
                <li
                  key={noteIndex}
                  className="text-xs text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-muted-foreground/60">–</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-muted/50">
        <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          If a specific product isn't listed here, it doesn't mean it's unsafe — it means it hasn't been fully reviewed yet.
        </p>
      </div>
    </Card>
  );
}
