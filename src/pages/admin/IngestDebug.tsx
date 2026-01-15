import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Pill,
  Building2,
  FileText,
  Beaker
} from "lucide-react";

interface IngestResult {
  success: boolean;
  ndc: string;
  setId?: string;
  cached?: boolean;
  productInfo?: {
    setId: string;
    labeler?: string;
    productName?: string;
    genericName?: string;
    dosageForm?: string;
    strength?: string;
    route?: string;
    splVersion?: string;
  };
  inactiveIngredients: Array<{
    name: string;
    unii?: string;
  }>;
  insertedCount: number;
  matchedCount: number;
  error?: string;
}

interface StoredIngredient {
  id: string;
  ingredient_text_raw: string;
  ingredient_name_normalized: string;
  unii_code: string | null;
  matched_ingredient_id: string | null;
  matched_status: string | null;
  match_confidence: string | null;
  status: string;
}

export default function IngestDebug() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ndc, setNdc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestResult | null>(null);
  const [storedIngredients, setStoredIngredients] = useState<StoredIngredient[]>([]);

  const handleIngest = async (forceRefresh = false) => {
    if (!ndc.trim()) {
      toast({
        title: "NDC Required",
        description: "Please enter an NDC code to ingest",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setStoredIngredients([]);

    try {
      const { data, error } = await supabase.functions.invoke('ingest-inactives', {
        body: { ndc: ndc.trim(), forceRefresh }
      });

      if (error) throw error;

      setResult(data);

      // Fetch stored ingredients from database
      if (data.success) {
        const { data: ingredients } = await supabase
          .from('ndc_inactive_ingredients')
          .select('*')
          .eq('ndc', ndc.trim())
          .order('ingredient_name_normalized');
        
        if (ingredients) {
          setStoredIngredients(ingredients as StoredIngredient[]);
        }
      }

      toast({
        title: data.success ? "Ingestion Complete" : "Ingestion Failed",
        description: data.success 
          ? `Found ${data.inactiveIngredients?.length || 0} inactive ingredients`
          : data.error,
        variant: data.success ? "default" : "destructive"
      });
    } catch (err) {
      console.error('Ingest error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to ingest ingredients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'halal':
        return <Badge className="bg-status-halal/15 text-status-halal border-status-halal/30">Halal</Badge>;
      case 'haram':
        return <Badge className="bg-status-not-halal/15 text-status-not-halal border-status-not-halal/30">Haram</Badge>;
      case 'mushbooh':
        return <Badge className="bg-status-questionable/15 text-status-questionable border-status-questionable/30">Mushbooh</Badge>;
      default:
        return <Badge variant="outline">Needs Verification</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: string | null) => {
    switch (confidence) {
      case 'exact':
        return <Badge variant="outline" className="text-green-600 border-green-300">Exact Match</Badge>;
      case 'synonym':
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Synonym</Badge>;
      case 'partial':
        return <Badge variant="outline" className="text-amber-600 border-amber-300">Partial</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">No Match</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-2xl font-bold">Inactive Ingredient Ingestion Debug</h1>
        </div>

        {/* Input Section */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Ingest by NDC
          </h2>
          <div className="flex gap-3">
            <Input
              placeholder="Enter NDC code (e.g., 00093-7180-01)"
              value={ndc}
              onChange={(e) => setNdc(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleIngest(false)}
            />
            <Button onClick={() => handleIngest(false)} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Ingest
            </Button>
            <Button variant="outline" onClick={() => handleIngest(true)} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Refresh
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This will fetch inactive ingredients from DailyMed SPL and match them against the ingredient database.
          </p>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Status Summary */}
            <Card className={`p-6 ${result.success ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' : 'border-red-200 bg-red-50/50 dark:bg-red-950/20'}`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {result.success ? 'Ingestion Successful' : 'Ingestion Failed'}
                  </h3>
                  {result.error && (
                    <p className="text-red-600 mt-1">{result.error}</p>
                  )}
                  {result.success && (
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">NDC</p>
                        <p className="font-mono">{result.ndc}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Set ID</p>
                        <p className="font-mono text-sm">{result.setId || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ingredients Found</p>
                        <p className="font-semibold">{result.inactiveIngredients?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Matched</p>
                        <p className="font-semibold">{result.matchedCount} / {result.inactiveIngredients?.length || 0}</p>
                      </div>
                    </div>
                  )}
                  {result.cached && (
                    <Badge variant="outline" className="mt-2">Cached Result</Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Product Info */}
            {result.productInfo && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Product Information
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {result.productInfo.productName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Brand Name</p>
                      <p className="font-medium">{result.productInfo.productName}</p>
                    </div>
                  )}
                  {result.productInfo.genericName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Generic Name</p>
                      <p className="font-medium">{result.productInfo.genericName}</p>
                    </div>
                  )}
                  {result.productInfo.labeler && (
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Labeler</p>
                        <p className="font-medium">{result.productInfo.labeler}</p>
                      </div>
                    </div>
                  )}
                  {result.productInfo.dosageForm && (
                    <div>
                      <p className="text-sm text-muted-foreground">Dosage Form</p>
                      <p>{result.productInfo.dosageForm}</p>
                    </div>
                  )}
                  {result.productInfo.route && (
                    <div>
                      <p className="text-sm text-muted-foreground">Route</p>
                      <p>{result.productInfo.route}</p>
                    </div>
                  )}
                  {result.productInfo.splVersion && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">SPL Version</p>
                        <p>{result.productInfo.splVersion}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Raw Extracted Ingredients */}
            {result.inactiveIngredients && result.inactiveIngredients.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Beaker className="h-5 w-5" />
                  Raw SPL Inactive Ingredients ({result.inactiveIngredients.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.inactiveIngredients.map((ing, idx) => (
                    <Badge key={idx} variant="outline" className="py-1 px-3">
                      {ing.name}
                      {ing.unii && <span className="ml-1 text-xs text-muted-foreground">({ing.unii})</span>}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Stored & Matched Ingredients */}
            {storedIngredients.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Database Records ({storedIngredients.length})</h3>
                <div className="space-y-3">
                  {storedIngredients.map((ing) => (
                    <div 
                      key={ing.id} 
                      className={`p-3 rounded-lg border ${
                        ing.status === 'matched' ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800' :
                        'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{ing.ingredient_text_raw}</span>
                            {ing.status === 'matched' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            Normalized: {ing.ingredient_name_normalized}
                          </p>
                          {ing.unii_code && (
                            <p className="text-xs text-muted-foreground">UNII: {ing.unii_code}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(ing.matched_status)}
                          {getConfidenceBadge(ing.match_confidence)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Summary Stats */}
            {storedIngredients.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Matching Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{storedIngredients.length}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                    <p className="text-2xl font-bold text-green-600">
                      {storedIngredients.filter(i => i.status === 'matched').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Matched</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                    <p className="text-2xl font-bold text-amber-600">
                      {storedIngredients.filter(i => i.status === 'unmatched').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Unmatched</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                    <p className="text-2xl font-bold text-red-600">
                      {storedIngredients.filter(i => i.matched_status === 'haram').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Haram</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
