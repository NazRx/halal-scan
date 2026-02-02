import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OtcProductIngredientJoin {
  ingredient_id: string;
  notes: string | null;
  source_id: string | null;
  ingredients: {
    id: string;
    name: string;
    risk: 'low' | 'medium' | 'high';
    default_concern_reason: string | null;
    synonyms: string[] | null;
  };
  sources: {
    id: string;
    title: string;
    source_type: 'manufacturer' | 'certifier' | 'reference';
    url: string | null;
  } | null;
}

export function useOtcProductIngredients(productId: string | undefined) {
  return useQuery({
    queryKey: ["otc-product-ingredients", productId],
    queryFn: async () => {
      if (!productId) return [];

      const { data, error } = await supabase
        .from("otc_product_ingredients")
        .select(`
          ingredient_id,
          notes,
          source_id,
          ingredients (
            id,
            name,
            risk,
            default_concern_reason,
            synonyms
          ),
          sources (
            id,
            title,
            source_type,
            url
          )
        `)
        .eq("product_id", productId);

      if (error) {
        console.error('[useOtcProductIngredients] Error fetching:', error);
        throw error;
      }

      // Transform the data to match expected shape
      return (data || []).map(item => ({
        ingredient_id: item.ingredient_id,
        notes: item.notes,
        source_id: item.source_id,
        ingredients: item.ingredients as OtcProductIngredientJoin['ingredients'],
        sources: item.sources as OtcProductIngredientJoin['sources'],
      })) as OtcProductIngredientJoin[];
    },
    enabled: !!productId,
  });
}
