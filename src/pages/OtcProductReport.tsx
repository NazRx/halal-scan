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
import { useOtcVerdict } from "@/hooks/useOtcVerdict";
import { cn } from "@/lib/utils";

type VerdictStatus = 'halal' | 'mushbooh' | 'haram' | 'needs_verification' | null;

function getStatusDisplay(status: VerdictStatus) {
  switch (status) {
    case 'halal':
      return { label: 'Halal', variant: 'default' as const, icon: CheckCircle, className: 'bg-green-600 hover:bg-green-700' };
    case 'haram':
      return { label: 'Not Halal', variant: 'destructive' as const, icon: XCircle, className: '' };
    case 'mushbooh':
      return { label: 'Questionable', variant: 'secondary' as const, icon: AlertTriangle, className: 'bg-yellow-500 text-yellow-950 hover:bg-yellow-600' };
    case 'needs_verification':
    default:
      return { label: 'Unknown', variant: 'outline' as const, icon: HelpCircle, className: '' };
  }
}

const OtcProductReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading: productLoading, error: productError } = useOtcProduct(id);
  const { data: verdict, isLoading: verdictLoading } = useOtcVerdict(id);

  const isLoading = productLoading || verdictLoading;

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
  const statusInfo = getStatusDisplay(verdict?.status ?? null);
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

            {/* Confidence - only show if verdict exists and has confidence */}
            {verdict && typeof verdict.confidence === 'number' && (
              <p className="text-sm text-muted-foreground">
                Confidence: {verdict.confidence}%
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
                <AccordionContent className="text-muted-foreground pb-4">
                  {verdict?.summary_reason || "This will be filled from verdict reasons."}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sources" className="border-b-0">
                <AccordionTrigger className="hover:no-underline py-3">
                  <span className="font-medium">Sources</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  Sources will appear here when available.
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
