import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Loader2, Edit, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type HalalStatus = 'halal' | 'haram' | 'mushbooh' | 'needs_verification';

interface Verdict {
  id: string;
  status: HalalStatus;
  confidence_score: number | null;
  summary_reason: string | null;
  clinical_breakdown: string | null;
  pharmacist_note: string | null;
  halal_alternatives: string[] | null;
  updated_at: string;
  // Joined data
  medication_name?: string;
  product_name?: string;
}

interface RxVerdict extends Verdict {
  variant_id: string;
}

interface OtcVerdict extends Verdict {
  otc_product_id: string;
}

const statusColors: Record<HalalStatus, string> = {
  halal: 'bg-green-500',
  haram: 'bg-red-500',
  mushbooh: 'bg-amber-500',
  needs_verification: 'bg-gray-500',
};

export default function VerdictManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'rx' | 'otc'>('rx');
  const [rxVerdicts, setRxVerdicts] = useState<RxVerdict[]>([]);
  const [otcVerdicts, setOtcVerdicts] = useState<OtcVerdict[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingVerdict, setEditingVerdict] = useState<Verdict | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVerdicts();
  }, []);

  async function fetchVerdicts() {
    setLoading(true);
    try {
      // Fetch RX verdicts with medication names
      const { data: rxData } = await supabase
        .from('rx_verdicts')
        .select(`
          *,
          rx_variants!inner(
            rx_meds!inner(name)
          )
        `)
        .order('updated_at', { ascending: false })
        .limit(100);

      // Fetch OTC verdicts with product names
      const { data: otcData } = await supabase
        .from('otc_verdicts')
        .select(`
          *,
          otc_products!inner(name)
        `)
        .order('updated_at', { ascending: false })
        .limit(100);

      setRxVerdicts(
        (rxData || []).map((v: any) => ({
          ...v,
          medication_name: v.rx_variants?.rx_meds?.name || 'Unknown',
        }))
      );

      setOtcVerdicts(
        (otcData || []).map((v: any) => ({
          ...v,
          product_name: v.otc_products?.name || 'Unknown',
        }))
      );
    } catch (error) {
      console.error('Error fetching verdicts:', error);
      toast.error('Failed to load verdicts');
    } finally {
      setLoading(false);
    }
  }

  async function saveVerdict() {
    if (!editingVerdict || !user) return;

    setSaving(true);
    try {
      const table = activeTab === 'rx' ? 'rx_verdicts' : 'otc_verdicts';
      const { error } = await supabase
        .from(table)
        .update({
          status: editingVerdict.status,
          confidence_score: editingVerdict.confidence_score,
          summary_reason: editingVerdict.summary_reason,
          clinical_breakdown: editingVerdict.clinical_breakdown,
          pharmacist_note: editingVerdict.pharmacist_note,
          halal_alternatives: editingVerdict.halal_alternatives,
          updated_by: user.id,
        })
        .eq('id', editingVerdict.id);

      if (error) throw error;

      toast.success('Verdict updated successfully');
      setEditingVerdict(null);
      fetchVerdicts();
    } catch (error) {
      console.error('Error saving verdict:', error);
      toast.error('Failed to save verdict');
    } finally {
      setSaving(false);
    }
  }

  const filteredRxVerdicts = rxVerdicts.filter((v) => {
    const matchesSearch = v.medication_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter as HalalStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredOtcVerdicts = otcVerdicts.filter((v) => {
    const matchesSearch = v.product_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter as HalalStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verdict Management</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage halal status verdicts for medications and products
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="halal">Halal</SelectItem>
            <SelectItem value="haram">Haram</SelectItem>
            <SelectItem value="mushbooh">Mushbooh</SelectItem>
            <SelectItem value="needs_verification">Needs Verification</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'rx' | 'otc')}>
        <TabsList>
          <TabsTrigger value="rx">Prescription (Rx)</TabsTrigger>
          <TabsTrigger value="otc">Over-the-Counter</TabsTrigger>
        </TabsList>

        <TabsContent value="rx" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRxVerdicts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No verdicts found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredRxVerdicts.map((verdict) => (
                <Card key={verdict.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <Badge className={statusColors[verdict.status]}>
                        {verdict.status.replace('_', ' ')}
                      </Badge>
                      <span className="font-medium">{verdict.medication_name}</span>
                      {verdict.confidence_score && (
                        <span className="text-sm text-muted-foreground">
                          {verdict.confidence_score}% confidence
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingVerdict(verdict)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="otc" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOtcVerdicts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No verdicts found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredOtcVerdicts.map((verdict) => (
                <Card key={verdict.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <Badge className={statusColors[verdict.status]}>
                        {verdict.status.replace('_', ' ')}
                      </Badge>
                      <span className="font-medium">{verdict.product_name}</span>
                      {verdict.confidence_score && (
                        <span className="text-sm text-muted-foreground">
                          {verdict.confidence_score}% confidence
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingVerdict(verdict)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingVerdict} onOpenChange={() => setEditingVerdict(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Verdict</DialogTitle>
            <DialogDescription>
              Update the halal status and details for this {activeTab === 'rx' ? 'medication' : 'product'}
            </DialogDescription>
          </DialogHeader>

          {editingVerdict && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editingVerdict.status}
                  onValueChange={(v) =>
                    setEditingVerdict({ ...editingVerdict, status: v as HalalStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="halal">Halal</SelectItem>
                    <SelectItem value="haram">Haram</SelectItem>
                    <SelectItem value="mushbooh">Mushbooh</SelectItem>
                    <SelectItem value="needs_verification">Needs Verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Confidence Score: {editingVerdict.confidence_score || 0}%</Label>
                <Slider
                  value={[editingVerdict.confidence_score || 0]}
                  onValueChange={([v]) =>
                    setEditingVerdict({ ...editingVerdict, confidence_score: v })
                  }
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Summary Reason</Label>
                <Textarea
                  value={editingVerdict.summary_reason || ''}
                  onChange={(e) =>
                    setEditingVerdict({ ...editingVerdict, summary_reason: e.target.value })
                  }
                  placeholder="Brief explanation of the verdict..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Clinical Breakdown</Label>
                <Textarea
                  value={editingVerdict.clinical_breakdown || ''}
                  onChange={(e) =>
                    setEditingVerdict({ ...editingVerdict, clinical_breakdown: e.target.value })
                  }
                  placeholder="Detailed clinical analysis..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Pharmacist Note</Label>
                <Textarea
                  value={editingVerdict.pharmacist_note || ''}
                  onChange={(e) =>
                    setEditingVerdict({ ...editingVerdict, pharmacist_note: e.target.value })
                  }
                  placeholder="Additional notes from pharmacist review..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Halal Alternatives (one per line)</Label>
                <Textarea
                  value={editingVerdict.halal_alternatives?.join('\n') || ''}
                  onChange={(e) =>
                    setEditingVerdict({
                      ...editingVerdict,
                      halal_alternatives: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  placeholder="Alternative halal medications..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVerdict(null)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={saveVerdict} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
