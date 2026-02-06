import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Award, FileCheck } from "lucide-react";
import type { OtcProductBrand } from "@/hooks/useOtcBrands";
import type { OtcReviewLevel } from "@/hooks/useOtcBrandReviewStatus";
import { getReviewLevelLabel } from "@/hooks/useOtcBrandReviewStatus";

interface BrandSelectProps {
  brands: OtcProductBrand[];
  selectedBrandId: string | null;
  onBrandChange: (brandId: string | null) => void;
  disabled?: boolean;
  reviewLevel?: OtcReviewLevel | null;
}

export function BrandSelect({
  brands,
  selectedBrandId,
  onBrandChange,
  disabled = false,
  reviewLevel,
}: BrandSelectProps) {
  if (brands.length === 0) {
    return null;
  }

  const handleValueChange = (value: string) => {
    onBrandChange(value === "all" ? null : value);
  };

  // Only show review level if it exists and is not 'none'
  const showReviewLevel = reviewLevel && reviewLevel !== "none";

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">
        Brand / Labeler
      </label>
      <Select
        value={selectedBrandId || "all"}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select brand (formulations vary)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <span className="text-muted-foreground">All brands (generic)</span>
          </SelectItem>
          {brands.map((pb) => (
            <SelectItem key={pb.otc_brand_id} value={pb.otc_brand_id}>
              <div className="flex items-center gap-2">
                <span>{pb.brand.brand_name}</span>
                {pb.is_primary && (
                  <Badge variant="secondary" className="text-xs py-0 px-1">
                    Primary
                  </Badge>
                )}
                {pb.brand.is_halal_certified && (
                  <Award className="h-3.5 w-3.5 text-primary" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Helper text - always visible */}
      <p className="text-xs text-muted-foreground">
        OTC formulations can vary by brand and dosage form. Selecting a brand improves accuracy.
      </p>

      {/* Phase 3: Show review level when available */}
      {showReviewLevel && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
          <FileCheck className="h-3 w-3" />
          <span>Review level: {getReviewLevelLabel(reviewLevel)}</span>
        </div>
      )}
    </div>
  );
}
