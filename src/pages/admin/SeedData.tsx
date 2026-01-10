import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Play, Pause, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DrugSummary {
  id: string;
  genericName: string;
  totalVariants: number;
  fdaVariants: number;
  manualVariants: number;
}

interface SeedResult {
  drugName: string;
  manufacturersAdded: number;
  error?: string;
}

interface LogEntry {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error';
}

export default function SeedData() {
  const [drugs, setDrugs] = useState<DrugSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentDrug, setCurrentDrug] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({ processed: 0, added: 0, errors: 0 });

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { timestamp: new Date(), message, type }]);
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
        body: { action: 'seed-one', drugId }
      });

      if (error) throw error;

      if (data.error) {
        addLog(`${drugName}: ${data.error}`, 'error');
        setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
      } else {
        addLog(`${drugName}: Added ${data.manufacturersAdded} manufacturers`, 'success');
        setStats(prev => ({ 
          ...prev, 
          processed: prev.processed + 1,
          added: prev.added + data.manufacturersAdded 
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
    setStats({ processed: 0, added: 0, errors: 0 });
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
        body: { action: 'seed-batch', batchSize: 10, offset: stats.processed }
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
            addLog(`${r.drugName}: Added ${r.manufacturersAdded} manufacturers`, 'success');
          }
        });
        
        setStats(prev => ({
          processed: prev.processed + data.processed,
          added: prev.added + results.reduce((sum, r) => sum + r.manufacturersAdded, 0),
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

  const needsSeeding = drugs.filter(d => d.fdaVariants === 0).length;
  const alreadySeeded = drugs.filter(d => d.fdaVariants > 0).length;

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <CardDescription>Manufacturers Added</CardDescription>
              <CardTitle className="text-3xl text-primary">{stats.added}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Seeding Controls</CardTitle>
            <CardDescription>
              Fetch manufacturer data from openFDA for all drugs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                </>
              )}
            </div>

            {isSeeding && (
              <div className="space-y-2">
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
                      {log.type === 'info' && <div className="h-4 w-4 mt-0.5" />}
                      <span className="text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <span className={log.type === 'error' ? 'text-red-500' : ''}>
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
