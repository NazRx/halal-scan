import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OtcBrand {
  id: string;
  brand_name: string;
  labeler_name: string | null;
  website: string | null;
  notes: string | null;
  is_halal_certified: boolean;
  certification_body: string | null;
  certification_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OtcProductBrand {
  id: string;
  otc_product_id: string;
  otc_brand_id: string;
  upc: string | null;
  ndc: string | null;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  brand: OtcBrand;
}

/**
 * Fetch all brands linked to an OTC product
 */
export function useOtcBrandsForProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ["otc-product-brands", productId],
    queryFn: async () => {
      if (!productId) return [];

      const { data, error } = await supabase
        .from("otc_product_brands")
        .select(`
          id,
          otc_product_id,
          otc_brand_id,
          upc,
          ndc,
          is_primary,
          notes,
          created_at,
          brand:otc_brands (
            id,
            brand_name,
            labeler_name,
            website,
            notes,
            is_halal_certified,
            certification_body,
            certification_url,
            created_at,
            updated_at
          )
        `)
        .eq("otc_product_id", productId)
        .order("is_primary", { ascending: false });

      if (error) {
        console.error("[useOtcBrandsForProduct] Error:", error);
        throw error;
      }

      // Transform the response to flatten the brand object
      return (data || []).map((item) => ({
        ...item,
        brand: Array.isArray(item.brand) ? item.brand[0] : item.brand,
      })) as OtcProductBrand[];
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch all OTC brands (for admin/seeding purposes)
 */
export function useAllOtcBrands() {
  return useQuery({
    queryKey: ["otc-brands-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("otc_brands")
        .select("*")
        .order("brand_name");

      if (error) {
        console.error("[useAllOtcBrands] Error:", error);
        throw error;
      }

      return data as OtcBrand[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
