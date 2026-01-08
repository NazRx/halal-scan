import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface InactiveIngredient {
  name: string;
  unii?: string;
}

export interface SPLParseResult {
  success: boolean;
  setId?: string;
  ndc?: string;
  labeler?: string;
  productName?: string;
  inactiveIngredients: InactiveIngredient[];
  error?: string;
  source: "dailymed";
}

export function useDailyMedSPL() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SPLParseResult | null>(null);

  const parseByNdc = async (ndc: string): Promise<SPLParseResult | null> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("parse-dailymed-spl", {
        body: { ndc },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error && !data.success) {
        setError(data.error);
        setResult(data);
        return data;
      }

      setResult(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to parse DailyMed SPL";
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
    parseByNdc,
    isLoading,
    error,
    result,
    reset,
  };
}
