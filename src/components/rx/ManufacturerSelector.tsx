import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Camera, FileQuestion, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Manufacturer {
  id: string;
  name: string;
  dosageForm?: string;
  strength?: string;
}

interface ManufacturerSelectorProps {
  manufacturers: Manufacturer[];
  selectedManufacturer: string | null;
  onSelect: (manufacturerId: string | null) => void;
  onUploadPhoto?: () => void;
  onRequestReview?: () => void;
  className?: string;
}

export function ManufacturerSelector({
  manufacturers,
  selectedManufacturer,
  onSelect,
  onUploadPhoto,
  onRequestReview,
  className,
}: ManufacturerSelectorProps) {
  const selected = manufacturers.find((m) => m.id === selectedManufacturer);

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
          {manufacturers.map((mfr) => (
            <SelectItem key={mfr.id} value={mfr.id}>
              {mfr.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selected manufacturer details */}
      {selected && (
        <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm">
          <p className="font-medium">{selected.name}</p>
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
