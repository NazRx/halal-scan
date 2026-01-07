import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NDCLookupResult {
  success: boolean;
  ndc: string;
  labeler: string | null;
  genericName: string | null;
  brandName: string | null;
  dosageForm: string | null;
  route: string[] | null;
  activeIngredients: Array<{ name: string; strength: string }> | null;
  packaging: Array<{ ndc: string; description: string }> | null;
  marketingCategory: string | null;
  error?: string;
}

export function useNdcLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NDCLookupResult | null>(null);

  const lookupNdc = async (ndc: string): Promise<NDCLookupResult | null> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("lookup-ndc", {
        body: { ndc },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        setError(data.error);
        setResult(data);
        return data;
      }

      setResult(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to lookup NDC";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setResult(null);
  };

  return {
    lookupNdc,
    isLoading,
    error,
    result,
    reset,
  };
}
