import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfidenceMeter } from '@/components/ui/confidence-meter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Check, X, AlertCircle, HelpCircle, ArrowLeftRight } from 'lucide-react';

interface Ingredient {
  name: string;
  status: 'halal' | 'questionable' | 'not-halal' | 'unknown';
  notes?: string;
}

interface Manufacturer {
  id: string;
  name: string;
  ndc: string;
  dosageForm: string;
  strength: string;
  status: 'halal' | 'questionable' | 'not-halal' | 'unknown';
  confidence: number;
  inactiveIngredients: Ingredient[];
}

interface ManufacturerCompareProps {
  manufacturers: Manufacturer[];
  className?: string;
  onClose?: () => void;
}

const statusIcons = {
  halal: Check,
  questionable: AlertCircle,
  "not-halal": X,
  unknown: HelpCircle,
};

export function ManufacturerCompare({ 
  manufacturers, 
  className,
  onClose 
}: ManufacturerCompareProps) {
  const [leftId, setLeftId] = useState<string | null>(manufacturers[0]?.id || null);
  const [rightId, setRightId] = useState<string | null>(manufacturers[1]?.id || null);

  const leftMfr = manufacturers.find(m => m.id === leftId);
  const rightMfr = manufacturers.find(m => m.id === rightId);

  // Find ingredient differences
  const getAllIngredients = () => {
    const allNames = new Set<string>();
    manufacturers.forEach(m => {
      m.inactiveIngredients.forEach(ing => allNames.add(ing.name));
    });
    return Array.from(allNames).sort();
  };

  const allIngredients = getAllIngredients();

  const getIngredientStatus = (mfr: Manufacturer | undefined, ingredientName: string) => {
    if (!mfr) return null;
    const ing = mfr.inactiveIngredients.find(i => i.name === ingredientName);
    return ing || null;
  };

  const isDifferent = (ingredientName: string) => {
    const leftIng = getIngredientStatus(leftMfr, ingredientName);
    const rightIng = getIngredientStatus(rightMfr, ingredientName);
    
    // Different if one has it and other doesn't, or different status
    if (!leftIng && rightIng) return true;
    if (leftIng && !rightIng) return true;
    if (leftIng && rightIng && leftIng.status !== rightIng.status) return true;
    return false;
  };

  const differences = allIngredients.filter(isDifferent);

  if (manufacturers.length < 2) {
    return (
      <Card className={cn("p-6", className)}>
        <p className="text-muted-foreground text-center">
          Need at least 2 manufacturers to compare.
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Compare Manufacturers</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Selector Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Manufacturer A</label>
          <Select value={leftId || ''} onValueChange={setLeftId}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {manufacturers.map(m => (
                <SelectItem key={m.id} value={m.id} disabled={m.id === rightId}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Manufacturer B</label>
          <Select value={rightId || ''} onValueChange={setRightId}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {manufacturers.map(m => (
                <SelectItem key={m.id} value={m.id} disabled={m.id === leftId}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparison Headers */}
      {leftMfr && rightMfr && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Left Manufacturer */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium truncate">{leftMfr.name}</span>
                <StatusBadge status={leftMfr.status} size="sm" showLabel={false} />
              </div>
              <ConfidenceMeter value={leftMfr.confidence} size="sm" />
              <p className="text-xs text-muted-foreground mt-2">
                {leftMfr.dosageForm} • {leftMfr.strength}
              </p>
            </div>

            {/* Right Manufacturer */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium truncate">{rightMfr.name}</span>
                <StatusBadge status={rightMfr.status} size="sm" showLabel={false} />
              </div>
              <ConfidenceMeter value={rightMfr.confidence} size="sm" />
              <p className="text-xs text-muted-foreground mt-2">
                {rightMfr.dosageForm} • {rightMfr.strength}
              </p>
            </div>
          </div>

          {/* Differences Summary */}
          {differences.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-status-questionable-bg border border-status-questionable/20">
              <p className="text-sm font-medium text-status-questionable">
                {differences.length} ingredient difference{differences.length !== 1 ? 's' : ''} found
              </p>
            </div>
          )}

          {/* Ingredient Comparison Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 gap-0 bg-muted text-sm font-medium">
              <div className="p-3 border-r">Ingredient</div>
              <div className="p-3 border-r text-center truncate">{leftMfr.name}</div>
              <div className="p-3 text-center truncate">{rightMfr.name}</div>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {allIngredients.map((ingredientName) => {
                const leftIng = getIngredientStatus(leftMfr, ingredientName);
                const rightIng = getIngredientStatus(rightMfr, ingredientName);
                const hasDiff = isDifferent(ingredientName);
                
                return (
                  <div 
                    key={ingredientName}
                    className={cn(
                      "grid grid-cols-3 gap-0 text-sm border-t",
                      hasDiff && "bg-status-questionable-bg/30"
                    )}
                  >
                    <div className={cn(
                      "p-3 border-r flex items-center gap-2",
                      hasDiff && "font-medium"
                    )}>
                      {ingredientName}
                      {hasDiff && (
                        <Badge variant="outline" className="text-[10px] px-1">
                          Differs
                        </Badge>
                      )}
                    </div>
                    <div className="p-3 border-r flex items-center justify-center">
                      {leftIng ? (
                        <IngredientCell ingredient={leftIng} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                    <div className="p-3 flex items-center justify-center">
                      {rightIng ? (
                        <IngredientCell ingredient={rightIng} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {allIngredients.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No ingredient data available for comparison.
            </p>
          )}
        </>
      )}
    </Card>
  );
}

function IngredientCell({ ingredient }: { ingredient: Ingredient }) {
  const Icon = statusIcons[ingredient.status];
  
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full",
        ingredient.status === "halal" && "bg-status-halal-bg text-status-halal",
        ingredient.status === "questionable" && "bg-status-questionable-bg text-status-questionable",
        ingredient.status === "not-halal" && "bg-status-not-halal-bg text-status-not-halal",
        ingredient.status === "unknown" && "bg-status-unknown-bg text-status-unknown"
      )}
      title={ingredient.notes}
    >
      <Icon className="h-3 w-3" />
      {ingredient.status}
    </div>
  );
}
