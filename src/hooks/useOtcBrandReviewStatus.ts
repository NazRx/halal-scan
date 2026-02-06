import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type OtcReviewLevel =
  | "none"
  | "pattern_reviewed"
  | "ingredient_reviewed"
  | "manufacturer_confirmed"
  | "halal_certified";

export interface OtcBrandReviewStatus {
  id: string;
  brand_id: string;
  review_level: OtcReviewLevel;
  last_reviewed_at: string | null;
  notes: string | null;
}

const REVIEW_LEVEL_LABELS: Record<OtcReviewLevel, string> = {
  none: "Not yet reviewed",
  pattern_reviewed: "Pattern-based review",
  ingredient_reviewed: "Ingredient-level review",
  manufacturer_confirmed: "Manufacturer-confirmed",
  halal_certified: "Halal certified",
};

export function getReviewLevelLabel(level: OtcReviewLevel): string {
  return REVIEW_LEVEL_LABELS[level] || "Not yet reviewed";
}

/**
 * Fetch the review status for a specific OTC brand
 */
export function useOtcBrandReviewStatus(brandId: string | undefined | null) {
  return useQuery({
    queryKey: ["otc-brand-review-status", brandId],
    queryFn: async () => {
      if (!brandId) return null;

      const { data, error } = await supabase
        .from("otc_brand_review_status")
        .select("*")
        .eq("brand_id", brandId)
        .maybeSingle();

      if (error) {
        console.error("[useOtcBrandReviewStatus] Error:", error);
        throw error;
      }

      return data as OtcBrandReviewStatus | null;
    },
    enabled: !!brandId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
