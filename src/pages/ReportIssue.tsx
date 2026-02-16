import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Send, CheckCircle, AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

const issueSchema = z.object({
  issue_type: z.string().min(1, "Please select an issue type"),
  description: z.string().min(10, "Please provide more detail (at least 10 characters)").max(2000),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
});

type IssueFormData = z.infer<typeof issueSchema>;

const issueTypes = [
  { value: "wrong_verdict", label: "Wrong verdict", description: "The halal status seems incorrect" },
  { value: "wrong_ingredients", label: "Wrong ingredients", description: "Ingredient list is inaccurate" },
  { value: "wrong_brand", label: "Wrong manufacturer/brand", description: "Brand or manufacturer info is wrong" },
  { value: "upc_mismatch", label: "UPC mismatch", description: "Barcode doesn't match the product" },
  { value: "app_bug", label: "App bug/UI issue", description: "Something isn't working correctly" },
  { value: "other", label: "Other", description: "Something else" },
];

const ReportIssue = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get context from URL params
  const productId = searchParams.get("productId");
  const productName = searchParams.get("productName");
  const brandId = searchParams.get("brandId");
  const brandName = searchParams.get("brandName");
  const upc = searchParams.get("upc");
  const returnUrl = searchParams.get("returnUrl") || "/otc/browse";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      issue_type: "",
      description: "",
      email: "",
    },
  });

  const issueType = watch("issue_type");

  const onSubmit = async (data: IssueFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("user_issue_reports").insert({
        user_id: user?.id || null,
        email: data.email || null,
        issue_type: data.issue_type,
        description: data.description,
        product_id: productId || null,
        brand_id: brandId || null,
        upc: upc || null,
        page_url: returnUrl,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Thanks — your report was sent.");
    } catch (error) {
      console.error("Error submitting issue report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container px-4 pt-24 pb-6">
          <Card className="max-w-xl mx-auto p-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-status-halal-bg mb-4">
              <CheckCircle className="h-8 w-8 text-status-halal" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Report Submitted</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for helping us improve. We'll review your report and take action if needed.
            </p>
            <Button onClick={() => navigate(returnUrl)}>
              Back to product
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container px-4 pt-24 pb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="max-w-xl mx-auto p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Report an Issue</h1>
              <p className="text-sm text-muted-foreground">
                Help us fix incorrect or missing information
              </p>
            </div>
          </div>

          {/* Product Context (read-only) */}
          {productName && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">Product Context</h2>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Product:</span> {productName}</p>
                {brandName && (
                  <p><span className="text-muted-foreground">Brand:</span> {brandName}</p>
                )}
                {upc && (
                  <p><span className="text-muted-foreground">UPC:</span> {upc}</p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="issue_type">Issue Type *</Label>
              <Select
                value={issueType}
                onValueChange={(value) => setValue("issue_type", value)}
              >
                <SelectTrigger className={errors.issue_type ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select what's wrong" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((type) => (
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
              {errors.issue_type && (
                <p className="text-xs text-destructive">{errors.issue_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what's wrong… (e.g., 'The verdict shows halal but the product contains gelatin from pork')"
                rows={5}
                {...register("description")}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
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
                  Leave blank for anonymous submission, or add your email for updates.
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send report
                </>
              )}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default ReportIssue;
