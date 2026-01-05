import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfidenceMeter } from "@/components/ui/confidence-meter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Disclaimer } from "@/components/ui/disclaimer";
import { ManufacturerSelector } from "@/components/rx/ManufacturerSelector";
import { ManufacturerCompare } from "@/components/rx/ManufacturerCompare";
import { VariantAwarenessBanner } from "@/components/rx/VariantAwarenessBanner";
import { NoManufacturerDataEmpty } from "@/components/browse/EmptyStates";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Share2, Bookmark, Building2, Check, X, HelpCircle, FileText, AlertCircle, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Manufacturer {
  id: string;
  name: string;
  ndc: string;
  dosageForm: string;
  strength: string;
  status: 'halal' | 'questionable' | 'not-halal' | 'unknown';
  confidence: number;
  inactiveIngredients: { name: string; status: 'halal' | 'questionable' | 'not-halal' | 'unknown'; notes?: string }[];
}

interface MedicationData {
  id: string;
  name: string;
  strength: string;
  form: string;
  drugClass: string | null;
  uses: string;
  status: 'halal' | 'questionable' | 'not-halal' | 'unknown';
  confidence: number;
  activeIngredients: { name: string; status: 'halal' | 'questionable' | 'not-halal' | 'unknown'; notes: string }[];
  manufacturers: Manufacturer[];
  sources: { name: string; url: string }[];
  lastUpdated: string;
}

// Map DB status to UI status
function mapStatus(dbStatus: string | null): 'halal' | 'questionable' | 'not-halal' | 'unknown' {
  if (!dbStatus) return 'unknown';
  if (dbStatus === 'halal') return 'halal';
  if (dbStatus === 'mushbooh') return 'questionable';
  if (dbStatus === 'haram') return 'not-halal';
  return 'unknown';
}

const statusIcons = {
  halal: Check,
  questionable: AlertCircle,
  "not-halal": X,
  unknown: HelpCircle,
};

