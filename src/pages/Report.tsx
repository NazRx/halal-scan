import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IngredientBreakdownSplit } from "@/components/verdict/IngredientBreakdownSplit";
import { ResearchSummaryCard } from "@/components/report/ResearchSummaryCard";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share2, Printer, AlertTriangle, Building2 } from "lucide-react";
import type { IngredientVerdict } from "@/types/verdict";

// Mock report data
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
  disclosureLevel: "moderate" as const,
  summary: "Available ingredient data shows no commonly questioned excipients in this caplet formulation. Inactive ingredient sourcing is not fully disclosed.",
  activeIngredients: [
    { 
      ingredientId: "1", 
      ingredientName: "Acetaminophen", 
      status: "halal" as const, 
      role: "active" as const,
      concern: undefined,
      notes: "Synthetic compound — active pharmaceutical ingredient",
      flags: [] 
    },
  ] as IngredientVerdict[],
  inactiveIngredients: [
    { ingredientId: "2", ingredientName: "Pregelatinized Starch", status: "halal" as const, role: "inactive" as const, notes: "Plant-derived (typically)", flags: [] },
    { ingredientId: "3", ingredientName: "Sodium Starch Glycolate", status: "halal" as const, role: "inactive" as const, notes: "Plant-derived", flags: [] },
    { ingredientId: "4", ingredientName: "Powdered Cellulose", status: "halal" as const, role: "inactive" as const, notes: "Plant-derived", flags: [] },
    { ingredientId: "5", ingredientName: "Magnesium Stearate", status: "questionable" as const, role: "inactive" as const, notes: "Source not disclosed — may be plant or animal-derived", flags: [] },
    { ingredientId: "6", ingredientName: "Hypromellose", status: "halal" as const, role: "inactive" as const, notes: "Synthetic polymer", flags: [] },
    { ingredientId: "7", ingredientName: "Titanium Dioxide", status: "halal" as const, role: "inactive" as const, notes: "Mineral-based", flags: [] },
  ] as IngredientVerdict[],
  sources: [
    "FDA DailyMed Labeling Database",
    "Manufacturer Package Insert",
  ],
  flaggedIngredients: [
    {
      name: "Magnesium Stearate",
      reason: "Source not publicly disclosed. May be plant-derived or animal-derived depending on manufacturer lot."
    }
  ],
};

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const manufacturer = searchParams.get("manufacturer");
  const report = mockReport;

  const isManufacturerSpecific = !!manufacturer;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `AmanahRx Research Summary: ${report.product.name}`,
        text: `AmanahRx ingredient research summary for ${report.product.name}.`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>
      
      <main className="container px-4 pt-24 pb-6 max-w-2xl mx-auto">
        {/* Actions */}
        <div className="print:hidden flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
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
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Manufacturer Variability Notice */}
          {!isManufacturerSpecific && (
            <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 print:bg-yellow-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                    Manufacturer Variability Notice
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Inactive ingredient formulations vary by manufacturer. This general summary covers common formulations. Your specific product may contain different excipients.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50 print:hidden"
                    onClick={() => navigate(`/rx/select-manufacturer/${id}?name=${encodeURIComponent(report.product.name)}`)}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Select Manufacturer for Specific Summary
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Manufacturer-Specific Notice */}
          {isManufacturerSpecific && (
            <Card className="p-4 bg-muted/50 border-border">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Manufacturer-Specific Summary</p>
                  <p className="text-sm text-muted-foreground">
                    This summary reflects ingredient data specific to the selected manufacturer.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Report Header */}
          <Card className="p-6 print:shadow-none print:border-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">AmanahRx</span>
                <span className="text-muted-foreground">— Research Summary</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Generated: {report.generatedAt}
              </div>
            </div>

            <div className="mb-4">
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

            <p className="text-sm text-muted-foreground">{report.summary}</p>
          </Card>

          {/* Research Summary Card */}
          <ResearchSummaryCard
            disclosureLevel={report.disclosureLevel}
            flaggedIngredients={report.flaggedIngredients}
          />

          {/* Ingredients */}
          <Card className="p-6 print:shadow-none print:border-2">
            <h2 className="font-semibold text-lg mb-4">Ingredient Data</h2>
            <IngredientBreakdownSplit 
              ingredients={[...report.activeIngredients, ...report.inactiveIngredients]}
              showTriggerReason={true}
            />
          </Card>

          {/* Sources */}
          <Card className="p-6 print:shadow-none print:border-2">
            <h2 className="font-semibold text-lg mb-4">Data Sources</h2>
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
              AmanahRx organizes publicly available ingredient information. It does not issue religious rulings (fatwa) and does not provide medical advice. Consult your pharmacist, physician, and/or a qualified Islamic scholar before making medication decisions.
            </p>
            {!isManufacturerSpecific && (
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Note: Inactive ingredients may vary by manufacturer. This summary may not reflect your specific product's formulation.
              </p>
            )}
          </Card>

          {/* Print footer */}
          <div className="hidden print:block text-center text-xs text-gray-500 pt-4 border-t">
            <p>AmanahRx — An independent medication transparency initiative</p>
            <p>Summary ID: {report.id}</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Report;
