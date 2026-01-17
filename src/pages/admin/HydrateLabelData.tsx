import { useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Play, CheckCircle, AlertCircle, AlertTriangle, Info, Search, ListChecks, StopCircle, Clock, Zap, Rocket } from "lucide-react";
import { toast } from "sonner";

interface HydrateLog {
  step: string;
  status: "success" | "warning" | "error" | "info";
  message: string;
  data?: unknown;
}

interface HydrateResult {
  success: boolean;
  logs: HydrateLog[];
  med_id: string;
  ndc?: string;
  set_id?: string;
  active_ingredients?: string[];
  inactive_ingredients?: string[];
  inactive_raw_text?: string;
  status?: string;
  confidence?: number;
  confidence_level?: string;
  status_reason?: string;
  variant_id?: string;
}

interface DbVerification {
  ndc: string | null;
  dailymed_set_id: string | null;
  inactive_ingredients: string[] | null;
  inactive_raw_text: string | null;
  default_status: string | null;
  status_reason: string | null;
  confidence_level: string | null;
}

interface BatchProgress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
  currentMedName?: string;
}

interface BatchResult {
  med_id: string;
  med_name: string;
  success: boolean;
  ndc?: string;
  status?: string;
  error?: string;
}

interface ScheduledHydrateResult {
  med_id: string;
  generic_name: string;
  success: boolean;
  status?: string;
  error?: string;
}

interface ScheduledJobResult {
  success: boolean;
  message: string;
  logs: string[];
  results: ScheduledHydrateResult[];
  remaining_count?: number;
  total_processed?: number;
  batch_size?: number;
}

interface HydrateAllProgress {
  totalMeds: number;
  totalProcessed: number;
  totalSuccess: number;
  totalFailed: number;
  batchesCompleted: number;
  estimatedBatchesTotal: number;
  currentBatchResults: ScheduledHydrateResult[];
  isComplete: boolean;
  startTime: number;
}

