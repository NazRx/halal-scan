import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import type { OtcProductBrand } from "@/hooks/useOtcBrands";

interface BrandSelectProps {
  brands: OtcProductBrand[];
  selectedBrandId: string | null;
  onBrandChange: (brandId: string | null) => void;
  disabled?: boolean;
}

export function BrandSelect({
  brands,
  selectedBrandId,
  onBrandChange,
  disabled = false,
}: BrandSelectProps) {
  if (brands.length === 0) {
    return null;
  }

  const handleValueChange = (value: string) => {
    onBrandChange(value === "all" ? null : value);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">
        Brand / Manufacturer
      </label>
      <Select
        value={selectedBrandId || "all"}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select brand" />
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
                  <Award className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Context note */}
      {selectedBrandId ? (
        <p className="text-xs text-muted-foreground">
          Verdict reflects the selected brand's formulation.
        </p>
      ) : brands.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Formulations can vary by brand. Select a brand to refine confidence.
        </p>
      ) : null}
    </div>
  );
}
