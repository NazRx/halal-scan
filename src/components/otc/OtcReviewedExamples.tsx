import { Card } from "@/components/ui/card";
import { FileCheck } from "lucide-react";

interface ReviewedExample {
  name: string;
  notes: string[];
}

const REVIEWED_EXAMPLES: ReviewedExample[] = [
  {
    name: "Tylenol® tablets",
    notes: [
      "No gelatin detected",
      "Formulation varies by product line",
    ],
  },
  {
    name: "Equate® (Walmart) tablets",
    notes: [
      "Often similar to name brands",
      "Contract manufactured",
    ],
  },
  {
    name: "CVS Health® tablets",
    notes: [
      "Ingredient lists often published",
      "Varies by dosage form",
    ],
  },
  {
    name: "Walgreens® tablets",
    notes: [
      "Contract manufactured",
      "Varies by dosage form",
    ],
  },
  {
    name: "Generic softgels (multiple brands)",
    notes: [
      "Gelatin commonly used",
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
            Examples of reviewed OTC formulations
          </h3>
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

      <p className="text-xs text-muted-foreground mt-4 italic">
        Examples are non-exhaustive and may change over time.
      </p>
    </Card>
  );
}
