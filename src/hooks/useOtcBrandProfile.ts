import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OtcIngredientProfile, OtcRiskFlags } from "@/lib/otcVerdict";

export interface OtcBrandIngredientProfile {
  id: string;
  otc_product_id: string;
  otc_brand_id: string;
  dosage_form: string | null;
  route: string | null;
  active_ingredients: Array<{ name: string; strength?: string; notes?: string }> | null;
  flags: OtcRiskFlags | null;
  risk_ingredients: Array<{ ingredient: string; risk_tag: string; note?: string }> | null;
  rationale_short: string | null;
  rationale_long: string | null;
  sources: Array<{ label: string; url?: string; note?: string }> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch brand-specific ingredient profile override
 */
export function useOtcBrandProfile(
  productId: string | undefined,
  brandId: string | undefined
) {
  return useQuery({
    queryKey: ["otc-brand-profile", productId, brandId],
    queryFn: async () => {
      if (!productId || !brandId) return null;

      const { data, error } = await supabase
        .from("otc_brand_ingredient_profiles")
        .select("*")
        .eq("otc_product_id", productId)
        .eq("otc_brand_id", brandId)
        .maybeSingle();

      if (error) {
        console.error("[useOtcBrandProfile] Error:", error);
        throw error;
      }

      if (data) {
        return {
          ...data,
          active_ingredients: data.active_ingredients as OtcBrandIngredientProfile['active_ingredients'],
          flags: data.flags as OtcBrandIngredientProfile['flags'],
          risk_ingredients: data.risk_ingredients as OtcBrandIngredientProfile['risk_ingredients'],
          sources: data.sources as OtcBrandIngredientProfile['sources'],
        } as OtcBrandIngredientProfile;
      }

      return null;
    },
    enabled: !!productId && !!brandId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Resolve the best available profile for an OTC product
 * Priority: brand override > generic profile > none
 */
export function resolveOtcProfile(
  genericProfile: OtcIngredientProfile | null | undefined,
  brandProfile: OtcBrandIngredientProfile | null | undefined
): {
  profile: OtcIngredientProfile | null;
  source: 'brand_override' | 'generic' | 'none';
} {
  if (brandProfile) {
    // Convert brand profile to OtcIngredientProfile format
    const converted: OtcIngredientProfile = {
      id: brandProfile.id,
      otc_product_id: brandProfile.otc_product_id,
      active_ingredients: brandProfile.active_ingredients,
      dosage_form: brandProfile.dosage_form,
      route: brandProfile.route,
      flags: brandProfile.flags,
      risk_ingredients: brandProfile.risk_ingredients,
      default_status: null, // Brand overrides don't have admin status
      rationale_short: brandProfile.rationale_short,
      rationale_long: brandProfile.rationale_long,
      sources: brandProfile.sources,
      created_at: brandProfile.created_at,
      updated_at: brandProfile.updated_at,
    };
    return { profile: converted, source: 'brand_override' };
  }

  if (genericProfile) {
    return { profile: genericProfile, source: 'generic' };
  }

  return { profile: null, source: 'none' };
}
