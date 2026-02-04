import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Disclaimer } from "@/components/ui/disclaimer";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, Package, Pill } from "lucide-react";
import { useOtcProduct } from "@/hooks/useOtcProduct";
import { useOtcIngredientProfile } from "@/hooks/useOtcIngredientProfile";
import { computeOtcVerdict } from "@/lib/otcVerdict";
import { OtcVerdictDisplay } from "@/components/otc/OtcVerdictDisplay";
import { ContributeIngredientsModal } from "@/components/otc/ContributeIngredientsModal";

const OtcProductReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showContributeModal, setShowContributeModal] = useState(false);
  
  // Fetch product data
  const { data: product, isLoading: productLoading, error: productError } = useOtcProduct(id);
  
  // Fetch ingredient profile (if exists)
  const { data: profile, isLoading: profileLoading } = useOtcIngredientProfile(id);

  const isLoading = productLoading || profileLoading;

  // Compute verdict using the OTC-specific engine
  const verdict = product
    ? computeOtcVerdict(
        {
          id: product.id,
          name: product.name,
          display_name: product.display_name,
          generic_name: product.generic_name,
          dosage_form: profile?.dosage_form || null,
          route: profile?.route || null,
        },
        profile || null
      )
    : null;

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
          className="max-w-2xl mx-auto"
        >
          <Disclaimer variant="card" showOtcNote className="mb-6" defaultExpanded={false} />

          {/* Product Header */}
          <Card className="p-6 mb-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-transparent" />
            
            <div className="relative">
              <div className="flex justify-center mb-4">
                {product.is_vitamin ? (
                  <div className="p-3 rounded-full bg-primary/10">
                    <Pill className="h-8 w-8 text-primary" />
                  </div>
                ) : (
                  <div className="p-3 rounded-full bg-muted">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold mb-2">{displayName}</h1>
              
              {/* Secondary line: brand + category */}
              <p className="text-muted-foreground mb-4">
                {[product.brand, product.primary_category || product.category]
                  .filter(Boolean)
                  .join(' • ') || 'OTC Product'}
              </p>

              <div className="flex flex-wrap gap-2 justify-center">
                {product.primary_category && (
                  <Badge variant="secondary">{product.primary_category}</Badge>
                )}
                {product.is_vitamin && (
                  <Badge variant="outline">Vitamin/Supplement</Badge>
                )}
                {product.is_combo && (
                  <Badge variant="outline">Combination Product</Badge>
                )}
                {profile?.dosage_form && (
                  <Badge variant="outline" className="capitalize">
                    {profile.dosage_form}
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          {/* OTC Verdict Display */}
          {verdict && (
            <OtcVerdictDisplay
              verdict={verdict}
              onContributeClick={() => setShowContributeModal(true)}
              showProCta={true}
            />
          )}

          {/* Combo Ingredients */}
          {product.is_combo && product.combo_ingredients && product.combo_ingredients.length > 0 && (
            <Card className="p-6 mt-6">
              <h2 className="font-semibold text-lg mb-4">Active Ingredients</h2>
              <div className="flex flex-wrap gap-2">
                {product.combo_ingredients.map((ingredient) => (
                  <Badge key={ingredient} variant="outline" className="capitalize">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Report Issue */}
          <Card className="p-4 bg-muted/50 mt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">See something wrong?</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Help us improve by reporting inaccurate information.
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate(`/report/${id}`)}>
                  Report an Issue
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Contribute Modal */}
      <ContributeIngredientsModal
        open={showContributeModal}
        onOpenChange={setShowContributeModal}
        productId={product.id}
        productName={displayName}
      />
    </div>
  );
};

export default OtcProductReport;
