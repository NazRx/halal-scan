import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Disclaimer } from "@/components/ui/disclaimer";
import { ManufacturerSelector } from "@/components/rx/ManufacturerSelector";
import { ManufacturerCompare } from "@/components/rx/ManufacturerCompare";
import { VariantAwarenessBanner } from "@/components/rx/VariantAwarenessBanner";
import { NoManufacturerDataEmpty } from "@/components/browse/EmptyStates";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumGate, PremiumBadge } from "@/components/premium/PremiumGate";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useSavedManufacturers } from "@/hooks/useSavedManufacturers";
import { useViewHistory } from "@/hooks/useViewHistory";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Share2, Bookmark, BookmarkCheck, Building2, Check, X, HelpCircle, FileText, AlertCircle, ArrowLeftRight, Sparkles, Lock } from "lucide-react";
import { LastVerifiedBadge } from "@/components/ui/last-verified-badge";
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
  classificationRationale?: string;
  isBrand?: boolean;
  isPromoted?: boolean;
  // For smart sorting
  inactiveFoundCount: number;
  riskUnknownCount: number;
}

export type ManufacturerSortMode = 'disclosure' | 'alphabetical';

// Status rank for sorting: lower is better
const STATUS_RANK: Record<'halal' | 'questionable' | 'not-halal' | 'unknown', number> = {
  halal: 1,
  questionable: 3,
  unknown: 4,
  'not-halal': 5,
};

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
  lastVerifiedDate: string; // ISO date string for precise verification date
}

