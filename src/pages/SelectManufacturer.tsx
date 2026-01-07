import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  Hash, 
  Lock, 
  Sparkles,
  Info,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Package
} from "lucide-react";
import { useNdcLookup, NDCLookupResult } from "@/hooks/useNdcLookup";

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
  const [isPro] = useState(true); // TODO: Would come from auth/subscription context
  
  const { lookupNdc, isLoading, error, result, reset } = useNdcLookup();

  const handleNdcLookup = async () => {
    if (ndcInput.length >= 10 && isPro) {
      await lookupNdc(ndcInput);
    }
  };

  const handleNdcInputChange = (value: string) => {
    // Format NDC as user types (XXXXX-XXXX-XX format)
    const cleaned = value.replace(/[^0-9]/g, "");
    let formatted = cleaned;
    
    if (cleaned.length > 5) {
      formatted = `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    if (cleaned.length > 9) {
      formatted = `${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9, 11)}`;
    }
    
    setNdcInput(formatted);
    reset(); // Clear previous results when input changes
  };

  const handleSelectFromResult = () => {
    if (result?.labeler) {
      navigate(`/report/${id}?manufacturer=${encodeURIComponent(result.labeler)}&ndc=${encodeURIComponent(result.ndc)}`);
    }
  };

  const handleContinueWithGeneral = () => {
    navigate(`/report/${id}?type=general`);
  };

  const handleContinueWithManufacturer = () => {
    if (selectedManufacturer) {
      const manufacturer = TOP_MANUFACTURERS.find(m => m.id === selectedManufacturer);
      navigate(`/report/${id}?manufacturer=${encodeURIComponent(manufacturer?.name || selectedManufacturer)}`);
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
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ndc">NDC (National Drug Code)</Label>
                <div className="flex gap-2">
                  <Input
                    id="ndc"
                    placeholder="XXXXX-XXXX-XX"
                    value={ndcInput}
                    onChange={(e) => handleNdcInputChange(e.target.value)}
                    disabled={!isPro}
                    maxLength={13}
                    className="font-mono"
                  />
                  <Button 
                    onClick={handleNdcLookup}
                    disabled={!isPro || ndcInput.replace(/[^0-9]/g, "").length < 10 || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Look Up"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Find the NDC on your medication bottle or packaging
                </p>
              </div>

              {/* NDC Lookup Result */}
              <AnimatePresence mode="wait">
                {result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    {result.success ? (
                      <Card className="p-4 bg-green-500/10 border-green-500/30">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                          <div className="flex-1 space-y-3">
                            <div>
                              <p className="font-semibold text-green-700 dark:text-green-400">
                                Manufacturer Found
                              </p>
                              <p className="text-lg font-medium">{result.labeler}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {result.genericName && (
                                <div>
                                  <span className="text-muted-foreground">Generic:</span>
                                  <p className="font-medium">{result.genericName}</p>
                                </div>
                              )}
                              {result.brandName && (
                                <div>
                                  <span className="text-muted-foreground">Brand:</span>
                                  <p className="font-medium">{result.brandName}</p>
                                </div>
                              )}
                              {result.dosageForm && (
                                <div>
                                  <span className="text-muted-foreground">Form:</span>
                                  <p className="font-medium">{result.dosageForm}</p>
                                </div>
                              )}
                              {result.marketingCategory && (
                                <div>
                                  <span className="text-muted-foreground">Type:</span>
                                  <p className="font-medium">{result.marketingCategory}</p>
                                </div>
                              )}
                            </div>

                            {result.activeIngredients && result.activeIngredients.length > 0 && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Active Ingredients:</p>
                                <div className="flex flex-wrap gap-1">
                                  {result.activeIngredients.map((ing, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {ing.name} {ing.strength}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <Button 
                              className="w-full mt-2" 
                              onClick={handleSelectFromResult}
                            >
                              Use This Manufacturer
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card className="p-4 bg-amber-500/10 border-amber-500/30">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-700 dark:text-amber-400">
                              NDC Not Found
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {result.error || "This NDC was not found in the FDA database. Try selecting a manufacturer from the list below."}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </motion.div>
                )}

                {error && !result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Card className="p-4 bg-destructive/10 border-destructive/30">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                          <p className="font-medium text-destructive">Lookup Failed</p>
                          <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isPro && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>Upgrade to Pro to look up medications by NDC</span>
                </div>
              )}
            </div>
          </Card>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">or select from list</span>
            <Separator className="flex-1" />
          </div>

          {/* Manufacturer List */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Top US Generic Manufacturers</h2>
            </div>

            <div className="space-y-2">
              {TOP_MANUFACTURERS.map((manufacturer) => (
                <motion.button
                  key={manufacturer.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => isPro && setSelectedManufacturer(manufacturer.id)}
                  disabled={!isPro}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    selectedManufacturer === manufacturer.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  } ${!isPro ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedManufacturer === manufacturer.id ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="font-medium">{manufacturer.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {manufacturer.marketShare}
                    </Badge>
                  </div>
                </motion.button>
              ))}
            </div>

            {selectedManufacturer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Button 
                  className="w-full" 
                  onClick={handleContinueWithManufacturer}
                >
                  Continue with {TOP_MANUFACTURERS.find(m => m.id === selectedManufacturer)?.name}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </Card>

          {/* General Report Option */}
          <Card className="p-6 border-dashed">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Don't know your manufacturer? You can still get a general report 
                based on common formulations.
              </p>
              <Button 
                variant="outline" 
                onClick={handleContinueWithGeneral}
                className="w-full"
              >
                Continue with General Report
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default SelectManufacturer;
