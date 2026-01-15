import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, CheckCircle, AlertCircle, AlertTriangle, Info, Search } from "lucide-react";
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
  status?: string;
  confidence_level?: string;
  status_reason?: string;
}

export default function HydrateLabelData() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedId, setSelectedMedId] = useState<string>("");
  const [isHydrating, setIsHydrating] = useState(false);
  const [result, setResult] = useState<HydrateResult | null>(null);

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

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      const { data, error } = await supabase.functions.invoke("hydrate-label-data", {
        body: { med_id: selectedMedId },
      });

      if (error) {
        toast.error(`Hydration failed: ${error.message}`);
        return;
      }

      setResult(data as HydrateResult);
      
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

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Result
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
                {result.confidence_level && (
                  <div>
                    <strong>Confidence:</strong>{" "}
                    <Badge variant="outline">{result.confidence_level}</Badge>
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
