import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OtcIngredientProfile } from "@/lib/otcVerdict";

/**
 * Fetch OTC ingredient profile for a product
 */
export function useOtcIngredientProfile(productId: string | undefined) {
  return useQuery({
    queryKey: ["otc-ingredient-profile", productId],
    queryFn: async () => {
      if (!productId) return null;

      const { data, error } = await supabase
        .from("otc_ingredient_profiles")
        .select("*")
        .eq("otc_product_id", productId)
        .maybeSingle();

      if (error) {
        console.error("[useOtcIngredientProfile] Error:", error);
        throw error;
      }

      // Type cast the JSONB fields
      if (data) {
        return {
          ...data,
          active_ingredients: data.active_ingredients as OtcIngredientProfile['active_ingredients'],
          flags: data.flags as OtcIngredientProfile['flags'],
          risk_ingredients: data.risk_ingredients as OtcIngredientProfile['risk_ingredients'],
          sources: data.sources as OtcIngredientProfile['sources'],
          default_status: data.default_status as OtcIngredientProfile['default_status'],
        } as OtcIngredientProfile;
      }

      return null;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Submit user contribution for OTC product ingredients
 */
export function useSubmitOtcContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      pastedText,
      brandId,
      upc,
    }: {
      productId: string;
      pastedText: string;
      brandId?: string;
      upc?: string;
    }) => {
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from("otc_user_submissions")
        .insert({
          otc_product_id: productId,
          user_id: session?.session?.user?.id || null,
          pasted_text: pastedText,
          submission_type: 'inactive_ingredients',
          otc_brand_id: brandId || null,
          upc: upc || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ["otc-ingredient-profile", variables.productId] 
      });
    },
  });
}
