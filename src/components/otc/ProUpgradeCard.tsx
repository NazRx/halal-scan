import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ProUpgradeCard() {
  const navigate = useNavigate();

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium mb-3">Want deeper insight?</h3>
          
          <ul className="text-sm text-muted-foreground space-y-2 mb-4">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              Ingredient-by-ingredient halal risk analysis
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              Brand-to-brand formulation comparison
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              Safer formulation suggestions when available
            </li>
          </ul>
          
          <Button 
            variant="default" 
            className="w-full sm:w-auto"
            onClick={() => navigate("/pricing")}
          >
            Unlock deeper formulation analysis
          </Button>
          
          <p className="text-xs text-muted-foreground mt-3">
            Core halal status and warnings are always shown. Pro adds depth, not pressure.
          </p>
        </div>
      </div>
    </Card>
  );
}
