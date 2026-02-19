import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import {
  Search, Filter, Image, RefreshCw, ChevronDown,
  ExternalLink, User, UserX, Loader2, AlertCircle,
  CheckCircle2, Clock, Microscope, CheckCheck,
  Inbox, FileImage, StickyNote, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type ReviewStatus = 'new' | 'triaged' | 'researching' | 'resolved';

interface ReviewRequest {
  id: string;
  created_at: string;
  user_id: string | null;
  is_anonymous: boolean | null;
  drug_name: string | null;
  brand_or_manufacturer: string | null;
  ndc_number: string | null;
  upc_number: string | null;
  notes_text: string | null;
  barcode_image_path: string | null;
  ingredients_image_path: string | null;
  source_page: string | null;
  status: ReviewStatus;
  admin_notes: string | null;
  resolved_summary: string | null;
  final_manufacturer: string | null;
  final_ndc: string | null;
  resolution_links: string[] | null;
  // legacy field
  query_text: string | null;
  message: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS: { key: ReviewStatus; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'new', label: 'New', icon: Inbox, color: 'text-blue-500' },
  { key: 'triaged', label: 'Triaged', icon: CheckCircle2, color: 'text-amber-500' },
  { key: 'researching', label: 'Researching', icon: Microscope, color: 'text-purple-500' },
  { key: 'resolved', label: 'Resolved', icon: CheckCheck, color: 'text-green-500' },
];

const DATE_RANGES = [
  { label: 'All time', value: 'all' },
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 90 days', value: '90' },
];

const STORAGE_BASE = `https://lffoswusesrukltvitfq.supabase.co/storage/v1/object/public/review-uploads/`;

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  // If the bucket is private, we need signed URLs. We'll use the path directly via admin.
  return STORAGE_BASE + path;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, { label: string; className: string }> = {
    new: { label: 'New', className: 'bg-primary/10 text-primary' },
    triaged: { label: 'Triaged', className: 'bg-secondary text-secondary-foreground' },
    researching: { label: 'Researching', className: 'bg-accent text-accent-foreground' },
    resolved: { label: 'Resolved', className: 'bg-muted text-muted-foreground font-medium' },
  };
  const cfg = map[status] || map.new;
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', cfg.className)}>
      {cfg.label}
    </span>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function RequestCard({
  req,
  selected,
  onSelect,
  onStatusChange,
  onOpen,
}: {
  req: ReviewRequest;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onStatusChange: (id: string, status: ReviewStatus) => void;
  onOpen: (req: ReviewRequest) => void;
}) {
  const drugName = req.drug_name || req.query_text || '(Not provided)';
  const timeAgo = formatDistanceToNow(new Date(req.created_at), { addSuffix: true });
  const exactDate = format(new Date(req.created_at), 'MMM d, yyyy HH:mm');
  const hasBarcode = !!req.barcode_image_path;
  const hasIngredients = !!req.ingredients_image_path;
  const isAnon = req.is_anonymous ?? !req.user_id;

  return (
    <Card
      className={cn(
        'p-3 cursor-pointer hover:shadow-md transition-all border group',
        selected && 'ring-2 ring-primary'
      )}
      onClick={() => onOpen(req)}
    >
      <div className="flex items-start gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onSelect(req.id, v === true)}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{drugName}</p>
          {req.brand_or_manufacturer && (
            <p className="text-xs text-muted-foreground truncate">{req.brand_or_manufacturer}</p>
          )}
        </div>
      </div>

      {(req.ndc_number || req.upc_number) && (
        <p className="text-xs text-muted-foreground mb-2 ml-6">
          {req.ndc_number && <span>NDC: {req.ndc_number}</span>}
          {req.ndc_number && req.upc_number && <span className="mx-1">·</span>}
          {req.upc_number && <span>UPC: {req.upc_number}</span>}
        </p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap ml-6">
        <span title={exactDate} className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </span>
        {isAnon ? (
          <Badge variant="outline" className="text-xs gap-1 py-0">
            <UserX className="h-2.5 w-2.5" />
            Anon
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs gap-1 py-0">
            <User className="h-2.5 w-2.5" />
            User
          </Badge>
        )}
        {hasBarcode && (
          <Badge variant="secondary" className="text-xs gap-1 py-0">
            <FileImage className="h-2.5 w-2.5" />
            Barcode
          </Badge>
        )}
        {hasIngredients && (
          <Badge variant="secondary" className="text-xs gap-1 py-0">
            <Image className="h-2.5 w-2.5" />
            Ingredients
          </Badge>
        )}
      </div>

      {/* Quick status change — stops propagation so it doesn't open drawer */}
      <div className="mt-2 ml-6" onClick={(e) => e.stopPropagation()}>
        <Select value={req.status} onValueChange={(v) => onStatusChange(req.id, v as ReviewStatus)}>
          <SelectTrigger className="h-6 text-xs px-2 py-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLUMNS.map((c) => (
              <SelectItem key={c.key} value={c.key} className="text-xs">
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({
  req,
  open,
  onClose,
  onStatusChange,
  onSaveNotes,
}: {
  req: ReviewRequest | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: ReviewStatus) => void;
  onSaveNotes: (id: string, updates: Partial<ReviewRequest>) => Promise<void>;
}) {
  const [adminNotes, setAdminNotes] = useState('');
  const [resolvedSummary, setResolvedSummary] = useState('');
  const [finalManufacturer, setFinalManufacturer] = useState('');
  const [finalNdc, setFinalNdc] = useState('');
  const [resolutionLinks, setResolutionLinks] = useState('');
  const [saving, setSaving] = useState(false);
  const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null);
  const [ingredientsUrl, setIngredientsUrl] = useState<string | null>(null);

  useEffect(() => {
    if (req) {
      setAdminNotes(req.admin_notes || '');
      setResolvedSummary(req.resolved_summary || '');
      setFinalManufacturer(req.final_manufacturer || '');
      setFinalNdc(req.final_ndc || '');
      setResolutionLinks((req.resolution_links || []).join('\n'));

      // Get signed URLs for private bucket images
      const loadImages = async () => {
        if (req.barcode_image_path) {
          const { data } = await supabase.storage
            .from('review-uploads')
            .createSignedUrl(req.barcode_image_path, 3600);
          setBarcodeUrl(data?.signedUrl || null);
        } else {
          setBarcodeUrl(null);
        }
        if (req.ingredients_image_path) {
          const { data } = await supabase.storage
            .from('review-uploads')
            .createSignedUrl(req.ingredients_image_path, 3600);
          setIngredientsUrl(data?.signedUrl || null);
        } else {
          setIngredientsUrl(null);
        }
      };
      loadImages();
    }
  }, [req]);

  if (!req) return null;

  const drugName = req.drug_name || req.query_text || '(Not provided)';

  const handleSave = async () => {
    setSaving(true);
    await onSaveNotes(req.id, {
      admin_notes: adminNotes || null,
      resolved_summary: resolvedSummary || null,
      final_manufacturer: finalManufacturer || null,
      final_ndc: finalNdc || null,
      resolution_links: resolutionLinks
        ? resolutionLinks.split('\n').map((l) => l.trim()).filter(Boolean)
        : null,
    });
    setSaving(false);
    toast.success('Notes saved');
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold truncate pr-4">{drugName}</SheetTitle>
            <StatusPill status={req.status} />
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Submitted {format(new Date(req.created_at), 'MMM d, yyyy \'at\' HH:mm')}
            {(req.is_anonymous ?? !req.user_id) ? ' · Anonymous' : ' · Registered user'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5">
          {/* Status */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">Status</Label>
            <Select value={req.status} onValueChange={(v) => onStatusChange(req.id, v as ReviewStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMNS.map((c) => (
                  <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Identifiers */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground block">Product Information</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground mb-0.5">Drug name</p>
                <p className="font-medium">{req.drug_name || '—'}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground mb-0.5">Brand / Labeler</p>
                <p className="font-medium">{req.brand_or_manufacturer || '—'}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground mb-0.5">NDC</p>
                <p className="font-medium">{req.ndc_number || '—'}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground mb-0.5">UPC</p>
                <p className="font-medium">{req.upc_number || '—'}</p>
              </div>
            </div>
          </div>

          {/* Notes from user */}
          {(req.notes_text || req.message) && (
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">User Notes</Label>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                {req.notes_text || req.message}
              </div>
            </div>
          )}

          {/* Source page */}
          {req.source_page && (
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">Source Page</Label>
              <a
                href={req.source_page}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                {req.source_page}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Images */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">Uploaded Images</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Barcode / Front Label</p>
                {barcodeUrl ? (
                  <a href={barcodeUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={barcodeUrl}
                      alt="Barcode"
                      className="w-full rounded-lg border object-cover aspect-square hover:opacity-90 transition-opacity"
                    />
                  </a>
                ) : (
                  <div className="w-full rounded-lg border bg-muted/30 aspect-square flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ingredients Panel</p>
                {ingredientsUrl ? (
                  <a href={ingredientsUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={ingredientsUrl}
                      alt="Ingredients"
                      className="w-full rounded-lg border object-cover aspect-square hover:opacity-90 transition-opacity"
                    />
                  </a>
                ) : (
                  <div className="w-full rounded-lg border bg-muted/30 aspect-square flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">
              Internal Admin Notes
            </Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal research notes, links, observations…"
              rows={3}
            />
          </div>

          {/* Resolution fields — visible when resolved */}
          {req.status === 'resolved' && (
            <div className="space-y-3 p-3 rounded-lg border bg-muted/40">
              <p className="text-xs font-medium text-foreground uppercase tracking-wide">Resolution Details</p>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Resolution Summary</Label>
                  <Textarea
                    value={resolvedSummary}
                    onChange={(e) => setResolvedSummary(e.target.value)}
                    placeholder="What was found and resolved…"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Final Manufacturer</Label>
                    <Input
                      value={finalManufacturer}
                      onChange={(e) => setFinalManufacturer(e.target.value)}
                      placeholder="Manufacturer name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Final NDC</Label>
                    <Input
                      value={finalNdc}
                      onChange={(e) => setFinalNdc(e.target.value)}
                      placeholder="NDC confirmed"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Resolution Links (one per line)</Label>
                  <Textarea
                    value={resolutionLinks}
                    onChange={(e) => setResolutionLinks(e.target.value)}
                    placeholder="https://dailymed.nlm.nih.gov/…"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <StickyNote className="h-4 w-4 mr-2" />}
            Save Notes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

function KanbanColumn({
  col,
  requests,
  selectedIds,
  onSelect,
  onStatusChange,
  onOpen,
}: {
  col: typeof COLUMNS[0];
  requests: ReviewRequest[];
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onStatusChange: (id: string, status: ReviewStatus) => void;
  onOpen: (req: ReviewRequest) => void;
}) {
  const Icon = col.icon;
  return (
    <div className="flex flex-col bg-muted/40 rounded-xl min-h-[300px]">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
        <Icon className={cn('h-4 w-4', col.color)} />
        <span className="font-medium text-sm">{col.label}</span>
        <Badge variant="secondary" className="ml-auto text-xs">{requests.length}</Badge>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
        {requests.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No requests in this stage.
          </div>
        ) : (
          requests.map((req) => (
            <RequestCard
              key={req.id}
              req={req}
              selected={selectedIds.has(req.id)}
              onSelect={onSelect}
              onStatusChange={onStatusChange}
              onOpen={onOpen}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReviewRequestsAdmin() {
  const { isAdmin, rolesLoading } = useAuth();

  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewStatus>('all');
  const [dateRange, setDateRange] = useState('all');
  const [anonOnly, setAnonOnly] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openedReq, setOpenedReq] = useState<ReviewRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase.from('review_requests') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (dateRange !== 'all') {
        const cutoff = subDays(new Date(), parseInt(dateRange)).toISOString();
        query = query.gte('created_at', cutoff);
      }
      if (anonOnly) {
        query = query.eq('is_anonymous', true);
      }
      // Search server-side
      if (search.trim()) {
        const s = `%${search.trim()}%`;
        query = query.or(
          `drug_name.ilike.${s},brand_or_manufacturer.ilike.${s},ndc_number.ilike.${s},upc_number.ilike.${s},notes_text.ilike.${s},query_text.ilike.${s}`
        );
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setRequests((data as ReviewRequest[]) || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load review requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, dateRange, anonOnly]);

  useEffect(() => {
    if (!rolesLoading && isAdmin) {
      fetchRequests();
    }
  }, [fetchRequests, isAdmin, rolesLoading]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Status update ──────────────────────────────────────────────────────────

  const handleStatusChange = useCallback(async (id: string, status: ReviewStatus) => {
    // Optimistic update
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    if (openedReq?.id === id) setOpenedReq((prev) => prev ? { ...prev, status } : prev);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('review_requests') as any)
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
      fetchRequests(); // revert
    } else {
      toast.success(`Moved to ${status}`);
    }
  }, [openedReq, fetchRequests]);

  // ── Save notes ─────────────────────────────────────────────────────────────

  const handleSaveNotes = useCallback(async (id: string, updates: Partial<ReviewRequest>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('review_requests') as any)
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to save notes');
      return;
    }
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    if (openedReq?.id === id) setOpenedReq((prev) => prev ? { ...prev, ...updates } : prev);
  }, [openedReq]);

  // ── Bulk actions ───────────────────────────────────────────────────────────

  const handleBulkStatus = async (status: ReviewStatus) => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    // Optimistic
    setRequests((prev) => prev.map((r) => selectedIds.has(r.id) ? { ...r, status } : r));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('review_requests') as any)
      .update({ status })
      .in('id', ids);
    if (error) {
      toast.error('Bulk update failed');
      fetchRequests();
    } else {
      toast.success(`${ids.length} request${ids.length > 1 ? 's' : ''} moved to ${status}`);
      setSelectedIds(new Set());
    }
  };

  // ── Select helpers ─────────────────────────────────────────────────────────

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // ── Filter for display ─────────────────────────────────────────────────────

  const filtered = statusFilter === 'all'
    ? requests
    : requests.filter((r) => r.status === statusFilter);

  const byStatus = (status: ReviewStatus) =>
    filtered.filter((r) => r.status === status);

  // ── Access guard ───────────────────────────────────────────────────────────

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="font-medium">Access denied</p>
        <p className="text-sm text-muted-foreground">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Review Requests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Operational queue for research and formulation updates.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchRequests}
          disabled={loading}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search drug name, brand, NDC, UPC, notes…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => { setSearchInput(''); setSearch(''); }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-36">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {COLUMNS.map((c) => (
              <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range */}
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Anon only */}
        <label className="flex items-center gap-2 cursor-pointer text-sm whitespace-nowrap self-center">
          <Checkbox checked={anonOnly} onCheckedChange={(v) => setAnonOnly(v === true)} />
          Anonymous only
        </label>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="flex gap-1.5 ml-2">
            {(['triaged', 'researching', 'resolved'] as ReviewStatus[]).map((s) => (
              <Button key={s} size="sm" variant="outline" onClick={() => handleBulkStatus(s)} className="h-7 text-xs">
                → {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs ml-auto"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <Button size="sm" variant="outline" className="ml-auto h-7 text-xs" onClick={fetchRequests}>
            Retry
          </Button>
        </div>
      )}

      {/* Kanban Board */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((c) => (
            <div key={c.key} className="bg-muted/40 rounded-xl p-3 space-y-2">
              <Skeleton className="h-6 w-24" />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.key}
              col={col}
              requests={byStatus(col.key)}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onStatusChange={handleStatusChange}
              onOpen={(req) => { setOpenedReq(req); setDrawerOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} request{filtered.length !== 1 ? 's' : ''} shown
          {search && ` matching "${search}"`}
          {statusFilter !== 'all' && ` · filtered to ${statusFilter}`}
        </p>
      )}

      {/* Detail Drawer */}
      <DetailDrawer
        req={openedReq}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onStatusChange={handleStatusChange}
        onSaveNotes={handleSaveNotes}
      />
    </div>
  );
}
