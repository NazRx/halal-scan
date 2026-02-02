import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OtcVerdict {
  id: string;
  product_id: string;
  status: 'halal' | 'mushbooh' | 'haram' | 'needs_verification';
  confidence: number;
  summary_reason: string | null;
  clinical_breakdown: string | null;
  halal_alternatives: string[] | null;
  pharmacist_note: string | null;
  darura_context: string | null;
  updated_at: string;
  updated_by: string | null;
}

export function useOtcVerdict(productId: string | undefined) {
  return useQuery({
    queryKey: ["otc-verdict", productId],
    queryFn: async () => {
      if (!productId) return null;

      const { data, error } = await supabase
        .from("otc_verdicts")
        .select("*")
        .eq("product_id", productId)
        .maybeSingle();

      if (error) throw error;
      return data as OtcVerdict | null;
    },
    enabled: !!productId,
  });
}
