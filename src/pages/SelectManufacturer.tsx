import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  Hash, 
  Lock, 
  Sparkles,
  Info,
  CheckCircle2
} from "lucide-react";

// Top 10 US generic manufacturers
const TOP_MANUFACTURERS = [
  { id: "teva", name: "Teva Pharmaceuticals", marketShare: "Most common" },
  { id: "sandoz", name: "Sandoz", marketShare: "2nd most common" },
  { id: "mylan", name: "Mylan (Viatris)", marketShare: "Top 5" },
  { id: "lupin", name: "Lupin Pharmaceuticals", marketShare: "Top 5" },
  { id: "aurobindo", name: "Aurobindo Pharma", marketShare: "Top 5" },
  { id: "zydus", name: "Zydus Lifesciences", marketShare: "Top 10" },
  { id: "dr-reddys", name: "Dr. Reddy's Laboratories", marketShare: "Top 10" },
  { id: "apotex", name: "Apotex", marketShare: "Top 10" },
  { id: "hikma", name: "Hikma Pharmaceuticals", marketShare: "Top 10" },
  { id: "amneal", name: "Amneal Pharmaceuticals", marketShare: "Top 10" },
];

const SelectManufacturer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const medName = searchParams.get("name") || "Medication";
  
  const [ndcInput, setNdcInput] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [isPro] = useState(false); // Would come from auth/subscription context

  const handleNdcLookup = () => {
    if (ndcInput.length >= 10) {
      // In Phase 2, this would call openFDA API
      console.log("Looking up NDC:", ndcInput);
    }
  };

  const handleContinueWithGeneral = () => {
    navigate(`/report/${id}?type=general`);
  };

  const handleContinueWithManufacturer = () => {
    if (selectedManufacturer) {
      navigate(`/report/${id}?manufacturer=${selectedManufacturer}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-2xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">{medName}</h1>
            <p className="text-muted-foreground">
              Select a manufacturer for a more accurate report
            </p>
          </div>

          {/* Pro Feature Banner */}
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">Manufacturer-Specific Reports</h3>
                  <Badge variant="secondary" className="text-xs">Pro</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Different manufacturers use different inactive ingredients. 
                  Get a more accurate halal status by selecting your specific manufacturer.
                </p>
              </div>
            </div>
          </Card>

          {/* NDC Input Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Enter NDC Number</h2>
              {!isPro && <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Find the NDC on your prescription bottle label (10-11 digits)
            </p>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="e.g., 0093-7180-01"
                  value={ndcInput}
                  onChange={(e) => setNdcInput(e.target.value)}
                  disabled={!isPro}
                  className="font-mono"
                />
              </div>
              <Button 
                onClick={handleNdcLookup}
                disabled={!isPro || ndcInput.length < 10}
              >
                Look Up
              </Button>
            </div>

            {!isPro && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                NDC lookup requires Pro subscription
              </p>
            )}
          </Card>

          {/* Manufacturer List */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Select Manufacturer</h2>
              {!isPro && <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Choose from the top 10 US generic manufacturers
            </p>

            <div className="space-y-2">
              {TOP_MANUFACTURERS.map((mfr) => (
                <button
                  key={mfr.id}
                  onClick={() => isPro && setSelectedManufacturer(mfr.id)}
                  disabled={!isPro}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedManufacturer === mfr.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  } ${!isPro ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedManufacturer === mfr.id ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="font-medium">{mfr.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {mfr.marketShare}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>

            {selectedManufacturer && isPro && (
              <Button 
                className="w-full mt-4 gradient-hero text-primary-foreground"
                onClick={handleContinueWithManufacturer}
              >
                Continue with {TOP_MANUFACTURERS.find(m => m.id === selectedManufacturer)?.name}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </Card>

          <Separator />

          {/* General Report Option */}
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Continue with General Report</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get a manufacturer-agnostic report based on the most common formulations. 
                  This covers the active ingredient and common inactive ingredients across manufacturers.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleContinueWithGeneral}
                >
                  Continue with General Report
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Upgrade CTA for non-Pro */}
          {!isPro && (
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="text-center space-y-4">
                <Sparkles className="h-8 w-8 text-primary mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg">Upgrade to Pro</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get manufacturer-specific reports, NDC lookup, and higher confidence scores
                  </p>
                </div>
                <Button 
                  className="gradient-hero text-primary-foreground"
                  onClick={() => navigate("/pricing")}
                >
                  View Pro Plans
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default SelectManufacturer;
