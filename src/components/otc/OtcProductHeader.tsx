import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, Package } from "lucide-react";

interface OtcProductHeaderProps {
  productName: string;
  primaryCategory: string | null;
  isVitamin?: boolean;
  isCombo?: boolean;
}

export function OtcProductHeader({
  productName,
  primaryCategory,
  isVitamin,
  isCombo,
}: OtcProductHeaderProps) {
  return (
    <Card className="p-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-transparent" />
      
      <div className="relative">
        <div className="flex justify-center mb-4">
          {isVitamin ? (
            <div className="p-3 rounded-full bg-primary/10">
              <Pill className="h-8 w-8 text-primary" />
            </div>
          ) : (
            <div className="p-3 rounded-full bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-2">{productName}</h1>
        
        {primaryCategory && (
          <p className="text-muted-foreground mb-3">{primaryCategory}</p>
        )}
        
        <p className="text-sm text-muted-foreground mb-4">
          Over-the-counter medication · U.S.-labeled product
        </p>

        <div className="flex flex-wrap gap-2 justify-center">
          {isVitamin && (
            <Badge variant="outline">Vitamin/Supplement</Badge>
          )}
          {isCombo && (
            <Badge variant="outline">Combination Product</Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
