import { useState } from "react";
import { MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FeedbackForm } from "./FeedbackForm";

interface FeedbackButtonProps {
  medicationId?: string;
  productUpc?: string;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
}

export function FeedbackButton({
  medicationId,
  productUpc,
  variant = "outline",
  size = "default",
  className,
  label = "Share Feedback",
}: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <MessageSquareHeart className="h-4 w-4 mr-2" />
          {label}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="sr-only">
          <SheetTitle>Send Feedback</SheetTitle>
          <SheetDescription>
            Share your thoughts, corrections, or suggestions with us.
          </SheetDescription>
        </SheetHeader>
        <FeedbackForm
          medicationId={medicationId}
          productUpc={productUpc}
          onSuccess={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
