import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Disclaimer } from "@/components/ui/disclaimer";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, GitCompare } from "lucide-react";
import { useOtcProduct } from "@/hooks/useOtcProduct";
import { useOtcIngredientProfile } from "@/hooks/useOtcIngredientProfile";
import { useOtcBrandsForProduct } from "@/hooks/useOtcBrands";
import { useOtcBrandProfile, resolveOtcProfile } from "@/hooks/useOtcBrandProfile";
import { useOtcBrandReviewStatus, getReviewLevelLabel } from "@/hooks/useOtcBrandReviewStatus";
import { computeOtcVerdict } from "@/lib/otcVerdict";
import { ContributeIngredientsModal } from "@/components/otc/ContributeIngredientsModal";
import { BrandSelect } from "@/components/otc/BrandSelect";
import { CompareBrandsModal } from "@/components/otc/CompareBrandsModal";
import { OtcProductHeader } from "@/components/otc/OtcProductHeader";
import { OtcVerdictCard } from "@/components/otc/OtcVerdictCard";
import { ConfidenceExplainer } from "@/components/otc/ConfidenceExplainer";
import { GeneralOtcKnowledge } from "@/components/otc/GeneralOtcKnowledge";
import { DosageFormGuidance } from "@/components/otc/DosageFormGuidance";
import { OtcNextSteps } from "@/components/otc/OtcNextSteps";
import { ProUpgradeCard } from "@/components/otc/ProUpgradeCard";
import { OtcFooterTrust } from "@/components/otc/OtcFooterTrust";
import { OtcFormulationPatterns } from "@/components/otc/OtcFormulationPatterns";
import { OtcReviewedExamples } from "@/components/otc/OtcReviewedExamples";
import { OtcTransparencyNote } from "@/components/otc/OtcTransparencyNote";
import { OtcManufacturerSignals } from "@/components/otc/OtcManufacturerSignals";

const OtcProductReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  
  // Fetch product data
  const { data: product, isLoading: productLoading, error: productError } = useOtcProduct(id);
  
  // Fetch generic ingredient profile
  const { data: genericProfile, isLoading: profileLoading } = useOtcIngredientProfile(id);
  
  // Fetch linked brands
  const { data: brands = [], isLoading: brandsLoading } = useOtcBrandsForProduct(id);
  
  // Fetch brand-specific profile if a brand is selected
  const { data: brandProfile, isLoading: brandProfileLoading } = useOtcBrandProfile(
    id,
    selectedBrandId || undefined
  );

  // Fetch brand review status (Phase 3)
  const { data: brandReviewStatus } = useOtcBrandReviewStatus(selectedBrandId);

  const isLoading = productLoading || profileLoading || brandsLoading;

  // Set primary brand as default when brands load
  useMemo(() => {
    if (brands.length > 0 && selectedBrandId === null) {
      const primary = brands.find(b => b.is_primary);
      if (primary) {
        setSelectedBrandId(primary.otc_brand_id);
      }
    }
  }, [brands, selectedBrandId]);

  // Resolve the best profile and compute verdict
  const { profile: resolvedProfile, source: profileSource } = useMemo(
    () => resolveOtcProfile(genericProfile, brandProfile),
    [genericProfile, brandProfile]
  );

  const verdict = useMemo(() => {
    if (!product) return null;
    return computeOtcVerdict(
      {
        id: product.id,
        name: product.name,
        display_name: product.display_name,
        generic_name: product.generic_name,
        dosage_form: resolvedProfile?.dosage_form || null,
        route: resolvedProfile?.route || null,
      },
      resolvedProfile || null
    );
  }, [product, resolvedProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 pt-24 pb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6">
              <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
              <Skeleton className="h-4 w-1/2 mx-auto mb-4" />
              <Skeleton className="h-10 w-32 mx-auto" />
            </Card>
            <Card className="p-6">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-20 w-full" />
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 pt-24 pb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-4">
              We couldn't find this OTC product. It may have been removed or the link is incorrect.
            </p>
            <Button onClick={() => navigate("/otc/browse")}>
              Browse OTC Products
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const displayName = product.display_name || product.name || product.generic_name;
  const dosageForm = resolvedProfile?.dosage_form || null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 pt-24 pb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-4"
        >
          <Disclaimer variant="card" showOtcNote className="mb-2" defaultExpanded={false} />

          {/* A) Product Header */}
          <OtcProductHeader
            productName={displayName}
            primaryCategory={product.primary_category || product.category}
            isVitamin={product.is_vitamin || false}
            isCombo={product.is_combo || false}
          />

          {/* B) Brand Selector */}
          {brands.length > 0 && (
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
                <div className="flex-1 w-full sm:w-auto">
                  <BrandSelect
                    brands={brands}
                    selectedBrandId={selectedBrandId}
                    onBrandChange={setSelectedBrandId}
                    disabled={brandProfileLoading}
                    reviewLevel={brandReviewStatus?.review_level}
                  />
                </div>
                {brands.length >= 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCompareModal(true)}
                    className="flex items-center gap-2"
                  >
                    <GitCompare className="h-4 w-4" />
                    Compare brands
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* C) Verdict Card */}
          {verdict && (
            <OtcVerdictCard
              verdict={verdict}
              hasIngredientProfile={!!resolvedProfile}
              profileSource={profileSource}
            />
          )}

          {/* D) Confidence Explainer */}
          <ConfidenceExplainer />

          {/* E) General OTC Knowledge - Always show */}
          <GeneralOtcKnowledge drugName={displayName} />

          {/* F) Dosage Form Guidance - Always show */}
          <DosageFormGuidance dosageForm={dosageForm} />

          {/* Phase 2: Manufacturer Signals */}
          <OtcManufacturerSignals signals={[]} dosageForm={dosageForm} />

          {/* Phase 1: Formulation Patterns */}
          <OtcFormulationPatterns />

          {/* Phase 1: Reviewed Examples */}
          <OtcReviewedExamples />

          {/* Phase 1: Transparency Note */}
          <OtcTransparencyNote />

          {/* G) Next Steps / Contribution CTA - show for unknown or use_caution */}
          {verdict && (verdict.status === 'unknown' || verdict.status === 'use_caution') && (
            <OtcNextSteps onContributeClick={() => setShowContributeModal(true)} />
          )}

          {/* H) Pro Upgrade Card */}
          <ProUpgradeCard />

          {/* Report Issue */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">See something wrong?</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Help us improve by reporting inaccurate information.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const selectedBrand = brands.find(b => b.otc_brand_id === selectedBrandId);
                    const params = new URLSearchParams({
                      productId: product.id,
                      productName: displayName,
                      returnUrl: `/otc/${id}/report`,
                    });
                    if (selectedBrand?.brand) {
                      params.set("brandId", selectedBrand.otc_brand_id);
                      params.set("brandName", selectedBrand.brand.brand_name);
                    }
                    if (product.upc) {
                      params.set("upc", product.upc);
                    }
                    navigate(`/report-issue?${params.toString()}`);
                  }}
                >
                  Report an Issue
                </Button>
              </div>
            </div>
          </Card>

          {/* I) Footer Trust Copy */}
          <OtcFooterTrust />
        </motion.div>
      </main>

      {/* Contribute Modal */}
      <ContributeIngredientsModal
        open={showContributeModal}
        onOpenChange={setShowContributeModal}
        productId={product.id}
        productName={displayName}
        brands={brands}
      />

      {/* Compare Brands Modal */}
      {brands.length >= 2 && (
        <CompareBrandsModal
          open={showCompareModal}
          onOpenChange={setShowCompareModal}
          productId={product.id}
          productName={displayName}
          brands={brands}
          genericProfile={genericProfile || null}
          product={{
            id: product.id,
            name: product.name,
            display_name: product.display_name,
            generic_name: product.generic_name,
            dosage_form: resolvedProfile?.dosage_form || null,
            route: resolvedProfile?.route || null,
          }}
        />
      )}
    </div>
  );
};

export default OtcProductReport;
