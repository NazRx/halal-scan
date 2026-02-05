import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Lightbulb } from "lucide-react";

interface OtcNextStepsProps {
  onContributeClick: () => void;
}

export function OtcNextSteps({ onContributeClick }: OtcNextStepsProps) {
  return (
    <Card className="p-4 border-primary/20 bg-primary/5">
      <div className="flex items-start gap-3">
        <ClipboardList className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium mb-1">Want higher confidence for this product?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You can help verify this OTC product in seconds.
          </p>
          
          <Button onClick={onContributeClick} className="mb-3">
            Paste inactive ingredients
          </Button>
          
          <p className="text-xs text-muted-foreground mb-3">
            Copy the "Inactive ingredients" list from the package or brand website. We'll reassess with higher confidence.
          </p>
          
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
            <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>
              Tip: Tablets and caplets usually have fewer formulation concerns than liquids or gummies.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
