import { StatusBadge } from '@/components/ui/status-badge';
import { ConfidenceMeter } from '@/components/ui/confidence-meter';
import { VerdictSummary } from './VerdictSummary';
import { IngredientBreakdown } from './IngredientBreakdown';
import type { VerdictOutput, HalalStatus } from '@/types/verdict';

interface VerdictDisplayProps {
  verdict: VerdictOutput;
  productName: string;
  productType: 'otc' | 'rx';
  showManufacturerWarning?: boolean;
}

// Convert engine status to UI status (not_halal → not-halal)
function toUiStatus(status: HalalStatus): 'halal' | 'questionable' | 'not-halal' | 'unknown' {
  if (status === 'not_halal') return 'not-halal';
  return status;
}

export function VerdictDisplay({
  verdict,
  productName,
  productType,
  showManufacturerWarning = true,
}: VerdictDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Status & Confidence Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <StatusBadge 
            status={toUiStatus(verdict.status)} 
            size="lg" 
            showLabel 
            animate={verdict.status === 'halal'}
          />
          <div>
            <h2 className="text-xl font-bold">{productName}</h2>
            <p className="text-sm text-muted-foreground">
              {productType === 'rx' ? 'Prescription Medication' : 'OTC Product'}
            </p>
          </div>
        </div>
        <ConfidenceMeter value={verdict.confidence} size="lg" showLabel />
      </div>

      {/* Why This Status Summary */}
      <VerdictSummary 
        verdict={verdict} 
        showManufacturerWarning={showManufacturerWarning && productType === 'rx'}
        productType={productType}
      />

      {/* Ingredient Breakdown Table */}
      <IngredientBreakdown 
        ingredients={verdict.ingredientVerdicts}
        showRole={productType === 'rx'}
      />
    </div>
  );
}

// Re-export components for individual use
export { VerdictSummary } from './VerdictSummary';
export { IngredientBreakdown } from './IngredientBreakdown';
