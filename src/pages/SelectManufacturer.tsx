import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  Lock, 
  Sparkles,
  CheckCircle2,
  Package,
  ScanLine,
  Hash
} from "lucide-react";
import { NDCScanner } from "@/components/scanner/NDCScanner";
import { NDCLookupResult } from "@/hooks/useNdcLookup";
import { SPLParseResult } from "@/hooks/useDailyMedSPL";

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
  
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [ndcResult, setNdcResult] = useState<{ ndc: string; result: NDCLookupResult; splResult?: SPLParseResult } | null>(null);
  const [isPro] = useState(true); // TODO: Would come from auth/subscription context

  const handleNdcFound = (ndc: string, result: NDCLookupResult, splResult?: SPLParseResult) => {
    setNdcResult({ ndc, result, splResult });
  };

  const handleUseNdcResult = () => {
    if (ndcResult?.result?.labeler) {
      const params = new URLSearchParams({
        manufacturer: ndcResult.result.labeler,
        ndc: ndcResult.ndc,
      });
      
      // If we have inactive ingredients from DailyMed, pass them along
      if (ndcResult.splResult?.inactiveIngredients?.length) {
        params.set("hasInactives", "true");
      }
      
      navigate(`/report/${id}?${params.toString()}`);
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
      
      <main className="container px-4 pt-24 pb-6 max-w-2xl mx-auto">
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

          {/* NDC Lookup Section */}
          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan" className="gap-2">
                <ScanLine className="h-4 w-4" />
                Scan NDC
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <Building2 className="h-4 w-4" />
                Select Manufacturer
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="scan" className="mt-4">
              {isPro ? (
                <div className="space-y-4">
                  <NDCScanner
                    onNdcFound={handleNdcFound}
                    showDailyMedParsing={true}
                  />
                  
                  {/* Use Result Button */}
                  <AnimatePresence>
                    {ndcResult?.result?.success && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleUseNdcResult}
                        >
                          Continue with {ndcResult.result.labeler}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                        
                        {ndcResult.splResult?.inactiveIngredients?.length ? (
                          <p className="text-xs text-center text-muted-foreground mt-2">
                            Found {ndcResult.splResult.inactiveIngredients.length} inactive ingredients from DailyMed
                          </p>
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Pro Feature</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upgrade to Pro to scan NDC barcodes and get manufacturer-specific ingredient data
                  </p>
                  <Button variant="default">Upgrade to Pro</Button>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="list" className="mt-4">
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
            </TabsContent>
          </Tabs>


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