// Map DB status to UI status - FIX #5: treat needs_verification as unknown
function mapStatus(dbStatus: string | null): 'halal' | 'questionable' | 'not-halal' | 'unknown' {
  if (!dbStatus) return 'unknown';
  if (dbStatus === 'halal') return 'halal';
  if (dbStatus === 'mushbooh') return 'questionable';
  if (dbStatus === 'haram') return 'not-halal';
  if (dbStatus === 'needs_verification') return 'unknown';
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
  const { isPro } = useSubscription();
  const { user } = useAuth();
  const { isSaved, toggleSave, savedVariantIds } = useSavedManufacturers();
  const { trackView } = useViewHistory();
  
  const [medication, setMedication] = useState<MedicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<ManufacturerSortMode>('alphabetical');
  const [hideUnknown, setHideUnknown] = useState(false);

  useEffect(() => {
    const fetchMedication = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        console.log('Fetching medication with id:', id);
        
        // Fetch the medication - use maybeSingle to gracefully handle no results
        const { data: rxMed, error: rxError } = await supabase
          .from('rx_meds')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        console.log('Query result:', { rxMed, rxError });

        if (rxError) {
          console.error('Error fetching medication:', rxError);
          setMedication(null);
          setIsLoading(false);
          return;
        }

        if (!rxMed) {
          console.log('No medication found with id:', id);
          setMedication(null);
          setIsLoading(false);
          return;
        }

        // Fetch variants for this medication
        const { data: variants } = await supabase
          .from('rx_variants')
          .select('*')
          .eq('rx_med_id', id);

        // Fetch verdicts for variants (including classification_rationale)
        const variantIds = (variants || []).map(v => v.id);
        const { data: verdicts } = await supabase
          .from('rx_verdicts')
          .select('*, classification_rationale')
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

          // Count ingredients for smart sorting
          const inactiveFoundCount = ingredients.length;
          const riskUnknownCount = ingredients.filter(i => i.status === 'unknown').length;

          return {
            id: variant.id,
            name: variant.manufacturer || 'Unknown Manufacturer',
            ndc: (variant.ndc_list || [])[0] || 'N/A',
            dosageForm: variant.dosage_form || 'Unknown',
            strength: variant.strength_text || 'Unknown',
            status: mapStatus(verdict?.status || null),
            confidence: verdict?.confidence || 0,
            inactiveIngredients: ingredients,
            classificationRationale: verdict?.classification_rationale || undefined,
            isBrand: variant.is_brand || false,
            isPromoted: variant.is_promoted || false,
            inactiveFoundCount,
            riskUnknownCount,
          };
        });

        // FIX #5: Fallback manufacturer from rx_meds when no variants exist
        if (manufacturers.length === 0 && rxMed.inactive_ingredients && rxMed.inactive_ingredients.length > 0) {
          const fallbackIngredients = (rxMed.inactive_ingredients || []).map((ing: string) => ({
            name: ing,
            status: 'unknown' as const,
          }));
          manufacturers.push({
            id: `hydrated-${rxMed.id}`,
            name: 'General (Hydrated)',
            ndc: rxMed.ndc || 'N/A',
            dosageForm: (rxMed.dosage_forms || [])[0] || 'Unknown',
            strength: 'Various',
            status: mapStatus(rxMed.default_status || null),
            confidence: rxMed.confidence_level === 'high' ? 85 : rxMed.confidence_level === 'medium' ? 60 : 30,
            inactiveIngredients: fallbackIngredients,
            classificationRationale: rxMed.status_reason || undefined,
            isBrand: false,
            isPromoted: false,
            inactiveFoundCount: fallbackIngredients.length,
            riskUnknownCount: fallbackIngredients.filter(i => i.status === 'unknown').length,
          });
        }

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
        let overallStatus: 'halal' | 'questionable' | 'not-halal' | 'unknown' = mapStatus(rxMed.default_status || null);
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
          : (rxMed.confidence_level === 'high' ? 85 : rxMed.confidence_level === 'medium' ? 60 : 30);

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
          lastVerifiedDate: rxMed.updated_at, // Store the ISO date for the badge
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

  // Smart sort manufacturers with multiple criteria
  const sortedManufacturers = useMemo(() => {
    if (!medication?.manufacturers) return [];
    
    let mfrs = [...medication.manufacturers];
    
    // Apply "hide unknown" filter if enabled
    if (hideUnknown) {
      mfrs = mfrs.filter(m => m.status !== 'unknown');
    }
    
    if (sortMode === 'disclosure') {
      // Sort by disclosure level (confidence score descending = most transparent first)
      mfrs.sort((a, b) => {
        // 1. Promoted first (Pro feature)
        if (isPro) {
          if (a.isPromoted && !b.isPromoted) return -1;
          if (!a.isPromoted && b.isPromoted) return 1;
        }
        // 2. By disclosure (confidence) score descending
        const aConf = a.confidence ?? 0;
        const bConf = b.confidence ?? 0;
        if (aConf !== bConf) return bConf - aConf;
        // 3. By inactive ingredient count descending (more data = better)
        if (a.inactiveFoundCount !== b.inactiveFoundCount) return b.inactiveFoundCount - a.inactiveFoundCount;
        // 4. Alphabetical fallback
        return a.name.localeCompare(b.name);
      });
    } else {
      // Default: A–Z alphabetical
      mfrs.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return mfrs;
  }, [medication?.manufacturers, isPro, sortMode, hideUnknown]);

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

  // Handle save/unsave manufacturer
  const handleSaveManufacturer = useCallback(async (variantId: string) => {
    if (!user) {
      toast.error("Please sign in to save manufacturers");
      navigate('/auth');
      return;
    }

    if (!isPro) {
      toast.info("Pro feature", {
        description: "Upgrade to Pro to save your favorite manufacturers.",
        action: {
          label: "Upgrade",
          onClick: () => navigate('/pricing'),
        },
      });
      return;
    }

    setSavingId(variantId);
    const result = await toggleSave(variantId);
    setSavingId(null);

    if (result.success) {
      const wasSaved = savedVariantIds.has(variantId);
      toast.success(wasSaved ? "Removed from saved" : "Saved manufacturer");
    } else {
      toast.error(result.error || "Failed to save");
    }
  }, [user, isPro, toggleSave, savedVariantIds, navigate]);

  // Track view when manufacturer is selected
  const handleManufacturerSelect = useCallback((manufacturerId: string | null) => {
    setSelectedManufacturerId(manufacturerId);
    
    if (manufacturerId && medication && user) {
      const mfr = medication.manufacturers.find(m => m.id === manufacturerId);
      trackView('report_view', manufacturerId, {
        medication_name: medication.name,
        manufacturer_name: mfr?.name || 'Unknown',
        status: mfr?.status,
        med_id: medication.id,
      });
    }
  }, [medication, user, trackView]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container px-4 pt-24 pb-6">
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
      <div className="min-h-screen">
        <Header />
        <main className="container px-4 pt-24 pb-6">
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
    <div className="min-h-screen">
      <Header />
      
      <main className="container px-4 pt-24 pb-6">
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

            {/* Disclosure level indicator — replaces confidence percentage */}
            <p className="text-xs text-muted-foreground mb-4">
              Ingredient disclosure level: {displayConfidence >= 80 ? 'High' : displayConfidence >= 50 ? 'Moderate' : 'Limited'}
            </p>

            {/* Selected manufacturer indicator */}
            {selectedManufacturer && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Building2 className="h-4 w-4" />
                <span>Showing results for: <strong className="text-foreground">{selectedManufacturer.name}</strong></span>
              </div>
            )}
            
            {/* Last Verified Badge - Premium Feature */}
            <LastVerifiedBadge date={medication.lastVerifiedDate} />
          </Card>

          {/* Manufacturer Selector Card - with smart sorting */}
          <ManufacturerSelector
            manufacturers={sortedManufacturers.map((m) => ({
              id: m.id,
              name: m.name,
              dosageForm: m.dosageForm,
              strength: m.strength,
              status: m.status,
              confidence: m.confidence,
            }))}
            selectedManufacturer={selectedManufacturerId}
            onSelect={handleManufacturerSelect}
            onUploadPhoto={handleUploadPhoto}
            onRequestReview={handleRequestReview}
            className="mb-6"
            savedVariantIds={savedVariantIds}
            sortMode={sortMode}
            onSortModeChange={setSortMode}
            hideUnknown={hideUnknown}
            onHideUnknownChange={setHideUnknown}
            totalCount={medication.manufacturers.length}
          />

          {/* Quick Actions */}
          <div className="flex gap-2 mb-6">
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {selectedManufacturer ? (
              <Button 
                variant={isSaved(selectedManufacturer.id) ? "secondary" : "outline"} 
                size="sm" 
                className="flex-1"
                onClick={() => handleSaveManufacturer(selectedManufacturer.id)}
                disabled={savingId === selectedManufacturer.id}
              >
                {!isPro ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Save
                  </>
                ) : isSaved(selectedManufacturer.id) ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="flex-1" disabled>
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
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

                  <p className="text-xs text-muted-foreground mb-3">
                    Ingredient disclosure level: {selectedManufacturer.confidence >= 80 ? 'High' : selectedManufacturer.confidence >= 50 ? 'Moderate' : 'Limited'}
                  </p>

                  {/* Classification Rationale - Premium Only */}
                  <PremiumGate
                    upgradeMessage="Upgrade to Pro to see detailed classification rationale for each manufacturer"
                    className="mb-4"
                    showBlurredPreview={!!selectedManufacturer.classificationRationale}
                  >
                    {selectedManufacturer.classificationRationale && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Classification Rationale</span>
                          <PremiumBadge />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedManufacturer.classificationRationale}
                        </p>
                      </div>
                    )}
                    {!selectedManufacturer.classificationRationale && (
                      <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-4 w-4" />
                          <span className="font-medium">Classification Rationale</span>
                        </div>
                        <p>No detailed rationale available yet for this NDC.</p>
                      </div>
                    )}
                  </PremiumGate>

                  {/* Flagged Ingredient Note */}
                  {selectedManufacturer.status !== 'halal' && selectedManufacturer.status !== 'unknown' && selectedManufacturer.inactiveIngredients.length > 0 && (
                    <div className="p-3 rounded-lg mb-4 bg-muted border border-border">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Flagged ingredient</p>
                          {(() => {
                            const trigger = selectedManufacturer.inactiveIngredients.find(
                              i => i.status === 'not-halal' || i.status === 'questionable'
                            );
                            return trigger ? (
                              <p className="text-sm text-muted-foreground">
                                <strong>{trigger.name}</strong>
                                {trigger.notes && `: ${trigger.notes}`}
                              </p>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Missing Inactive Ingredients Warning */}
                  {selectedManufacturer.inactiveIngredients.length === 0 ? (
                    <div className="p-4 bg-muted border border-border rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">
                            Inactive Ingredient Data Not Available
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            A complete ingredient assessment cannot be performed without inactive ingredient (excipient) data. This formulation is listed as unverified.
                          </p>
                        </div>
                      </div>
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

                        <p className="text-xs text-muted-foreground mb-3">
                          Ingredient disclosure level: {mfr.confidence >= 80 ? 'High' : mfr.confidence >= 50 ? 'Moderate' : 'Limited'}
                        </p>

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
