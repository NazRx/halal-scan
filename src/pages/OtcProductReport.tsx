import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, HelpCircle, AlertTriangle } from "lucide-react";
import { useOtcProduct } from "@/hooks/useOtcProduct";
import { useOtcVerdictRow } from "@/hooks/useOtcVerdictRow";
import { useOtcProductIngredients } from "@/hooks/useOtcProductIngredients";
import { useOtcVerdict as useComputedOtcVerdict } from "@/hooks/useVerdict";
import { cn } from "@/lib/utils";
import type { HalalStatus, VerdictOutput } from "@/types/verdict";

function getStatusDisplay(status: HalalStatus | 'needs_verification' | null) {
  switch (status) {
    case 'halal':
      return { label: 'Likely Halal', variant: 'default' as const, icon: CheckCircle, className: 'bg-green-600 hover:bg-green-700' };
    case 'not_halal':
      return { label: 'Not Halal', variant: 'destructive' as const, icon: XCircle, className: '' };
    case 'questionable':
      return { label: 'Questionable', variant: 'secondary' as const, icon: AlertTriangle, className: 'bg-yellow-500 text-yellow-950 hover:bg-yellow-600' };
    case 'needs_verification':
    case 'unknown':
    default:
      return { label: 'Unknown', variant: 'outline' as const, icon: HelpCircle, className: '' };
  }
}

// Map DB status to verdict engine status
function mapDbStatusToEngineStatus(dbStatus: 'halal' | 'mushbooh' | 'haram' | 'needs_verification' | null): HalalStatus {
  switch (dbStatus) {
    case 'halal': return 'halal';
    case 'haram': return 'not_halal';
    case 'mushbooh': return 'questionable';
    case 'needs_verification':
    default: return 'unknown';
  }
}

const OtcProductReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading: productLoading, error: productError } = useOtcProduct(id);
  
  // Fetch DB verdict row (with auto-create)
  const { data: dbVerdict, isLoading: verdictRowLoading, createError } = useOtcVerdictRow(id, true);
  
  // Fetch ingredient join data for verdict computation
  const { data: dbIngredients, isLoading: ingredientsLoading } = useOtcProductIngredients(id);

  // Compute verdict using the verdict engine
  const computedVerdict: VerdictOutput | null = dbIngredients && dbIngredients.length > 0
    ? useComputedOtcVerdict(
        dbIngredients.map(item => ({
          ingredient_id: item.ingredient_id,
          notes: item.notes,
          source_id: item.source_id,
          ingredients: {
            id: item.ingredients.id,
            name: item.ingredients.name,
            risk: item.ingredients.risk,
            default_concern_reason: item.ingredients.default_concern_reason,
            synonyms: item.ingredients.synonyms || [],
          },
          sources: item.sources ? {
            id: item.sources.id,
            title: item.sources.title,
            source_type: item.sources.source_type,
            url: item.sources.url,
          } : undefined,
        })),
        undefined // No admin override for view-only
      )
    : null;

  const isLoading = productLoading || verdictRowLoading || ingredientsLoading;
  const hasIngredientData = dbIngredients && dbIngredients.length > 0;

  // Determine which status to show
  // Use computed verdict if we have ingredient data, otherwise fall back to DB verdict
  const displayStatus: HalalStatus = hasIngredientData && computedVerdict
    ? computedVerdict.status
    : dbVerdict
      ? mapDbStatusToEngineStatus(dbVerdict.status)
      : 'unknown';

  const displayConfidence = hasIngredientData && computedVerdict
    ? computedVerdict.confidence
    : dbVerdict?.confidence ?? null;

  const summaryReason = hasIngredientData && computedVerdict
    ? computedVerdict.summaryReason
    : !hasIngredientData
      ? "Ingredient data not available yet for this product."
      : dbVerdict?.summary_reason || "Status pending review.";

  const verdictReasons = hasIngredientData && computedVerdict
    ? computedVerdict.reasons
    : [];

  // Log create error but don't crash
  if (createError) {
    console.warn('[OtcProductReport] Could not auto-create verdict:', createError);
  }

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
  const statusInfo = getStatusDisplay(displayStatus);
  const StatusIcon = statusInfo.icon;

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
          {/* Product Header Card */}
          <Card className="p-6 mb-6 text-center">
            <h1 className="text-2xl font-bold mb-2">{displayName}</h1>
            
            {/* Secondary line: brand + category */}
            <p className="text-muted-foreground mb-4">
              {[product.brand, product.primary_category || product.category]
                .filter(Boolean)
                .join(' • ') || 'OTC Product'}
            </p>

            {/* Verdict Badge */}
            <div className="flex justify-center mb-4">
              <Badge 
                variant={statusInfo.variant}
                className={cn("text-base px-4 py-2 flex items-center gap-2", statusInfo.className)}
              >
                <StatusIcon className="h-5 w-5" />
                {statusInfo.label}
              </Badge>
            </div>

            {/* Confidence - only show if available */}
            {displayConfidence !== null && (
              <p className="text-sm text-muted-foreground">
                Confidence: {displayConfidence}%
              </p>
            )}
          </Card>

          {/* Accordion Sections */}
          <Card className="p-4 mb-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="why-status" className="border-b-0">
                <AccordionTrigger className="hover:no-underline py-3">
                  <span className="font-medium">Why this status</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {/* Summary reason */}
                  <p className="text-muted-foreground mb-3">
                    {summaryReason}
                  </p>
                  
                  {/* Verdict reasons as bullet list */}
                  {verdictReasons.length > 0 && (
                    <ul className="space-y-2 text-sm">
                      {verdictReasons.map((reason, index) => (
                        <li 
                          key={`${reason.code}-${index}`}
                          className={cn(
                            "flex items-start gap-2",
                            reason.severity === 'critical' && "text-destructive",
                            reason.severity === 'warning' && "text-yellow-600 dark:text-yellow-400",
                            reason.severity === 'info' && "text-muted-foreground"
                          )}
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
                          <span>{reason.message}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sources" className="border-b-0">
                <AccordionTrigger className="hover:no-underline py-3">
                  <span className="font-medium">Sources</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {hasIngredientData && computedVerdict?.hasManufacturerSource ? (
                    <p>Manufacturer documentation available for some ingredients.</p>
                  ) : hasIngredientData && computedVerdict?.hasCertifierSource ? (
                    <p>Halal certification available for some ingredients.</p>
                  ) : (
                    <p>Sources will appear here when available.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Report Issue */}
          <Card className="p-4 bg-muted/50">
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
    </div>
  );
};

export default OtcProductReport;
