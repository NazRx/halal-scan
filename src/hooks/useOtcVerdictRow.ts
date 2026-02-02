import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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

export function useOtcVerdictRow(productId: string | undefined, autoCreate: boolean = false) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const query = useQuery({
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

  // Auto-create verdict if none exists
  useEffect(() => {
    const createVerdict = async () => {
      if (!autoCreate || !productId || query.isLoading || isCreating || query.data) return;
      
      // Only attempt creation if query completed and returned null
      if (query.data === null && !query.isLoading && !query.isFetching) {
        setIsCreating(true);
        setCreateError(null);
        
        try {
          const { data: insertedData, error: insertError } = await supabase
            .from("otc_verdicts")
            .insert({
              product_id: productId,
              status: 'needs_verification' as const,
              confidence: 0,
            })
            .select()
            .maybeSingle();

          if (insertError) {
            console.error('[useOtcVerdictRow] Failed to auto-create verdict:', insertError.message);
            setCreateError(insertError.message);
          } else if (insertedData) {
            // Update cache with new verdict
            queryClient.setQueryData(["otc-verdict", productId], insertedData);
          }
        } catch (err) {
          console.error('[useOtcVerdictRow] Unexpected error creating verdict:', err);
          setCreateError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setIsCreating(false);
        }
      }
    };

    createVerdict();
  }, [productId, autoCreate, query.data, query.isLoading, query.isFetching, isCreating, queryClient]);

  return {
    ...query,
    isCreating,
    createError,
    isLoading: query.isLoading || isCreating,
  };
}
