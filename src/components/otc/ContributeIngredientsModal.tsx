import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSubmitOtcContribution } from "@/hooks/useOtcIngredientProfile";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

interface ContributeIngredientsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

export function ContributeIngredientsModal({
  open,
  onOpenChange,
  productId,
  productName,
}: ContributeIngredientsModalProps) {
  const [pastedText, setPastedText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitMutation = useSubmitOtcContribution();

  const handleSubmit = async () => {
    if (!pastedText.trim()) {
      toast.error("Please paste the ingredient list before submitting.");
      return;
    }

    try {
      await submitMutation.mutateAsync({
        productId,
        pastedText: pastedText.trim(),
      });
      setSubmitted(true);
      toast.success("Thank you! Your contribution has been submitted for review.");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit. Please try again.");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after modal closes
    setTimeout(() => {
      setPastedText("");
      setSubmitted(false);
    }, 200);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-green-500/10 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="mb-2">Thank you!</DialogTitle>
            <DialogDescription>
              Your contribution for <strong>{productName}</strong> has been submitted. 
              Our team will review and incorporate it to improve the verdict accuracy.
            </DialogDescription>
            <Button className="mt-6" onClick={handleClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Contribute Ingredient Details</DialogTitle>
          <DialogDescription>
            Help us improve the halal assessment for <strong>{productName}</strong> by 
            sharing the inactive ingredients from the package label.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ingredients">
              Paste inactive ingredients from the label
            </Label>
            <Textarea
              id="ingredients"
              placeholder="Example: Croscarmellose sodium, magnesium stearate, microcrystalline cellulose, polyethylene glycol, polyvinyl alcohol, povidone, stearic acid, talc, titanium dioxide..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Look for "Inactive ingredients" or "Other ingredients" on the Drug Facts label.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitMutation.isPending || !pastedText.trim()}
          >
            {submitMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