export default function HydrateLabelData() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedId, setSelectedMedId] = useState<string>("");
  const [isHydrating, setIsHydrating] = useState(false);
  const [result, setResult] = useState<HydrateResult | null>(null);
  const [dbVerification, setDbVerification] = useState<DbVerification | null>(null);

  // Batch state
  const [selectedMedIds, setSelectedMedIds] = useState<Set<string>>(new Set());
  const [isBatchHydrating, setIsBatchHydrating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [shouldStopBatch, setShouldStopBatch] = useState(false);

  // Scheduled job state
  const [isRunningScheduled, setIsRunningScheduled] = useState(false);
  const [scheduledJobResult, setScheduledJobResult] = useState<ScheduledJobResult | null>(null);

  // Hydrate All state
  const [isHydratingAll, setIsHydratingAll] = useState(false);
  const [hydrateAllProgress, setHydrateAllProgress] = useState<HydrateAllProgress | null>(null);
  const shouldStopHydrateAllRef = useRef(false);
  const [allResults, setAllResults] = useState<ScheduledHydrateResult[]>([]);

  // Fetch rx_meds for selection
  const { data: meds, isLoading: medsLoading } = useQuery({
    queryKey: ["rx-meds-list", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("rx_meds")
        .select("id, generic_name, brand_names, dosage_forms, ndc, dailymed_set_id, spl_last_fetched_at")
        .order("generic_name");
      
      if (searchQuery) {
        query = query.or(`generic_name.ilike.%${searchQuery}%,brand_names.cs.{${searchQuery}}`);
      }
      
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });

  const handleHydrate = async () => {
    if (!selectedMedId) {
      toast.error("Please select a medication");
      return;
    }

    setIsHydrating(true);
    setResult(null);
    setDbVerification(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      const { data, error } = await supabase.functions.invoke("hydrate-label-data", {
        body: { med_id: selectedMedId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        toast.error(`Hydration failed: ${error.message}`);
        return;
      }

      setResult(data as HydrateResult);
      queryClient.invalidateQueries({ queryKey: ["rx-meds-list"] });
      
      // FIX #6: Re-fetch the updated rx_meds row to verify DB writes
      const { data: updatedMed } = await supabase
        .from("rx_meds")
        .select("ndc, dailymed_set_id, inactive_ingredients, inactive_raw_text, default_status, status_reason, confidence_level")
        .eq("id", selectedMedId)
        .single();
      
      if (updatedMed) {
        setDbVerification(updatedMed as DbVerification);
      }
      
      if (data.success) {
        toast.success("Label data hydrated successfully!");
      } else {
        toast.warning("Hydration completed with issues");
      }
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsHydrating(false);
    }
  };

  const toggleMedSelection = (medId: string) => {
    setSelectedMedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(medId)) {
        newSet.delete(medId);
      } else {
        newSet.add(medId);
      }
      return newSet;
    });
  };

  const selectAllMeds = () => {
    if (!meds) return;
    const unhydratedMeds = meds.filter(m => !m.spl_last_fetched_at);
    setSelectedMedIds(new Set(unhydratedMeds.map(m => m.id)));
  };

  const clearSelection = () => {
    setSelectedMedIds(new Set());
  };

  const handleBatchHydrate = useCallback(async () => {
    if (selectedMedIds.size === 0) {
      toast.error("Please select at least one medication");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in");
      return;
    }

    setIsBatchHydrating(true);
    setShouldStopBatch(false);
    setBatchResults([]);
    setBatchProgress({
      total: selectedMedIds.size,
      completed: 0,
      successful: 0,
      failed: 0,
    });

    const medIdsArray = Array.from(selectedMedIds);
    const results: BatchResult[] = [];

    for (let i = 0; i < medIdsArray.length; i++) {
      if (shouldStopBatch) {
        toast.info("Batch hydration stopped by user");
        break;
      }

      const medId = medIdsArray[i];
      const med = meds?.find(m => m.id === medId);
      const medName = med?.generic_name || "Unknown";

      setBatchProgress(prev => prev ? {
        ...prev,
        currentMedName: medName,
      } : null);

      try {
        const { data, error } = await supabase.functions.invoke("hydrate-label-data", {
          body: { med_id: medId },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const batchResult: BatchResult = {
          med_id: medId,
          med_name: medName,
          success: !error && data?.success,
          ndc: data?.ndc,
          status: data?.status,
          error: error?.message || (!data?.success ? "Hydration incomplete" : undefined),
        };

        results.push(batchResult);
        setBatchResults([...results]);

        setBatchProgress(prev => prev ? {
          ...prev,
          completed: i + 1,
          successful: prev.successful + (batchResult.success ? 1 : 0),
          failed: prev.failed + (batchResult.success ? 0 : 1),
        } : null);

      } catch (err) {
        const batchResult: BatchResult = {
          med_id: medId,
          med_name: medName,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
        results.push(batchResult);
        setBatchResults([...results]);

        setBatchProgress(prev => prev ? {
          ...prev,
          completed: i + 1,
          failed: prev.failed + 1,
        } : null);
      }

      // Small delay to prevent rate limiting
      if (i < medIdsArray.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsBatchHydrating(false);
    queryClient.invalidateQueries({ queryKey: ["rx-meds-list"] });
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    if (failCount === 0) {
      toast.success(`Batch complete: ${successCount} medications hydrated successfully`);
    } else if (successCount === 0) {
      toast.error(`Batch failed: All ${failCount} medications failed`);
    } else {
      toast.warning(`Batch complete: ${successCount} successful, ${failCount} failed`);
    }
  }, [selectedMedIds, meds, shouldStopBatch, queryClient]);

  const stopBatch = () => {
    setShouldStopBatch(true);
  };

  const handleRunScheduledJob = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in");
      return;
    }

    setIsRunningScheduled(true);
    setScheduledJobResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("scheduled-hydrate", {
        body: { limit: 50 },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        toast.error(`Scheduled job failed: ${error.message}`);
        setScheduledJobResult({
          success: false,
          message: error.message,
          logs: [],
          results: [],
        });
        return;
      }

      setScheduledJobResult(data as ScheduledJobResult);
      queryClient.invalidateQueries({ queryKey: ["rx-meds-list"] });

      if (data.success) {
        toast.success(data.message || "Scheduled hydration completed!");
      } else {
        toast.error(data.message || "Scheduled hydration failed");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Error: ${errorMsg}`);
      setScheduledJobResult({
        success: false,
        message: errorMsg,
        logs: [],
        results: [],
      });
    } finally {
      setIsRunningScheduled(false);
    }
  };

  const handleHydrateAll = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in");
      return;
    }

    // Get initial count
    const { count: initialCount } = await supabase
      .from('rx_meds')
      .select('id', { count: 'exact', head: true })
      .is('spl_last_fetched_at', null);

    if (!initialCount || initialCount === 0) {
      toast.info("All medications are already hydrated!");
      return;
    }

    const batchSize = 75;
    const estimatedBatches = Math.ceil(initialCount / batchSize);

    setIsHydratingAll(true);
    shouldStopHydrateAllRef.current = false;
    setAllResults([]);
    setHydrateAllProgress({
      totalMeds: initialCount,
      totalProcessed: 0,
      totalSuccess: 0,
      totalFailed: 0,
      batchesCompleted: 0,
      estimatedBatchesTotal: estimatedBatches,
      currentBatchResults: [],
      isComplete: false,
      startTime: Date.now(),
    });

    let batchNumber = 0;
    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    const allBatchResults: ScheduledHydrateResult[] = [];

    while (!shouldStopHydrateAllRef.current) {
      batchNumber++;
      
      try {
        const { data, error } = await supabase.functions.invoke("scheduled-hydrate", {
          body: { batch_size: batchSize },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          toast.error(`Batch ${batchNumber} failed: ${error.message}`);
          break;
        }

        const jobResult = data as ScheduledJobResult;
        
        // Update totals
        const batchSuccess = jobResult.results.filter(r => r.success).length;
        const batchFailed = jobResult.results.filter(r => !r.success).length;
        totalProcessed += jobResult.results.length;
        totalSuccess += batchSuccess;
        totalFailed += batchFailed;
        
        // Accumulate all results
        allBatchResults.push(...jobResult.results);
        setAllResults([...allBatchResults]);

        setHydrateAllProgress({
          totalMeds: initialCount,
          totalProcessed,
          totalSuccess,
          totalFailed,
          batchesCompleted: batchNumber,
          estimatedBatchesTotal: Math.ceil((jobResult.remaining_count || 0) / batchSize) + batchNumber,
          currentBatchResults: jobResult.results,
          isComplete: (jobResult.remaining_count || 0) === 0,
          startTime: hydrateAllProgress?.startTime || Date.now(),
        });

        // Check if complete
        if ((jobResult.remaining_count || 0) === 0) {
          toast.success(`All medications hydrated! ${totalSuccess} success, ${totalFailed} failed`);
          break;
        }

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        toast.error(`Error in batch ${batchNumber}: ${errorMsg}`);
        break;
      }
    }

    if (shouldStopHydrateAllRef.current) {
      toast.info(`Hydration stopped after ${batchNumber} batches. ${totalProcessed} medications processed.`);
    }

    setHydrateAllProgress(prev => prev ? { ...prev, isComplete: true } : null);
    setIsHydratingAll(false);
    queryClient.invalidateQueries({ queryKey: ["rx-meds-list"] });
  };

  const stopHydrateAll = () => {
    shouldStopHydrateAllRef.current = true;
    toast.info("Stopping after current batch completes...");
  };

  const formatElapsedTime = (startTime: number) => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getLogIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogBadgeVariant = (status: string) => {
    switch (status) {
      case "success":
        return "default";
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      default:
        return "outline";
    }
  };

  const selectedMed = meds?.find(m => m.id === selectedMedId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hydrate Label Data</h1>
        <p className="text-muted-foreground">
          Fetch NDC, DailyMed set_id, and ingredient data for rx_meds records
        </p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">Single Medication</TabsTrigger>
          <TabsTrigger value="batch">
            <ListChecks className="mr-2 h-4 w-4" />
            Batch Hydration
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Clock className="mr-2 h-4 w-4" />
            Scheduled Job
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Medication</CardTitle>
              <CardDescription>
                Choose a medication to hydrate its label data from openFDA and DailyMed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Medications</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by generic or brand name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="medication">Medication</Label>
                <Select value={selectedMedId} onValueChange={setSelectedMedId}>
                  <SelectTrigger>
                    <SelectValue placeholder={medsLoading ? "Loading..." : "Select a medication"} />
                  </SelectTrigger>
                  <SelectContent>
                    {meds?.map((med) => (
                      <SelectItem key={med.id} value={med.id}>
                        <div className="flex items-center gap-2">
                          <span>{med.generic_name}</span>
                          {med.ndc && (
                            <Badge variant="outline" className="text-xs">
                              has NDC
                            </Badge>
                          )}
                          {med.spl_last_fetched_at && (
                            <Badge variant="secondary" className="text-xs">
                              hydrated
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMed && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 space-y-2 text-sm">
                    <div><strong>Generic:</strong> {selectedMed.generic_name}</div>
                    {selectedMed.brand_names?.length > 0 && (
                      <div><strong>Brands:</strong> {selectedMed.brand_names.join(", ")}</div>
                    )}
                    {selectedMed.dosage_forms?.length > 0 && (
                      <div><strong>Forms:</strong> {selectedMed.dosage_forms.join(", ")}</div>
                    )}
                    {selectedMed.ndc && <div><strong>NDC:</strong> {selectedMed.ndc}</div>}
                    {selectedMed.dailymed_set_id && (
                      <div><strong>Set ID:</strong> {selectedMed.dailymed_set_id}</div>
                    )}
                    {selectedMed.spl_last_fetched_at && (
                      <div><strong>Last Hydrated:</strong> {new Date(selectedMed.spl_last_fetched_at).toLocaleString()}</div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Button 
                onClick={handleHydrate} 
                disabled={!selectedMedId || isHydrating}
                className="w-full"
              >
                {isHydrating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Hydrating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Hydrate Label Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Hydration</CardTitle>
              <CardDescription>
                Select multiple medications to hydrate in sequence with progress tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="batch-search">Search Medications</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="batch-search"
                      placeholder="Search by generic or brand name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllMeds} disabled={isBatchHydrating}>
                  Select All Unhydrated
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection} disabled={isBatchHydrating}>
                  Clear Selection
                </Button>
                <Badge variant="secondary" className="ml-auto">
                  {selectedMedIds.size} selected
                </Badge>
              </div>

              <ScrollArea className="h-[300px] border rounded-lg p-2">
                <div className="space-y-2">
                  {medsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : meds?.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No medications found</p>
                  ) : (
                    meds?.map((med) => (
                      <div 
                        key={med.id} 
                        className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                        onClick={() => !isBatchHydrating && toggleMedSelection(med.id)}
                      >
                        <Checkbox 
                          checked={selectedMedIds.has(med.id)}
                          disabled={isBatchHydrating}
                          onCheckedChange={() => toggleMedSelection(med.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{med.generic_name}</div>
                          {med.brand_names && med.brand_names.length > 0 && (
                            <div className="text-xs text-muted-foreground truncate">
                              {med.brand_names.join(", ")}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {med.ndc && (
                            <Badge variant="outline" className="text-xs">NDC</Badge>
                          )}
                          {med.spl_last_fetched_at && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Hydrated
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {batchProgress && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {batchProgress.completed} / {batchProgress.total}</span>
                      <span>{Math.round((batchProgress.completed / batchProgress.total) * 100)}%</span>
                    </div>
                    <Progress value={(batchProgress.completed / batchProgress.total) * 100} />
                    {batchProgress.currentMedName && isBatchHydrating && (
                      <div className="text-sm text-muted-foreground">
                        Processing: {batchProgress.currentMedName}
                      </div>
                    )}
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        {batchProgress.successful} successful
                      </span>
                      <span className="text-red-600">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        {batchProgress.failed} failed
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleBatchHydrate} 
                  disabled={selectedMedIds.size === 0 || isBatchHydrating}
                  className="flex-1"
                >
                  {isBatchHydrating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Batch Hydration ({selectedMedIds.size})
                    </>
                  )}
                </Button>
                {isBatchHydrating && (
                  <Button variant="destructive" onClick={stopBatch}>
                    <StopCircle className="mr-2 h-4 w-4" />
                    Stop
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {batchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Batch Results</CardTitle>
                <CardDescription>
                  Results from the batch hydration process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {batchResults.map((result, index) => (
                      <div 
                        key={index}
                        className={`p-3 border rounded-lg flex items-center justify-between ${
                          result.success ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950" : 
                          "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">{result.med_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.ndc && (
                            <Badge variant="outline" className="text-xs">
                              NDC: {result.ndc}
                            </Badge>
                          )}
                          {result.status && (
                            <Badge variant={
                              result.status === "halal" ? "default" :
                              result.status === "haram" ? "destructive" :
                              "secondary"
                            } className="text-xs">
                              {result.status}
                            </Badge>
                          )}
                          {result.error && (
                            <span className="text-xs text-red-600">{result.error}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {/* Hydrate All Card */}
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                Hydrate All Medications
              </CardTitle>
              <CardDescription>
                Automatically hydrate all remaining unhydrated medications in batches. 
                This will run continuously until complete or stopped.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hydrateAllProgress && (
                <Card className="bg-background">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>
                        Batch {hydrateAllProgress.batchesCompleted} 
                        {hydrateAllProgress.estimatedBatchesTotal > 0 && 
                          ` / ~${hydrateAllProgress.estimatedBatchesTotal}`}
                      </span>
                      <span className="text-muted-foreground">
                        Elapsed: {formatElapsedTime(hydrateAllProgress.startTime)}
                      </span>
                    </div>
                    <Progress 
                      value={(hydrateAllProgress.totalProcessed / hydrateAllProgress.totalMeds) * 100} 
                    />
                    <div className="flex justify-between text-sm">
                      <span>{hydrateAllProgress.totalProcessed} / {hydrateAllProgress.totalMeds} medications</span>
                      <span>{Math.round((hydrateAllProgress.totalProcessed / hydrateAllProgress.totalMeds) * 100)}%</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        {hydrateAllProgress.totalSuccess} successful
                      </span>
                      <span className="text-red-600">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        {hydrateAllProgress.totalFailed} failed
                      </span>
                    </div>
                    {hydrateAllProgress.isComplete && (
                      <Badge variant="default" className="w-full justify-center py-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete!
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleHydrateAll} 
                  disabled={isHydratingAll || isRunningScheduled}
                  className="flex-1"
                  size="lg"
                >
                  {isHydratingAll ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Hydrating All...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-4 w-4" />
                      Hydrate All Medications
                    </>
                  )}
                </Button>
                {isHydratingAll && (
                  <Button variant="destructive" onClick={stopHydrateAll} size="lg">
                    <StopCircle className="mr-2 h-4 w-4" />
                    Stop
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* All Results */}
          {allResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>All Hydration Results ({allResults.length})</CardTitle>
                <CardDescription>
                  Complete list of processed medications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-1">
                    {allResults.map((result, index) => (
                      <div 
                        key={index}
                        className={`p-2 rounded-lg flex items-center justify-between text-sm ${
                          result.success ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span>{result.generic_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.status && (
                            <Badge variant={
                              result.status === "halal" ? "default" :
                              result.status === "haram" ? "destructive" :
                              "secondary"
                            } className="text-xs">
                              {result.status}
                            </Badge>
                          )}
                          {result.error && (
                            <span className="text-xs text-red-600 truncate max-w-[150px]">{result.error}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Single Batch Job Card */}
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Run Single Batch (50 medications)
            </CardTitle>
            <CardDescription>
              Run a single batch of up to 50 medications. Useful for testing or partial hydration.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleRunScheduledJob} 
                disabled={isRunningScheduled || isHydratingAll}
                className="w-full"
                variant="outline"
              >
                {isRunningScheduled ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Single Batch...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Run Single Batch
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {scheduledJobResult && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Job Result
                    <Badge variant={scheduledJobResult.success ? "default" : "destructive"}>
                      {scheduledJobResult.success ? "Success" : "Failed"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{scheduledJobResult.message}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scheduledJobResult.results.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          {scheduledJobResult.results.filter(r => r.success).length} successful
                        </span>
                        <span className="text-red-600">
                          <AlertCircle className="h-4 w-4 inline mr-1" />
                          {scheduledJobResult.results.filter(r => !r.success).length} failed
                        </span>
                      </div>

                      <ScrollArea className="h-[200px] border rounded-lg">
                        <div className="p-2 space-y-2">
                          {scheduledJobResult.results.map((result, index) => (
                            <div 
                              key={index}
                              className={`p-2 rounded-lg flex items-center justify-between text-sm ${
                                result.success ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {result.success ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                                <span>{result.generic_name}</span>
                              </div>
                              {result.status && (
                                <Badge variant={
                                  result.status === "halal" ? "default" :
                                  result.status === "haram" ? "destructive" :
                                  "secondary"
                                } className="text-xs">
                                  {result.status}
                                </Badge>
                              )}
                              {result.error && (
                                <span className="text-xs text-red-600">{result.error}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>

              {scheduledJobResult.logs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Job Logs</CardTitle>
                    <CardDescription>Execution timeline from the scheduled job</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-1 font-mono text-xs">
                        {scheduledJobResult.logs.map((log, index) => (
                          <div 
                            key={index}
                            className={`p-2 rounded ${
                              log.includes('✓') ? 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200' :
                              log.includes('✗') ? 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200' :
                              log.includes('Fatal') || log.includes('error') ? 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200' :
                              'bg-muted'
                            }`}
                          >
                            {log}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {result && (
        <>
          {/* FIX #6: Database Verification Section */}
          {dbVerification && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <CheckCircle className="h-5 w-5" />
                  Database Verification (Actual DB Values)
                </CardTitle>
                <CardDescription>
                  These values were re-fetched from the database after hydration to confirm writes succeeded.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>NDC:</strong> {dbVerification.ndc || <span className="text-muted-foreground">null</span>}
                  </div>
                  <div>
                    <strong>DailyMed Set ID:</strong> {dbVerification.dailymed_set_id || <span className="text-muted-foreground">null</span>}
                  </div>
                  <div>
                    <strong>Status:</strong>{" "}
                    {dbVerification.default_status ? (
                      <Badge variant={
                        dbVerification.default_status === "halal" ? "default" :
                        dbVerification.default_status === "haram" ? "destructive" :
                        "secondary"
                      }>
                        {dbVerification.default_status}
                      </Badge>
                    ) : <span className="text-muted-foreground">null</span>}
                  </div>
                  <div>
                    <strong>Confidence:</strong> {dbVerification.confidence_level || <span className="text-muted-foreground">null</span>}
                  </div>
                </div>

                {dbVerification.status_reason && (
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <strong>Status Reason:</strong> {dbVerification.status_reason}
                  </div>
                )}

                {dbVerification.inactive_ingredients && dbVerification.inactive_ingredients.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Inactive Ingredients in DB ({dbVerification.inactive_ingredients.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {dbVerification.inactive_ingredients.map((ing, i) => (
                        <Badge key={i} variant="secondary">{ing}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {dbVerification.inactive_raw_text && (
                  <div>
                    <h4 className="font-medium mb-2">Raw Inactive Text (Debug)</h4>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap max-h-32">
                      {dbVerification.inactive_raw_text}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Function Result
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Success" : "Incomplete"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {result.ndc && (
                  <div>
                    <strong>NDC:</strong> {result.ndc}
                  </div>
                )}
                {result.set_id && (
                  <div>
                    <strong>DailyMed Set ID:</strong> {result.set_id}
                  </div>
                )}
                {result.status && (
                  <div>
                    <strong>Status:</strong>{" "}
                    <Badge variant={
                      result.status === "halal" ? "default" :
                      result.status === "haram" ? "destructive" :
                      "secondary"
                    }>
                      {result.status}
                    </Badge>
                  </div>
                )}
                {result.confidence !== undefined && (
                  <div>
                    <strong>Confidence:</strong>{" "}
                    <Badge variant="outline">{result.confidence}%</Badge>
                  </div>
                )}
                {result.variant_id && (
                  <div className="col-span-2">
                    <strong>Variant ID:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">{result.variant_id}</code>
                  </div>
                )}
              </div>

              {result.status_reason && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <strong>Reason:</strong> {result.status_reason}
                </div>
              )}

              {result.active_ingredients && result.active_ingredients.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Active Ingredients ({result.active_ingredients.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.active_ingredients.map((ing, i) => (
                      <Badge key={i} variant="outline">{ing}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.inactive_ingredients && result.inactive_ingredients.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Inactive Ingredients ({result.inactive_ingredients.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.inactive_ingredients.map((ing, i) => (
                      <Badge key={i} variant="secondary">{ing}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.inactive_raw_text && (
                <div>
                  <h4 className="font-medium mb-2">Raw Inactive Text</h4>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap max-h-32">
                    {result.inactive_raw_text}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Execution Logs</CardTitle>
              <CardDescription>
                Detailed logs from the hydration process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {result.logs.map((log, index) => (
                    <div 
                      key={index} 
                      className="p-3 border rounded-lg space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        {getLogIcon(log.status)}
                        <Badge variant={getLogBadgeVariant(log.status) as "default" | "destructive" | "secondary" | "outline"}>
                          {log.step}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm">{log.message}</p>
                      {log.data && (
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
