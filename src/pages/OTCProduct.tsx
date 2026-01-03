import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfidenceMeter } from "@/components/ui/confidence-meter";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Share2, Bookmark, AlertCircle, Check, X, HelpCircle, FileText } from "lucide-react";

// Mock product data
const mockProduct = {
  id: "demo-123",
  name: "Tylenol Extra Strength",
  brand: "Tylenol",
  category: "Pain Relief",
  dosage: "500mg Caplets",
  upc: "300450449108",
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
    { name: "Manufacturer Ingredient List", url: "#" },
    { name: "IFANCA Database", url: "#" },
    { name: "Community Reports", url: "#" },
  ],
  lastUpdated: "December 2024",
};

const statusIcons = {
  halal: Check,
  questionable: AlertCircle,
  "not-halal": X,
  unknown: HelpCircle,
};

const OTCProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = mockProduct; // In real app, fetch by id

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6">
        {/* Back Button */}
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
          {/* Status Card */}
          <Card className="p-6 mb-6 text-center relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-b from-status-halal-bg to-transparent opacity-50" />
            
            <div className="relative">
              <StatusBadge status={product.status} size="xl" animate className="mb-4" />
              
              <h1 className="text-2xl font-bold mb-1">{product.name}</h1>
              <p className="text-muted-foreground mb-4">
                {product.brand} • {product.dosage}
              </p>

              <ConfidenceMeter value={product.confidence} className="max-w-xs mx-auto mb-4" />

              <p className="text-sm text-muted-foreground">{product.summary}</p>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-6">
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Link to={`/report/${id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Report
              </Button>
            </Link>
          </div>

          {/* Ingredients Panel */}
          <Card className="p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">Ingredient Breakdown</h2>
            
            <div className="space-y-3">
              {product.ingredients.map((ingredient, index) => {
                const Icon = statusIcons[ingredient.status];
                return (
                  <motion.div
                    key={ingredient.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className={`mt-0.5 p-1 rounded-full ${
                      ingredient.status === "halal" ? "bg-status-halal-bg text-status-halal" :
                      ingredient.status === "questionable" ? "bg-status-questionable-bg text-status-questionable" :
                      ingredient.status === "not-halal" ? "bg-status-not-halal-bg text-status-not-halal" :
                      "bg-status-unknown-bg text-status-unknown"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ingredient.name}</span>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background rounded-full">
                          {ingredient.role}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{ingredient.notes}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>

          {/* Sources */}
          <Card className="p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">Sources & References</h2>
            
            <ul className="space-y-2">
              {product.sources.map((source) => (
                <li key={source.name}>
                  <a
                    href={source.url}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {source.name}
                  </a>
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground mt-4">
              Last updated: {product.lastUpdated}
            </p>
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
                <Button variant="outline" size="sm">
                  Report an Issue
                </Button>
              </div>
            </div>
          </Card>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            This information is for guidance only. Always verify with the manufacturer or a certified halal organization.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default OTCProduct;
