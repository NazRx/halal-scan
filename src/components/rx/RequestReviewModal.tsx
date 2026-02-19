import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  ImagePlus,
  Loader2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RequestReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill from page context */
  defaultDrugName?: string;
  defaultManufacturer?: string;
  sourcePage?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

const schema = z.object({
  drug_name: z.string().max(200).optional(),
  brand_or_manufacturer: z.string().max(200).optional(),
  ndc_number: z.string().max(100).optional(),
  upc_number: z.string().max(100).optional(),
  notes_text: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── File Upload State ────────────────────────────────────────────────────────

interface UploadedFile {
  file: File;
  preview: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hasAtLeastOneIdentifier(
  values: FormValues,
  barcodeFile: UploadedFile | null,
  ingredientsFile: UploadedFile | null
): boolean {
  if (barcodeFile || ingredientsFile) return true;
  const { drug_name, brand_or_manufacturer, ndc_number, upc_number } = values;
  const hasDrugAndBrand =
    (drug_name?.trim() || "") !== "" &&
    (brand_or_manufacturer?.trim() || "") !== "";
  const hasNdc = (ndc_number?.trim() || "") !== "";
  const hasUpc = (upc_number?.trim() || "") !== "";
  return hasDrugAndBrand || hasNdc || hasUpc;
}

async function uploadFile(
  file: File,
  userId: string | null,
  suffix: string
): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const folder = userId || "anon";
  const path = `review_requests/${folder}/${Date.now()}_${suffix}.${ext}`;
  const { error } = await supabase.storage
    .from("review-uploads")
    .upload(path, file, { upsert: false });
  if (error) {
    console.error("Storage upload error:", error);
    return null;
  }
  return path;
}

// ─── File Drop Zone ───────────────────────────────────────────────────────────

function FileDropZone({
  label,
  helper,
  value,
  onChange,
  recommended,
}: {
  label: string;
  helper: string;
  value: UploadedFile | null;
  onChange: (f: UploadedFile | null) => void;
  recommended?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const preview = URL.createObjectURL(file);
    onChange({ file, preview });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (value) {
    return (
      <div className="relative rounded-lg border border-border bg-muted/30 p-3 flex items-center gap-3">
        <img
          src={value.preview}
          alt="preview"
          className="h-14 w-14 rounded object-cover border border-border shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{value.file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(value.file.size / 1024).toFixed(0)} KB
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            URL.revokeObjectURL(value.preview);
            onChange(null);
          }}
          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-background transition-colors cursor-pointer p-4 text-center"
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <ImagePlus className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm font-medium flex items-center justify-center gap-2">
        {label}
        {recommended && (
          <Badge variant="secondary" className="text-xs">
            Recommended
          </Badge>
        )}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{helper}</p>
      <p className="text-xs text-muted-foreground mt-2">
        Click to browse or drag & drop
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RequestReviewModal({
  open,
  onOpenChange,
  defaultDrugName = "",
  defaultManufacturer = "",
  sourcePage,
}: RequestReviewModalProps) {
  const { user } = useAuth();

  const [barcodeFile, setBarcodeFile] = useState<UploadedFile | null>(null);
  const [ingredientsFile, setIngredientsFile] = useState<UploadedFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [identifierError, setIdentifierError] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      drug_name: defaultDrugName,
      brand_or_manufacturer: defaultManufacturer,
      ndc_number: "",
      upc_number: "",
      notes_text: "",
    },
  });

  const values = watch();
  const noPhotos = !barcodeFile && !ingredientsFile;

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setIdentifierError(false);
    setSubmitError(false);
    reset({
      drug_name: defaultDrugName,
      brand_or_manufacturer: defaultManufacturer,
      ndc_number: "",
      upc_number: "",
      notes_text: "",
    });
    if (barcodeFile) URL.revokeObjectURL(barcodeFile.preview);
    if (ingredientsFile) URL.revokeObjectURL(ingredientsFile.preview);
    setBarcodeFile(null);
    setIngredientsFile(null);
  };

  const onSubmit = async (data: FormValues) => {
    setIdentifierError(false);
    setSubmitError(false);

    if (!hasAtLeastOneIdentifier(data, barcodeFile, ingredientsFile)) {
      setIdentifierError(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = user?.id || null;

      // Upload files in parallel
      const [barcodePath, ingredientsPath] = await Promise.all([
        barcodeFile ? uploadFile(barcodeFile.file, userId, "barcode") : Promise.resolve(null),
        ingredientsFile ? uploadFile(ingredientsFile.file, userId, "ingredients") : Promise.resolve(null),
      ]);

      // Insert review request (cast to any since new columns not yet in generated types)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("review_requests") as any).insert({
        user_id: userId,
        type: "rx_not_found",
        status: "new",
        is_anonymous: !userId,
        drug_name: data.drug_name?.trim() || null,
        brand_or_manufacturer: data.brand_or_manufacturer?.trim() || null,
        ndc_number: data.ndc_number?.trim() || null,
        upc_number: data.upc_number?.trim() || null,
        notes_text: data.notes_text?.trim() || null,
        barcode_image_path: barcodePath,
        ingredients_image_path: ingredientsPath,
        source_page: sourcePage || window.location.pathname,
        query_text: data.drug_name?.trim() || null,
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (err) {
      console.error("Error submitting review request:", err);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success State ─────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6 space-y-4">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted">
              <CheckCircle className="h-8 w-8 text-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Request Submitted</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                We'll review your submission and may update the formulation list. Thank you for contributing to AmanahRx.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleReset} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Submit another request
              </Button>
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a Review</DialogTitle>
          <DialogDescription>
            Help us identify the exact product and labeler so we can research the correct formulation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-2">

          {/* ── Photo Uploads ─────────────────────────────────────────── */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">
                Upload photos{" "}
                <span className="text-muted-foreground font-normal">(optional but recommended)</span>
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Photos are the fastest way for us to identify your product accurately.
              </p>
            </div>

            <FileDropZone
              label="Barcode or Front Label Photo"
              helper="Upload a photo of the barcode or front of the package showing name + brand/labeler."
              value={barcodeFile}
              onChange={setBarcodeFile}
              recommended
            />

            <FileDropZone
              label="Inactive Ingredients Photo"
              helper="If available, upload the back panel showing inactive ingredients."
              value={ingredientsFile}
              onChange={setIngredientsFile}
            />
          </div>

          {/* ── Divider ───────────────────────────────────────────────── */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or provide identifiers
              </span>
            </div>
          </div>

          {/* ── Text Identifiers ─────────────────────────────────────── */}
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              If you cannot upload a photo, provide at least one of:{" "}
              <strong>Drug name + Brand/Manufacturer</strong>, or <strong>NDC</strong>, or{" "}
              <strong>UPC/Barcode number</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="drug_name">Drug name</Label>
                <Input
                  id="drug_name"
                  placeholder="e.g., Lisinopril"
                  {...register("drug_name")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brand_or_manufacturer">Brand / Manufacturer (Labeler)</Label>
                <Input
                  id="brand_or_manufacturer"
                  placeholder="e.g., Zestril, Lupin Pharma"
                  {...register("brand_or_manufacturer")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ndc_number">NDC</Label>
                <Input
                  id="ndc_number"
                  placeholder="e.g., 0093-5056-01"
                  {...register("ndc_number")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="upc_number">UPC / Barcode number</Label>
                <Input
                  id="upc_number"
                  placeholder="e.g., 300450456043"
                  {...register("upc_number")}
                />
              </div>
            </div>

            {/* Inline validation error */}
            {identifierError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Please upload a photo <strong>or</strong> provide (Drug name + Brand/Manufacturer){" "}
                  <strong>or</strong> NDC <strong>or</strong> UPC/Barcode number.
                </span>
              </div>
            )}
          </div>

          {/* ── Optional Notes ───────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="notes_text">
              Notes{" "}
              <span className="text-muted-foreground font-normal text-xs">(optional)</span>
            </Label>
            <Textarea
              id="notes_text"
              placeholder="Anything else that might help (dosage form, strength, where purchased, etc.)"
              rows={3}
              {...register("notes_text")}
            />
          </div>

          {/* ── Submit Error ─────────────────────────────────────────── */}
          {submitError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Something went wrong. Please try again.</span>
            </div>
          )}

          {/* ── Footer ───────────────────────────────────────────────── */}
          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              AmanahRx uses this information solely for research purposes.{" "}
              <a
                href="/methodology"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 inline-flex items-center gap-1"
              >
                View Methodology
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