const RxMedication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [medication, setMedication] = useState<MedicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const fetchMedication = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        // Fetch the medication
        const { data: rxMed, error: rxError } = await supabase
          .from('rx_meds')
          .select('*')
          .eq('id', id)
          .single();

        if (rxError || !rxMed) {
          console.error('Error fetching medication:', rxError);
          setMedication(null);
          setIsLoading(false);
          return;
        }

        // Fetch variants for this medication
        const { data: variants } = await supabase
          .from('rx_variants')
          .select('*')
          .eq('rx_med_id', id);

        // Fetch verdicts for variants
        const variantIds = (variants || []).map(v => v.id);
        const { data: verdicts } = await supabase
          .from('rx_verdicts')
          .select('*')
          .in('variant_id', variantIds.length > 0 ? variantIds : ['none']);

        // Fetch ingredients for variants
        const { data: variantIngredients } = await supabase
          .from('rx_variant_ingredients')
          .select('*, ingredients(*)')
          .in('variant_id', variantIds.length > 0 ? variantIds : ['none']);

        // Build manufacturers from variants
        const manufacturers: Manufacturer[] = (variants || []).map(variant => {
          const verdict = verdicts?.find(v => v.variant_id === variant.id);
          const ingredients = (variantIngredients || [])
            .filter(vi => vi.variant_id === variant.id && vi.role === 'inactive')
            .map(vi => ({
              name: vi.ingredients?.name || 'Unknown',
              status: mapStatus(vi.ingredients?.default_status || null),
              notes: vi.notes || undefined,
            }));

          return {
            id: variant.id,
            name: variant.manufacturer || 'Unknown Manufacturer',
            ndc: (variant.ndc_list || [])[0] || 'N/A',
            dosageForm: variant.dosage_form || 'Unknown',
            strength: variant.strength_text || 'Unknown',
            status: mapStatus(verdict?.status || null),
            confidence: verdict?.confidence || 0,
            inactiveIngredients: ingredients,
          };
        });

        // Get active ingredients (typically from first variant or all have same active)
        const activeIngredients = (variantIngredients || [])
          .filter(vi => vi.role === 'active')
          .slice(0, 5)
          .map(vi => ({
            name: vi.ingredients?.name || 'Unknown',
            status: mapStatus(vi.ingredients?.default_status || null),
            notes: vi.notes || 'Active pharmaceutical ingredient',
          }));

        // Calculate overall status
        const statuses = verdicts?.map(v => mapStatus(v.status)) || [];
        let overallStatus: 'halal' | 'questionable' | 'not-halal' | 'unknown' = 'unknown';
        if (statuses.length > 0) {
          const uniqueStatuses = [...new Set(statuses)];
          if (uniqueStatuses.length === 1) {
            overallStatus = uniqueStatuses[0];
          } else if (uniqueStatuses.includes('not-halal')) {
            overallStatus = 'questionable';
          } else if (uniqueStatuses.includes('questionable')) {
            overallStatus = 'questionable';
          }
        }

        const avgConfidence = verdicts && verdicts.length > 0
          ? Math.round(verdicts.reduce((sum, v) => sum + (v.confidence || 0), 0) / verdicts.length)
          : 0;

        setMedication({
          id: rxMed.id,
          name: rxMed.generic_name,
          strength: (variants || [])[0]?.strength_text || 'Various',
          form: (rxMed.dosage_forms || [])[0] || 'Various',
          drugClass: rxMed.drug_class,
          uses: rxMed.category || 'See prescribing information',
          status: overallStatus,
          confidence: avgConfidence,
          activeIngredients: activeIngredients.length > 0 ? activeIngredients : [
            { name: rxMed.generic_name, status: 'halal', notes: 'Active pharmaceutical ingredient' }
          ],
          manufacturers,
          sources: [
            { name: "FDA Orange Book", url: `https://www.accessdata.fda.gov/scripts/cder/ob/search_product.cfm` },
            { name: "DailyMed", url: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(rxMed.generic_name)}` },
            { name: "IFANCA", url: `https://www.ifanca.org/` },
          ],
          lastUpdated: new Date(rxMed.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        });
      } catch (err) {
        console.error('Error loading medication:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedication();
  }, [id]);
  
  const selectedManufacturer = medication?.manufacturers.find(
    (m) => m.id === selectedManufacturerId
  );
  
  // Determine displayed status and confidence based on selection
  const displayStatus = selectedManufacturer?.status || medication?.status || 'unknown';
  const displayConfidence = selectedManufacturer?.confidence || medication?.confidence || 0;

  const handleUploadPhoto = () => {
    toast.info("Photo upload coming soon", {
      description: "This feature will allow you to upload your bottle photo for identification.",
    });
  };

  const handleRequestReview = () => {
    toast.info("Review request submitted", {
      description: "We'll research your specific manufacturer and notify you when available.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="max-w-2xl mx-auto space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!medication) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Medication Not Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find information for this medication.
            </p>
            <Button onClick={() => navigate('/browse')}>Browse Medications</Button>
          </Card>
        </main>
      </div>
    );
  }

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
          {/* Scope Disclaimer - Collapsed by default */}
          <Disclaimer variant="card" className="mb-6" defaultExpanded={false} />

          {/* Variant Awareness Banner - Always visible */}
          <VariantAwarenessBanner className="mb-6" />

          {/* Header Card */}
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">{medication.name}</h1>
                <p className="text-muted-foreground">
                  {medication.strength} • {medication.form} • {medication.drugClass || 'Unknown Class'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Used for: {medication.uses}
                </p>
              </div>
              <StatusBadge status={displayStatus} />
            </div>

            <ConfidenceMeter value={displayConfidence} className="mb-4" />

            {/* Selected manufacturer indicator */}
            {selectedManufacturer && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>Showing results for: <strong className="text-foreground">{selectedManufacturer.name}</strong></span>
              </div>
            )}
          </Card>

          {/* Manufacturer Selector Card */}
          <ManufacturerSelector
            manufacturers={medication.manufacturers.map((m) => ({
              id: m.id,
              name: m.name,
              dosageForm: m.dosageForm,
              strength: m.strength,
            }))}
            selectedManufacturer={selectedManufacturerId}
            onSelect={setSelectedManufacturerId}
            onUploadPhoto={handleUploadPhoto}
            onRequestReview={handleRequestReview}
            className="mb-6"
          />

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
            {medication.manufacturers.length >= 2 && (
              <Button 
                variant={showCompare ? "secondary" : "outline"} 
                size="sm" 
                className="flex-1"
                onClick={() => setShowCompare(!showCompare)}
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Compare
              </Button>
            )}
            <Link to={`/report/${id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Report
              </Button>
            </Link>
          </div>

          {/* Manufacturer Compare View */}
          {showCompare && medication.manufacturers.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <ManufacturerCompare 
                manufacturers={medication.manufacturers}
                onClose={() => setShowCompare(false)}
              />
            </motion.div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="ingredients" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ingredients">
                Inactive Ingredients
              </TabsTrigger>
              <TabsTrigger value="active">Active Ingredients</TabsTrigger>
            </TabsList>

            <TabsContent value="ingredients" className="space-y-4">
              {medication.manufacturers.length === 0 ? (
                <NoManufacturerDataEmpty
                  medicationName={medication.name}
                  onUploadPhoto={handleUploadPhoto}
                  onRequestReview={handleRequestReview}
                />
              ) : selectedManufacturer ? (
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{selectedManufacturer.name}</h3>
                      <p className="text-sm text-muted-foreground">NDC: {selectedManufacturer.ndc}</p>
                    </div>
                    <StatusBadge status={selectedManufacturer.status} size="sm" />
                  </div>

                  <ConfidenceMeter value={selectedManufacturer.confidence} className="mb-3" />

                  {selectedManufacturer.inactiveIngredients.length === 0 ? (
                    <div className="p-4 text-center bg-muted/50 rounded-lg">
                      <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No inactive ingredient data available for this manufacturer yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Inactive Ingredients:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedManufacturer.inactiveIngredients.map((ing) => {
                          const Icon = statusIcons[ing.status];
                          return (
                            <div
                              key={ing.name}
                              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                ing.status === "halal" ? "bg-status-halal-bg text-status-halal" :
                                ing.status === "questionable" ? "bg-status-questionable-bg text-status-questionable" :
                                ing.status === "not-halal" ? "bg-status-not-halal-bg text-status-not-halal" :
                                "bg-status-unknown-bg text-status-unknown"
                              }`}
                              title={ing.notes}
                            >
                              <Icon className="h-3 w-3" />
                              {ing.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              ) : (
                /* Show all manufacturers when none selected */
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    Showing {medication.manufacturers.length} available manufacturer{medication.manufacturers.length !== 1 ? 's' : ''}. 
                    Select one above for specific results.
                  </p>
                  {medication.manufacturers.map((mfr, index) => (
                    <motion.div
                      key={mfr.ndc}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{mfr.name}</h3>
                            <p className="text-sm text-muted-foreground">NDC: {mfr.ndc}</p>
                          </div>
                          <StatusBadge status={mfr.status} size="sm" />
                        </div>

                        <ConfidenceMeter value={mfr.confidence} className="mb-3" />

                        {mfr.inactiveIngredients.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">
                            Ingredient data pending review
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Inactive Ingredients:</p>
                            <div className="flex flex-wrap gap-2">
                              {mfr.inactiveIngredients.map((ing) => {
                                const Icon = statusIcons[ing.status];
                                return (
                                  <div
                                    key={ing.name}
                                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                      ing.status === "halal" ? "bg-status-halal-bg text-status-halal" :
                                      ing.status === "questionable" ? "bg-status-questionable-bg text-status-questionable" :
                                      ing.status === "not-halal" ? "bg-status-not-halal-bg text-status-not-halal" :
                                      "bg-status-unknown-bg text-status-unknown"
                                    }`}
                                    title={ing.notes}
                                  >
                                    <Icon className="h-3 w-3" />
                                    {ing.name}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="active">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Active Ingredients</h3>
                <div className="space-y-3">
                  {medication.activeIngredients.map((ing) => {
                    const Icon = statusIcons[ing.status];
                    return (
                      <div
                        key={ing.name}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className={`p-1 rounded-full ${
                          ing.status === "halal" ? "bg-status-halal-bg text-status-halal" :
                          ing.status === "questionable" ? "bg-status-questionable-bg text-status-questionable" :
                          "bg-status-unknown-bg text-status-unknown"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-medium">{ing.name}</span>
                          <p className="text-sm text-muted-foreground">{ing.notes}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Active ingredients are the same across all manufacturers for generic medications.
                </p>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Sources */}
          <Card className="p-6 mt-6">
            <h2 className="font-semibold text-lg mb-4">Sources & References</h2>
            
            <ul className="space-y-2 mb-4">
              {medication.sources.map((source) => (
                <li key={source.name}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {source.name}
                  </a>
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground mb-4">
              Last updated: {medication.lastUpdated}
            </p>

            {/* Collapsed Disclaimer in Sources */}
            <Disclaimer variant="inline" />
          </Card>

          {/* Request Review */}
          <Card className="mt-6 p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Don't see your manufacturer?</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Submit a request and we'll research your specific medication.
                </p>
                <Button variant="outline" size="sm" onClick={handleRequestReview}>
                  Request Review
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default RxMedication;
