import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OtcProduct {
  id: string;
  name: string;
  display_name: string | null;
  generic_name: string;
  primary_category: string | null;
  common_uses: string | null;
  is_vitamin: boolean | null;
  is_combo: boolean | null;
  combo_ingredients: string[] | null;
  brand: string | null;
  manufacturer: string | null;
  upc: string | null;
  category: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useOtcProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["otc-product", id],
    queryFn: async () => {
      if (!id) throw new Error("Product ID is required");

      const { data, error } = await supabase
        .from("otc_products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Product not found");

      return data as OtcProduct;
    },
    enabled: !!id,
  });
}
