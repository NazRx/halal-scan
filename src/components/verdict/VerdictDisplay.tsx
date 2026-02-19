import { StatusBadge } from '@/components/ui/status-badge';
import { ResearchSummaryCard, type DisclosureLevel } from '@/components/report/ResearchSummaryCard';
import { VerdictSummary } from './VerdictSummary';
import { IngredientBreakdown } from './IngredientBreakdown';
import type { VerdictOutput } from '@/types/verdict';
import { toUiStatus, getDisclosureLevel } from '@/lib/status-labels';

interface VerdictDisplayProps {
  verdict: VerdictOutput;
  productName: string;
  productType: 'otc' | 'rx';
  showManufacturerWarning?: boolean;
}

export function VerdictDisplay({
  verdict,
  productName,
  productType,
  showManufacturerWarning = true,
}: VerdictDisplayProps) {
  const uiStatus = toUiStatus(verdict.status);
  const disclosureLevel: DisclosureLevel = getDisclosureLevel(verdict.confidence);
  
  return (
    <div className="space-y-6">
      {/* Status Badge + Product Info */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <StatusBadge status={uiStatus} size="lg" showLabel />
          <div>
            <h2 className="text-xl font-bold">{productName}</h2>
            <p className="text-sm text-muted-foreground">
              {productType === 'rx' ? 'Prescription Medication' : 'OTC Product'}
            </p>
          </div>
        </div>
      </div>

      {/* Why This Status Summary */}
      <VerdictSummary 
        verdict={verdict} 
        showManufacturerWarning={showManufacturerWarning && productType === 'rx'}
        productType={productType}
      />

      {/* Research Summary Card — replaces confidence meter */}
      <ResearchSummaryCard disclosureLevel={disclosureLevel} />

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
