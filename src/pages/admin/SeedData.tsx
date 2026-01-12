import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Play, Pause, RefreshCw, CheckCircle, XCircle, Loader2, Pill, AlertTriangle, FileText, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DrugSummary {
  id: string;
  genericName: string;
  totalVariants: number;
  fdaVariants: number;
  withIngredients: number;
  manualVariants: number;
}

interface SeedResult {
  drugName: string;
  manufacturersAdded: number;
  ingredientsLinked: number;
  error?: string;
}

interface LogEntry {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface FDAEnrichmentStats {
  labelsChecked: number;
  recallsChecked: number;
  rxnormLinked: number;
  recallsFound: number;
}

export default function SeedData() {
  const [drugs, setDrugs] = useState<DrugSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentDrug, setCurrentDrug] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({ processed: 0, added: 0, ingredients: 0, errors: 0 });
  const [fdaStats, setFdaStats] = useState<FDAEnrichmentStats>({ labelsChecked: 0, recallsChecked: 0, rxnormLinked: 0, recallsFound: 0 });
  const [includeIngredients, setIncludeIngredients] = useState(true);
  const [activeTab, setActiveTab] = useState('manufacturers');

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setLogs(prev => [...prev, { timestamp: new Date(), message, type }]);
  };

  // FDA Label fetching
  const fetchFDALabels = async () => {
    setIsSeeding(true);
    addLog('Fetching FDA drug labels...', 'info');

    const drugsToProcess = drugs.slice(0, 20); // Process in batches
    let processed = 0;

    for (const drug of drugsToProcess) {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-fda-labels', {
          body: { genericName: drug.genericName }
        });

        if (error) throw error;

        if (data.labelData) {
          // Update the rx_meds table with label data
          const { error: updateError } = await supabase
            .from('rx_meds')
            .update({
              fda_warnings: data.labelData.warnings?.slice(0, 5) || null,
              fda_indications: data.labelData.indications?.substring(0, 2000) || null,
              fda_contraindications: data.labelData.contraindications?.substring(0, 2000) || null,
              fda_drug_interactions: data.labelData.drugInteractions?.slice(0, 10) || null
            })
            .eq('id', drug.id);

          if (updateError) {
            addLog(`${drug.genericName}: DB update failed - ${updateError.message}`, 'error');
          } else {
            addLog(`${drug.genericName}: Label data saved`, 'success');
            processed++;
          }
        } else {
          addLog(`${drug.genericName}: No label data found`, 'warning');
        }

        setFdaStats(prev => ({ ...prev, labelsChecked: prev.labelsChecked + 1 }));
        await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit
      } catch (err: any) {
        addLog(`${drug.genericName}: ${err.message}`, 'error');
      }
    }

    addLog(`Completed: Updated ${processed} drugs with FDA label data`, 'success');
    setIsSeeding(false);
  };

  // FDA Recall checking
  const checkFDARecalls = async () => {
    setIsSeeding(true);
    addLog('Checking FDA recall status...', 'info');

    let recallsFound = 0;

    for (const drug of drugs) {
      try {
        // Get manufacturers for this drug
        const { data: variants } = await supabase
          .from('rx_variants')
          .select('id, manufacturer')
          .eq('rx_med_id', drug.id);

        const manufacturers = variants?.map(v => v.manufacturer).filter(Boolean) || [];

        const { data, error } = await supabase.functions.invoke('check-fda-recalls', {
          body: { genericName: drug.genericName, manufacturers }
        });

        if (error) throw error;

        if (data.totalRecalls > 0) {
          addLog(`${drug.genericName}: ${data.totalRecalls} recalls found!`, 'warning');
          recallsFound += data.totalRecalls;

          // Update variants with recall info
          for (const status of data.manufacturerStatuses || []) {
            if (status.hasActiveRecall && status.recalls.length > 0) {
              const variant = variants?.find(v => 
                v.manufacturer?.toLowerCase().includes(status.labelerName.toLowerCase().split(' ')[0])
              );
              if (variant) {
                await supabase
                  .from('rx_variants')
                  .update({
                    has_active_recall: true,
                    recall_info: status.recalls
                  })
                  .eq('id', variant.id);
              }
            }
          }
        } else {
          addLog(`${drug.genericName}: No recalls`, 'info');
        }

        setFdaStats(prev => ({ ...prev, recallsChecked: prev.recallsChecked + 1 }));
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (err: any) {
        addLog(`${drug.genericName}: ${err.message}`, 'error');
      }
    }

    setFdaStats(prev => ({ ...prev, recallsFound }));
    addLog(`Completed: Found ${recallsFound} total recalls`, recallsFound > 0 ? 'warning' : 'success');
    setIsSeeding(false);
  };

  // RxNorm linking
  const fetchRxNormData = async () => {
    setIsSeeding(true);
    addLog('Fetching RxNorm identifiers...', 'info');

    let linked = 0;

    for (const drug of drugs) {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-rxnorm', {
          body: { genericName: drug.genericName }
        });

        if (error) throw error;

        if (data.rxcui) {
          // Update all variants for this drug with the RxCUI
          const { error: updateError } = await supabase
            .from('rx_variants')
            .update({ rxcui: data.rxcui })
            .eq('rx_med_id', drug.id);

          if (!updateError) {
            addLog(`${drug.genericName}: RxCUI ${data.rxcui}`, 'success');
            linked++;
          }
        } else {
          addLog(`${drug.genericName}: No RxNorm match`, 'warning');
        }

        setFdaStats(prev => ({ ...prev, rxnormLinked: linked }));
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err: any) {
        addLog(`${drug.genericName}: ${err.message}`, 'error');
      }
    }

    addLog(`Completed: Linked ${linked} drugs to RxNorm`, 'success');
    setIsSeeding(false);
  };

  const fetchDrugList = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-manufacturers', {
        body: { action: 'list' }
      });

      if (error) throw error;
      setDrugs(data.drugs || []);
      addLog(`Loaded ${data.drugs?.length || 0} drugs`, 'success');
    } catch (err: any) {
      addLog(`Error loading drugs: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const seedSingleDrug = async (drugId: string, drugName: string) => {
    setCurrentDrug(drugName);
    addLog(`Seeding ${drugName}...`, 'info');

    try {
      const { data, error } = await supabase.functions.invoke('seed-manufacturers', {
        body: { action: 'seed-one', drugId, includeIngredients }
      });

      if (error) throw error;

      if (data.error) {
        addLog(`${drugName}: ${data.error}`, 'error');
        setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
      } else {
        const ingMsg = data.ingredientsLinked > 0 ? `, ${data.ingredientsLinked} ingredients` : '';
        addLog(`${drugName}: Added ${data.manufacturersAdded} manufacturers${ingMsg}`, 'success');
        setStats(prev => ({ 
          ...prev, 
          processed: prev.processed + 1,
          added: prev.added + data.manufacturersAdded,
          ingredients: prev.ingredients + (data.ingredientsLinked || 0)
        }));
      }
    } catch (err: any) {
      addLog(`${drugName}: ${err.message}`, 'error');
      setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
    }
  };

  const startSeeding = async () => {
    setIsSeeding(true);
    setIsPaused(false);
    setStats({ processed: 0, added: 0, ingredients: 0, errors: 0 });
    setLogs([]);
    addLog('Starting seeding process...', 'info');

    const drugsToSeed = drugs.filter(d => d.fdaVariants === 0);
    addLog(`Found ${drugsToSeed.length} drugs to seed`, 'info');

    for (let i = 0; i < drugsToSeed.length; i++) {
      if (isPaused) {
        addLog('Seeding paused', 'info');
        break;
      }

      const drug = drugsToSeed[i];
      setProgress(((i + 1) / drugsToSeed.length) * 100);
      
      await seedSingleDrug(drug.id, drug.genericName);
      
      // Add delay between drugs
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsSeeding(false);
    setCurrentDrug(null);
    addLog('Seeding complete!', 'success');
    fetchDrugList(); // Refresh the list
  };

  const pauseSeeding = () => {
    setIsPaused(true);
    setIsSeeding(false);
  };

  const seedByBatch = async () => {
    setIsSeeding(true);
    addLog('Starting batch seeding...', 'info');

    try {
      const { data, error } = await supabase.functions.invoke('seed-manufacturers', {
        body: { action: 'seed-batch', batchSize: 10, offset: stats.processed, includeIngredients }
      });

      if (error) throw error;

      if (data.completed) {
        addLog('All drugs have been seeded!', 'success');
      } else {
        const results = data.results as SeedResult[];
        results.forEach(r => {
          if (r.error) {
            addLog(`${r.drugName}: ${r.error}`, 'error');
          } else {
            const ingMsg = r.ingredientsLinked > 0 ? `, ${r.ingredientsLinked} ingredients` : '';
            addLog(`${r.drugName}: Added ${r.manufacturersAdded} manufacturers${ingMsg}`, 'success');
          }
        });
        
        setStats(prev => ({
          processed: prev.processed + data.processed,
          added: prev.added + results.reduce((sum, r) => sum + r.manufacturersAdded, 0),
          ingredients: prev.ingredients + results.reduce((sum, r) => sum + (r.ingredientsLinked || 0), 0),
          errors: prev.errors + results.filter(r => r.error).length
        }));
      }

      fetchDrugList();
    } catch (err: any) {
      addLog(`Batch error: ${err.message}`, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const fetchMissingIngredients = async () => {
    setIsSeeding(true);
    addLog('Fetching ingredients for variants missing SPL data...', 'info');

    try {
      const { data, error } = await supabase.functions.invoke('seed-manufacturers', {
        body: { action: 'fetch-ingredients', batchSize: 20 }
      });

      if (error) throw error;

      data.results?.forEach((r: any) => {
        if (r.error) {
          addLog(`${r.manufacturer}: ${r.error}`, 'error');
        } else if (r.ingredientsLinked > 0) {
          addLog(`${r.manufacturer}: Linked ${r.ingredientsLinked} ingredients`, 'success');
        }
      });

      const totalLinked = data.results?.reduce((sum: number, r: any) => sum + (r.ingredientsLinked || 0), 0) || 0;
      setStats(prev => ({ ...prev, ingredients: prev.ingredients + totalLinked }));
      
      addLog(`Processed ${data.processed} variants, linked ${totalLinked} ingredients`, 'success');
      fetchDrugList();
    } catch (err: any) {
      addLog(`Error: ${err.message}`, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const needsSeeding = drugs.filter(d => d.fdaVariants === 0).length;
  const alreadySeeded = drugs.filter(d => d.fdaVariants > 0).length;
  const withIngredients = drugs.filter(d => d.withIngredients > 0).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/browse">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Seed Manufacturer Data</h1>
            <p className="text-muted-foreground">
              Fetch top 10 manufacturers for each drug from FDA/openFDA
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Drugs</CardDescription>
              <CardTitle className="text-3xl">{drugs.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Needs Seeding</CardDescription>
              <CardTitle className="text-3xl text-amber-500">{needsSeeding}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Already Seeded</CardDescription>
              <CardTitle className="text-3xl text-green-500">{alreadySeeded}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>With Ingredients</CardDescription>
              <CardTitle className="text-3xl text-blue-500">{withIngredients}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ingredients Linked</CardDescription>
              <CardTitle className="text-3xl text-primary">{stats.ingredients}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Controls with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>FDA Data Sources</CardTitle>
            <CardDescription>
              Fetch and enrich drug data from multiple FDA sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
                <TabsTrigger value="labels">Drug Labels</TabsTrigger>
                <TabsTrigger value="recalls">Recalls</TabsTrigger>
                <TabsTrigger value="rxnorm">RxNorm</TabsTrigger>
              </TabsList>

              {/* Manufacturers Tab */}
              <TabsContent value="manufacturers" className="space-y-4 mt-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-ingredients"
                      checked={includeIngredients}
                      onCheckedChange={setIncludeIngredients}
                    />
                    <Label htmlFor="include-ingredients" className="flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      Fetch inactive ingredients from DailyMed
                    </Label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={fetchDrugList} disabled={isLoading || isSeeding}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Load Drug List
                  </Button>

                  {drugs.length > 0 && (
                    <>
                      {!isSeeding ? (
                        <Button onClick={startSeeding} variant="default">
                          <Play className="h-4 w-4 mr-2" />
                          Start Seeding All
                        </Button>
                      ) : (
                        <Button onClick={pauseSeeding} variant="destructive">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}

                      <Button onClick={seedByBatch} disabled={isSeeding} variant="outline">
                        Seed Next Batch (10)
                      </Button>

                      <Button onClick={fetchMissingIngredients} disabled={isSeeding} variant="secondary">
                        <Pill className="h-4 w-4 mr-2" />
                        Fetch Missing Ingredients
                      </Button>
                    </>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  Fetches top 10 manufacturers per drug from openFDA NDC endpoint + inactive ingredients from DailyMed SPL.
                </p>
              </TabsContent>

              {/* Drug Labels Tab */}
              <TabsContent value="labels" className="space-y-4 mt-4">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={fetchDrugList} disabled={isLoading || isSeeding}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Load Drug List
                  </Button>

                  {drugs.length > 0 && (
                    <Button onClick={fetchFDALabels} disabled={isSeeding}>
                      {isSeeding ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Fetch FDA Labels
                    </Button>
                  )}
                </div>

                <div className="flex gap-4 text-sm">
                  <Badge variant="outline">
                    Labels Checked: {fdaStats.labelsChecked}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  Fetches warnings, indications, contraindications, and drug interactions from openFDA Drug Label API.
                </p>
              </TabsContent>

              {/* Recalls Tab */}
              <TabsContent value="recalls" className="space-y-4 mt-4">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={fetchDrugList} disabled={isLoading || isSeeding}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Load Drug List
                  </Button>

                  {drugs.length > 0 && (
                    <Button onClick={checkFDARecalls} disabled={isSeeding} variant="destructive">
                      {isSeeding ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 mr-2" />
                      )}
                      Check FDA Recalls
                    </Button>
                  )}
                </div>

                <div className="flex gap-4 text-sm">
                  <Badge variant="outline">
                    Drugs Checked: {fdaStats.recallsChecked}
                  </Badge>
                  {fdaStats.recallsFound > 0 && (
                    <Badge variant="destructive">
                      Recalls Found: {fdaStats.recallsFound}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  Checks openFDA Enforcement (Recalls) API for any active or historical drug recalls by manufacturer.
                </p>
              </TabsContent>

              {/* RxNorm Tab */}
              <TabsContent value="rxnorm" className="space-y-4 mt-4">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={fetchDrugList} disabled={isLoading || isSeeding}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Load Drug List
                  </Button>

                  {drugs.length > 0 && (
                    <Button onClick={fetchRxNormData} disabled={isSeeding}>
                      {isSeeding ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Link2 className="h-4 w-4 mr-2" />
                      )}
                      Fetch RxNorm IDs
                    </Button>
                  )}
                </div>

                <div className="flex gap-4 text-sm">
                  <Badge variant="outline">
                    RxCUI Linked: {fdaStats.rxnormLinked}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  Links drugs to RxNorm (RxCUI) identifiers from NIH RxNav API for interoperability with other systems.
                </p>
              </TabsContent>
            </Tabs>

            {isSeeding && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Progress: {stats.processed} / {needsSeeding}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                {currentDrug && (
                  <p className="text-sm text-muted-foreground">
                    Currently processing: {currentDrug}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Activity Log</span>
              <div className="flex gap-2 text-sm font-normal">
                <Badge variant="secondary">{stats.processed} processed</Badge>
                <Badge variant="default">{stats.added} added</Badge>
                <Badge variant="destructive">{stats.errors} errors</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 rounded border p-3">
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No activity yet. Click "Load Drug List" to start.
                </p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      {log.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                      {log.type === 'error' && <XCircle className="h-4 w-4 text-red-500 mt-0.5" />}
                      {log.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />}
                      {log.type === 'info' && <div className="h-4 w-4 mt-0.5" />}
                      <span className="text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <span className={
                        log.type === 'error' ? 'text-red-500' : 
                        log.type === 'warning' ? 'text-amber-500' : ''
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Drug List */}
        {drugs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Drug List</CardTitle>
              <CardDescription>
                Click on a drug to seed it individually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="grid gap-2">
                  {drugs.map(drug => (
                    <div
                      key={drug.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
                      onClick={() => !isSeeding && seedSingleDrug(drug.id, drug.genericName)}
                    >
                      <div>
                        <span className="font-medium">{drug.genericName}</span>
                        <span className="text-muted-foreground ml-2 text-sm">
                          {drug.totalVariants} variants
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {drug.fdaVariants > 0 ? (
                          <Badge variant="default">
                            {drug.fdaVariants} FDA
                          </Badge>
                        ) : (
                          <Badge variant="outline">Needs seeding</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
