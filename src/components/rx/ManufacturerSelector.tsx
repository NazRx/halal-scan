import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Camera, FileQuestion, Info, Bookmark, ArrowUpDown, Check, AlertCircle, X, HelpCircle, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ManufacturerSortMode } from "@/pages/RxMedication";

interface Manufacturer {
  id: string;
  name: string;
  dosageForm?: string;
  strength?: string;
  status?: 'halal' | 'questionable' | 'not-halal' | 'unknown';
  confidence?: number;
}

interface ManufacturerSelectorProps {
  manufacturers: Manufacturer[];
  selectedManufacturer: string | null;
  onSelect: (manufacturerId: string | null) => void;
  onUploadPhoto?: () => void;
  onRequestReview?: () => void;
  className?: string;
  savedVariantIds?: Set<string>;
  sortMode?: ManufacturerSortMode;
  onSortModeChange?: (mode: ManufacturerSortMode) => void;
  hideUnknown?: boolean;
  onHideUnknownChange?: (hide: boolean) => void;
  totalCount?: number;
}

const statusConfig = {
  halal: { icon: Check, color: 'text-muted-foreground', bg: 'bg-muted' },
  questionable: { icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted' },
  'not-halal': { icon: X, color: 'text-muted-foreground', bg: 'bg-muted' },
  unknown: { icon: HelpCircle, color: 'text-muted-foreground', bg: 'bg-muted' },
};

// Map confidence number to disclosure label
function getDisclosureLabel(confidence?: number): { label: string; variant: 'secondary' | 'outline' } {
  if (confidence === undefined || confidence === null) {
    return { label: 'Not disclosed', variant: 'outline' };
  }
  if (confidence >= 80) return { label: 'High disclosure', variant: 'secondary' };
  if (confidence >= 50) return { label: 'Moderate disclosure', variant: 'secondary' };
  if (confidence > 0) return { label: 'Limited disclosure', variant: 'outline' };
  return { label: 'Not disclosed', variant: 'outline' };
}

export function ManufacturerSelector({
  manufacturers,
  selectedManufacturer,
  onSelect,
  onUploadPhoto,
  onRequestReview,
  className,
  savedVariantIds = new Set(),
  sortMode = 'alphabetical',
  onSortModeChange,
  hideUnknown = false,
  onHideUnknownChange,
  totalCount,
}: ManufacturerSelectorProps) {
  const selected = manufacturers.find((m) => m.id === selectedManufacturer);
  const showSortControls = manufacturers.length > 1 && onSortModeChange;
  const hiddenCount = totalCount !== undefined ? totalCount - manufacturers.length : 0;
  const disclosure = getDisclosureLabel(selected?.confidence);

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-muted">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Manufacturer / Formulation</h3>
          <p className="text-sm text-muted-foreground">
            Select the manufacturer from your bottle label for accurate ingredient information.
          </p>
        </div>
      </div>

      {/* Sort & Filter Controls */}
      {showSortControls && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b">
          {/* Sort Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort:</span>
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => onSortModeChange?.('alphabetical')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
                  sortMode === 'alphabetical'
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                )}
              >
                <ArrowUpDown className="h-3 w-3" />
                A–Z
              </button>
              <button
                onClick={() => onSortModeChange?.('disclosure')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
                  sortMode === 'disclosure'
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                )}
              >
                <BarChart2 className="h-3 w-3" />
                Disclosure level
              </button>
            </div>
          </div>

          {/* Hide Unknown Filter */}
          {onHideUnknownChange && (
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={hideUnknown}
                onCheckedChange={(checked) => onHideUnknownChange?.(checked === true)}
              />
              <span className="text-xs text-muted-foreground">Hide unverified</span>
            </label>
          )}
        </div>
      )}

      {/* Sort Indicator */}
      {manufacturers.length > 1 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          {sortMode === 'disclosure' ? (
            <>
              <BarChart2 className="h-3 w-3 text-muted-foreground" />
              <span>Sorted by disclosure level (most transparent first)</span>
            </>
          ) : (
            <>
              <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
              <span>Sorted A–Z</span>
            </>
          )}
          {hiddenCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {hiddenCount} hidden
            </Badge>
          )}
        </div>
      )}

      <Select
        value={selectedManufacturer || "not-specified"}
        onValueChange={(value) => onSelect(value === "not-specified" ? null : value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select manufacturer (if known)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="not-specified">
            <span className="text-muted-foreground">Not specified</span>
          </SelectItem>
          {manufacturers.map((mfr) => {
            const status = mfr.status || 'unknown';
            const config = statusConfig[status];
            const StatusIcon = config.icon;
            const disc = getDisclosureLabel(mfr.confidence);
            
            return (
              <SelectItem key={mfr.id} value={mfr.id}>
                <span className="flex items-center gap-2">
                  {/* Status indicator */}
                  <span className={cn("p-0.5 rounded", config.bg)}>
                    <StatusIcon className={cn("h-3 w-3", config.color)} />
                  </span>
                  
                  {/* Manufacturer name */}
                  <span className="flex-1">{mfr.name}</span>
                  
                  {/* Neutral disclosure badge */}
                  <Badge variant={disc.variant} className="text-xs ml-1 shrink-0">
                    {disc.label}
                  </Badge>
                  
                  {/* Saved indicator */}
                  {savedVariantIds.has(mfr.id) && (
                    <Bookmark className="h-3 w-3 text-primary fill-primary" />
                  )}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Selected manufacturer details */}
      {selected && (
        <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium">{selected.name}</p>
            <Badge variant={disclosure.variant} className="text-xs">
              {disclosure.label}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {selected.dosageForm && `${selected.dosageForm}`}
            {selected.strength && ` • ${selected.strength}`}
          </p>
        </div>
      )}

      {/* Not selected state */}
      {!selectedManufacturer && (
        <div className="mt-3 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p>Showing general information.</p>
            <p>Inactive ingredients may vary by manufacturer.</p>
          </div>
        </div>
      )}

      {/* Unknown manufacturer actions */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-3">
          Don't know your manufacturer?
        </p>
        <div className="flex flex-wrap gap-2">
          {onUploadPhoto && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadPhoto}
              className="gap-2"
            >
              <Camera className="h-4 w-4" />
              Upload bottle photo
            </Button>
          )}
          {onRequestReview && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestReview}
              className="gap-2"
            >
              <FileQuestion className="h-4 w-4" />
              Request review
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
