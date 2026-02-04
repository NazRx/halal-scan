import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock, Award, CheckCircle, AlertTriangle, HelpCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { useOtcBrandProfile, resolveOtcProfile } from "@/hooks/useOtcBrandProfile";
import { computeOtcVerdict, OTC_STATUS_LABELS, OTC_STATUS_COLORS, type OtcStatus } from "@/lib/otcVerdict";
import type { OtcProductBrand } from "@/hooks/useOtcBrands";
import type { OtcIngredientProfile } from "@/lib/otcVerdict";

interface CompareBrandsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  brands: OtcProductBrand[];
  genericProfile: OtcIngredientProfile | null;
  product: {
    id: string;
    name: string;
    display_name?: string | null;
    generic_name?: string;
    dosage_form?: string | null;
    route?: string | null;
  };
}

const StatusIcon = ({ status }: { status: OtcStatus }) => {
  const iconClass = "h-4 w-4";
  switch (status) {
    case 'likely_halal':
      return <CheckCircle className={cn(iconClass, OTC_STATUS_COLORS.likely_halal.text)} />;
    case 'use_caution':
      return <AlertTriangle className={cn(iconClass, OTC_STATUS_COLORS.use_caution.text)} />;
    case 'likely_haram':
      return <XCircle className={cn(iconClass, "text-destructive")} />;
    case 'unknown':
    default:
      return <HelpCircle className={cn(iconClass, "text-muted-foreground")} />;
  }
};

function BrandRow({
  productId,
  brand,
  genericProfile,
  product,
  isPro,
}: {
  productId: string;
  brand: OtcProductBrand;
  genericProfile: OtcIngredientProfile | null;
  product: CompareBrandsModalProps['product'];
  isPro: boolean;
}) {
  const { data: brandProfile } = useOtcBrandProfile(productId, brand.otc_brand_id);
  
  const { profile } = resolveOtcProfile(genericProfile, brandProfile);
  const verdict = computeOtcVerdict(product, profile);
  
  const topConcerns = verdict.signals
    .filter(s => s.impact === 'negative')
    .slice(0, 2)
    .map(s => s.label);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-medium">{brand.brand.brand_name}</span>
          {brand.brand.is_halal_certified && (
            <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
          )}
          {brand.is_primary && (
            <Badge variant="secondary" className="text-xs py-0 px-1">
              Primary
            </Badge>
          )}
        </div>
        {brand.brand.labeler_name && (
          <p className="text-xs text-muted-foreground">
            {brand.brand.labeler_name}
          </p>
        )}
      </TableCell>
      <TableCell>
        {isPro ? (
          <div className="flex items-center gap-1.5">
            <StatusIcon status={verdict.status} />
            <span className={cn("text-sm font-medium", OTC_STATUS_COLORS[verdict.status].text)}>
              {OTC_STATUS_LABELS[verdict.status]}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Pro</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        {isPro ? (
          <span className="text-sm">{verdict.confidence}%</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {isPro ? (
          topConcerns.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {topConcerns.map((concern, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {concern}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">None detected</span>
          )
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}

export function CompareBrandsModal({
  open,
  onOpenChange,
  productId,
  productName,
  brands,
  genericProfile,
  product,
}: CompareBrandsModalProps) {
  const subscription = useSubscription();
  const isPro = subscription.isPro;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Brands</DialogTitle>
          <DialogDescription>
            Compare formulations across different brands for <strong>{productName}</strong>.
          </DialogDescription>
        </DialogHeader>

        {!isPro && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-1">Unlock Brand Comparison</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  See detailed status, confidence, and ingredient concerns for each brand with Pro.
                </p>
                <Button size="sm" variant="default">
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Top Concerns</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <BrandRow
                  key={brand.id}
                  productId={productId}
                  brand={brand}
                  genericProfile={genericProfile}
                  product={product}
                  isPro={isPro}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {!isPro && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Brand comparison is a Pro feature. Status labels and warnings are always free.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
