import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageSquareHeart, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const feedbackSchema = z.object({
  feedback_type: z.enum(["correction", "suggestion", "compliment", "question", "other"]),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(100),
  message: z.string().min(10, "Please provide more detail (at least 10 characters)").max(2000),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  medicationId?: string;
  productUpc?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

const feedbackTypes = [
  { value: "correction", label: "Correction", description: "Help us fix inaccurate information" },
  { value: "suggestion", label: "Suggestion", description: "Share ideas to make HalalRx better" },
  { value: "compliment", label: "Compliment", description: "Let us know what's working well" },
  { value: "question", label: "Question", description: "Ask about our data or process" },
  { value: "other", label: "Other", description: "Anything else on your mind" },
];

export function FeedbackForm({ medicationId, productUpc, onSuccess, compact = false }: FeedbackFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedback_type: "suggestion",
      subject: "",
      message: "",
      email: "",
    },
  });

  const feedbackType = watch("feedback_type");

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("user_feedback").insert({
        user_id: user?.id || null,
        email: data.email || null,
        feedback_type: data.feedback_type,
        subject: data.subject,
        message: data.message,
        related_medication_id: medicationId || null,
        related_product_upc: productUpc || null,
        page_url: window.location.pathname,
      });

      if (error) throw error;

      setIsSuccess(true);
      reset();
      onSuccess?.();
      
      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-status-halal-bg">
          <CheckCircle className="h-8 w-8 text-status-halal" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Thank You!</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Your feedback means the world to us. Every message helps us serve the Muslim community better.
          </p>
          {!user && (
            <p className="text-xs text-muted-foreground">
              If you provided your email, we'll follow up within 2-3 business days.
            </p>
          )}
        </div>
        <Button variant="outline" onClick={() => setIsSuccess(false)}>
          Send Another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!compact && (
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
            <MessageSquareHeart className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">We'd Love to Hear From You</h3>
          <p className="text-sm text-muted-foreground">
            Your feedback helps us improve HalalRx for everyone. Whether it's a correction, 
            suggestion, or kind word—we read every message.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="feedback_type">Type of Feedback</Label>
          <Select
            value={feedbackType}
            onValueChange={(value: FeedbackFormData["feedback_type"]) => 
              setValue("feedback_type", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select feedback type" />
            </SelectTrigger>
            <SelectContent>
              {feedbackTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <span className="font-medium">{type.label}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      — {type.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="e.g., Incorrect ingredient listed for Lisinopril"
            {...register("subject")}
            className={errors.subject ? "border-destructive" : ""}
          />
          {errors.subject && (
            <p className="text-xs text-destructive">{errors.subject.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Please share any details that would help us improve. We appreciate your time and insight!"
            rows={compact ? 3 : 5}
            {...register("message")}
            className={errors.message ? "border-destructive" : ""}
          />
          {errors.message && (
            <p className="text-xs text-destructive">{errors.message.message}</p>
          )}
        </div>

        {!user && (
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com — if you'd like us to follow up"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Leave blank for anonymous feedback, or add your email for a response.
            </p>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          "Sending..."
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send Feedback
          </>
        )}
      </Button>
    </form>
  );
}
