import { useState } from "react";
import { BarcodeScanner } from "./BarcodeScanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  Keyboard, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowRight,
  Hash 
} from "lucide-react";
import { useNdcLookup, NDCLookupResult } from "@/hooks/useNdcLookup";
import { useDailyMedSPL, SPLParseResult } from "@/hooks/useDailyMedSPL";

interface NDCScannerProps {
  onNdcFound: (ndc: string, result: NDCLookupResult, splResult?: SPLParseResult) => void;
  onManualEntry?: (ndc: string) => void;
  showDailyMedParsing?: boolean;
  className?: string;
}

export function NDCScanner({ 
  onNdcFound, 
  onManualEntry,
  showDailyMedParsing = true,
  className 
}: NDCScannerProps) {
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [ndcInput, setNdcInput] = useState("");
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  
  const { lookupNdc, isLoading: isLookingUp, result: ndcResult, reset: resetNdc } = useNdcLookup();
  const { parseByNdc, isLoading: isParsing, result: splResult, reset: resetSpl } = useDailyMedSPL();

  const isLoading = isLookingUp || isParsing;

  const handleBarcodeScan = async (code: string, format: string) => {
    console.log(`Scanned barcode: ${code} (format: ${format})`);
    
    // NDC barcodes are typically in 2D formats or encoded in UPC-A
    // For drug packages, the barcode often contains the NDC
    setScannedCode(code);
    
    // Clean the code - remove any check digits or prefixes
    let ndc = code;
    
    // If it's a GTIN-14 (14 digits), extract the NDC portion
    if (code.length === 14 && code.startsWith("003")) {
      ndc = code.slice(3, 13); // Remove indicator and check digit
    }
    
    // If it's a UPC-A with NDC (starts with 3)
    if (code.length === 12 && code.startsWith("3")) {
      ndc = code.slice(1, 11); // Remove indicator and check digit
    }
    
    await performLookup(ndc);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ndcInput.trim()) {
      await performLookup(ndcInput);
    }
  };

  const performLookup = async (ndc: string) => {
    resetNdc();
    resetSpl();
    
    // First, look up in openFDA
    const ndcData = await lookupNdc(ndc);
    
    // If found, also try to get inactive ingredients from DailyMed
    let splData: SPLParseResult | undefined;
    if (ndcData?.success && showDailyMedParsing) {
      splData = await parseByNdc(ndc) || undefined;
    }
    
    if (ndcData) {
      onNdcFound(ndc, ndcData, splData);
    }
  };

  const handleNdcInputChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    let formatted = cleaned;
    
    if (cleaned.length > 5) {
      formatted = `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    if (cleaned.length > 9) {
      formatted = `${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9, 11)}`;
    }
    
    setNdcInput(formatted);
  };

  const handleReset = () => {
    setScannedCode(null);
    setNdcInput("");
    resetNdc();
    resetSpl();
  };

  return (
    <div className={className}>
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={mode === "camera" ? "default" : "outline"}
          onClick={() => { setMode("camera"); handleReset(); }}
          className="flex-1"
        >
          <Camera className="h-4 w-4 mr-2" />
          Scan Barcode
        </Button>
        <Button
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => { setMode("manual"); handleReset(); }}
          className="flex-1"
        >
          <Keyboard className="h-4 w-4 mr-2" />
          Enter NDC
        </Button>
      </div>

      {mode === "camera" ? (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onError={(error) => console.error("Scanner error:", error)}
        />
      ) : (
        <Card className="p-6">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">NDC Number</span>
            </div>
            <Input
              placeholder="XXXXX-XXXX-XX"
              value={ndcInput}
              onChange={(e) => handleNdcInputChange(e.target.value)}
              maxLength={13}
              className="font-mono text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Find the NDC on your medication bottle or packaging
            </p>
            <Button 
              type="submit" 
              className="w-full"
              disabled={ndcInput.replace(/[^0-9]/g, "").length < 10 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Looking up...
                </>
              ) : (
                <>
                  Look Up NDC
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </Card>
      )}

      {/* Results Display */}
      <AnimatePresence mode="wait">
        {(ndcResult || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4"
          >
            {isLoading ? (
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div>
                    <p className="font-medium">
                      {isParsing ? "Fetching inactive ingredients..." : "Looking up NDC..."}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Searching FDA and DailyMed databases
                    </p>
                  </div>
                </div>
              </Card>
            ) : ndcResult?.success ? (
              <Card className="p-4 bg-green-500/10 border-green-500/30">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        Product Found
                      </p>
                      <p className="text-lg font-medium">{ndcResult.labeler}</p>
                      {ndcResult.brandName && (
                        <p className="text-muted-foreground">{ndcResult.brandName}</p>
                      )}
                    </div>
                    
                    {/* Inactive Ingredients from DailyMed */}
                    {splResult?.success && splResult.inactiveIngredients.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-medium">Inactive Ingredients</p>
                          <Badge variant="outline" className="text-xs">
                            From DailyMed
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {splResult.inactiveIngredients.slice(0, 10).map((ing, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {ing.name}
                            </Badge>
                          ))}
                          {splResult.inactiveIngredients.length > 10 && (
                            <Badge variant="outline" className="text-xs">
                              +{splResult.inactiveIngredients.length - 10} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ) : ndcResult && !ndcResult.success ? (
              <Card className="p-4 bg-amber-500/10 border-amber-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-400">
                      NDC Not Found
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ndcResult.error || "This NDC was not found in the FDA database."}
                    </p>
                  </div>
                </div>
              </Card>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
