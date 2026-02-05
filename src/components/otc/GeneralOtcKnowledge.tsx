import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface GeneralOtcKnowledgeProps {
  drugName: string;
}

export function GeneralOtcKnowledge({ drugName }: GeneralOtcKnowledgeProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium mb-3">What we know about {drugName} (general)</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              The active ingredient is synthetic and not animal-derived
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              It does not inherently contain alcohol
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              Halal considerations usually depend on inactive ingredients, not the drug itself
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3 italic">
            Based on common U.S. OTC formulations.
          </p>
        </div>
      </div>
    </Card>
  );
}
