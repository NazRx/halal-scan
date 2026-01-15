import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfidenceMeter } from "@/components/ui/confidence-meter";
import { IngredientBreakdownSplit } from "@/components/verdict/IngredientBreakdownSplit";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share2, Printer, Check, AlertCircle, X, HelpCircle, AlertTriangle, Building2, Pill, Beaker } from "lucide-react";
import type { IngredientVerdict } from "@/types/verdict";

// Mock report data - converted to new format
const mockReport = {
  id: "report-123",
  generatedAt: new Date().toLocaleDateString(),
  product: {
    name: "Tylenol Extra Strength",
    type: "OTC",
    brand: "Tylenol",
    dosage: "500mg Caplets",
    upc: "300450449108",
  },
  status: "halal" as const,
  confidence: 95,
  summary: "All ingredients verified as halal-compliant. No animal-derived ingredients detected.",
  activeIngredients: [
    { 
      ingredientId: "1", 
      ingredientName: "Acetaminophen", 
      status: "halal" as const, 
      role: "active" as const,
      concern: undefined,
      notes: "Synthetic compound",
      flags: [] 
    },
  ] as IngredientVerdict[],
  inactiveIngredients: [
    { ingredientId: "2", ingredientName: "Pregelatinized Starch", status: "halal" as const, role: "inactive" as const, notes: "Plant-derived", flags: [] },
    { ingredientId: "3", ingredientName: "Sodium Starch Glycolate", status: "halal" as const, role: "inactive" as const, notes: "Plant-derived", flags: [] },
    { ingredientId: "4", ingredientName: "Powdered Cellulose", status: "halal" as const, role: "inactive" as const, notes: "Plant-derived", flags: [] },
    { ingredientId: "5", ingredientName: "Magnesium Stearate", status: "halal" as const, role: "inactive" as const, notes: "Verified plant-sourced", flags: [] },
    { ingredientId: "6", ingredientName: "Hypromellose", status: "halal" as const, role: "inactive" as const, notes: "Synthetic polymer", flags: [] },
    { ingredientId: "7", ingredientName: "Titanium Dioxide", status: "halal" as const, role: "inactive" as const, notes: "Mineral-based", flags: [] },
  ] as IngredientVerdict[],
  sources: [
    "Manufacturer Ingredient List",
    "IFANCA Database",
    "Community Reports",
  ],
};

const statusIcons = {
  halal: Check,
  questionable: AlertCircle,
  "not-halal": X,
  unknown: HelpCircle,
};

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportType = searchParams.get("type") || "general";
  const manufacturer = searchParams.get("manufacturer");
  const report = mockReport;

  const isManufacturerSpecific = !!manufacturer;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `HalalRx Report: ${report.product.name}`,
        text: `${report.product.name} is ${report.status.toUpperCase()} with ${report.confidence}% confidence.`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>
      
      <main className="container px-4 py-6 max-w-2xl mx-auto">
        {/* Actions - Hidden on print */}
        <div className="print:hidden flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button size="sm" className="gradient-hero text-primary-foreground">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Manufacturer Variability Warning - Show for general/non-specific reports */}
          {!isManufacturerSpecific && (
            <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 print:bg-yellow-50 print:border-yellow-300">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                    Manufacturer Variability Notice
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>Different manufacturers may use different inactive ingredients.</strong> This general report 
                    covers the active ingredient and common formulations, but your specific manufacturer's product 
                    may contain different inactive ingredients that could affect halal status.
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    For higher confidence, check your bottle's NDC number or manufacturer name and generate 
                    a manufacturer-specific report.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50 print:hidden"
                    onClick={() => navigate(`/rx/select-manufacturer/${id}?name=${encodeURIComponent(report.product.name)}`)}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Select Manufacturer for Specific Report
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Manufacturer-Specific Badge */}
          {isManufacturerSpecific && (
            <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Manufacturer-Specific Report
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    This report is based on inactive ingredients specific to your selected manufacturer.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Report Header */}
          <Card className="p-6 print:shadow-none print:border-2">
            {/* Logo for print */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero print:bg-gray-800">
                  <span className="text-lg font-bold text-primary-foreground">H</span>
                </div>
                <span className="text-xl font-bold">HalalRx Report</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Generated: {report.generatedAt}
              </div>
            </div>

            {/* Product Info */}
            <div className="text-center mb-6">
              <StatusBadge status={report.status} size="xl" className="mb-4 print:border-2" />
              <h1 className="text-2xl font-bold mb-1">{report.product.name}</h1>
              <p className="text-muted-foreground">
                {report.product.brand} • {report.product.dosage}
              </p>
              {report.product.upc && (
                <p className="text-sm text-muted-foreground mt-1">
                  UPC: {report.product.upc}
                </p>
              )}
            </div>

            {/* Confidence */}
            <ConfidenceMeter value={report.confidence} className="max-w-xs mx-auto mb-4" />

            {/* Summary */}
            <div className="text-center">
              <p className="text-muted-foreground">{report.summary}</p>
            </div>
          </Card>

          {/* Ingredients - Split View */}
          <Card className="p-6 print:shadow-none print:border-2">
            <h2 className="font-semibold text-lg mb-4">Ingredient Analysis</h2>
            
            <IngredientBreakdownSplit 
              ingredients={[...report.activeIngredients, ...report.inactiveIngredients]}
              showTriggerReason={true}
            />
          </Card>

          {/* Sources */}
          <Card className="p-6 print:shadow-none print:border-2">
            <h2 className="font-semibold text-lg mb-4">Sources</h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {report.sources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </Card>

          {/* Disclaimer */}
          <Card className="p-4 bg-muted/50 print:bg-gray-50 print:border-2">
            <h3 className="font-medium mb-2">Disclaimer</h3>
            <p className="text-xs text-muted-foreground">
              This report is for informational purposes only. HalalRx does not provide medical advice. 
              Always verify halal status with manufacturers, certified halal organizations, or qualified 
              Islamic scholars. In cases of medical necessity (darura), permissibility rules may differ. 
              Consult with a qualified scholar for personal religious guidance.
            </p>
            {!isManufacturerSpecific && (
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Note: Inactive ingredients may vary by manufacturer. This general report may not reflect 
                your specific product's formulation.
              </p>
            )}
          </Card>

          {/* Footer for print */}
          <div className="hidden print:block text-center text-xs text-gray-500 pt-4 border-t">
            <p>Report generated by HalalRx • www.halalrx.com</p>
            <p>Report ID: {report.id}</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Report;
