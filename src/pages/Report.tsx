import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfidenceMeter } from "@/components/ui/confidence-meter";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share2, Printer, Check, AlertCircle, X, HelpCircle } from "lucide-react";

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
  status: "halal" as const,
  confidence: 95,
  summary: "All ingredients verified as halal-compliant. No animal-derived ingredients detected.",
  ingredients: [
    { name: "Acetaminophen", status: "halal" as const, role: "Active Ingredient", notes: "Synthetic compound" },
    { name: "Pregelatinized Starch", status: "halal" as const, role: "Binder", notes: "Plant-derived" },
    { name: "Sodium Starch Glycolate", status: "halal" as const, role: "Disintegrant", notes: "Plant-derived" },
    { name: "Powdered Cellulose", status: "halal" as const, role: "Filler", notes: "Plant-derived" },
    { name: "Magnesium Stearate", status: "halal" as const, role: "Lubricant", notes: "Verified plant-sourced" },
    { name: "Hypromellose", status: "halal" as const, role: "Coating", notes: "Synthetic polymer" },
    { name: "Titanium Dioxide", status: "halal" as const, role: "Colorant", notes: "Mineral-based" },
  ],
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
  const report = mockReport;

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

          {/* Ingredients */}
          <Card className="p-6 print:shadow-none print:border-2">
            <h2 className="font-semibold text-lg mb-4">Ingredient Analysis</h2>
            
            <div className="space-y-2">
              {report.ingredients.map((ingredient) => {
                const Icon = statusIcons[ingredient.status];
                return (
                  <div
                    key={ingredient.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 print:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-full ${
                        ingredient.status === "halal" ? "bg-status-halal-bg text-status-halal print:bg-green-100 print:text-green-700" :
                        ingredient.status === "questionable" ? "bg-status-questionable-bg text-status-questionable print:bg-yellow-100 print:text-yellow-700" :
                        ingredient.status === "not-halal" ? "bg-status-not-halal-bg text-status-not-halal print:bg-red-100 print:text-red-700" :
                        "bg-status-unknown-bg text-status-unknown print:bg-gray-100 print:text-gray-700"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-medium">{ingredient.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">({ingredient.role})</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{ingredient.notes}</span>
                  </div>
                );
              })}
            </div>
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
