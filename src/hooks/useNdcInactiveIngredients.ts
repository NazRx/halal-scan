import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NdcInactiveIngredient {
  id: string;
  ingredient_text_raw: string;
  ingredient_name_normalized: string;
  unii_code: string | null;
  matched_ingredient_id: string | null;
  matched_status: string | null;
  match_confidence: string | null;
  status: string;
}

interface NdcProduct {
  ndc: string;
  generic_name: string | null;
  brand_name: string | null;
  dosage_form: string | null;
  strength: string | null;
  route: string | null;
  labeler_name: string | null;
  set_id: string | null;
  last_ingested_at: string | null;
}

interface UseNdcInactiveIngredientsResult {
  ingredients: NdcInactiveIngredient[];
  product: NdcProduct | null;
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
  fetchByNdc: (ndc: string) => Promise<void>;
  ingestNdc: (ndc: string, forceRefresh?: boolean) => Promise<boolean>;
}

export function useNdcInactiveIngredients(): UseNdcInactiveIngredientsResult {
  const [ingredients, setIngredients] = useState<NdcInactiveIngredient[]>([]);
  const [product, setProduct] = useState<NdcProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByNdc = useCallback(async (ndc: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch product info
      const { data: productData, error: productError } = await supabase
        .from('ndc_products')
        .select('*')
        .eq('ndc', ndc)
        .maybeSingle();

      if (productError) throw productError;

      setProduct(productData as NdcProduct | null);

      if (productData) {
        // Fetch ingredients
        const { data: ingredientsData, error: ingredientsError } = await supabase
          .from('ndc_inactive_ingredients')
          .select('*')
          .eq('ndc', ndc)
          .order('ingredient_name_normalized');

        if (ingredientsError) throw ingredientsError;

        setIngredients((ingredientsData || []) as NdcInactiveIngredient[]);
      } else {
        setIngredients([]);
      }
    } catch (err) {
      console.error('Error fetching NDC data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch NDC data');
      setIngredients([]);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const ingestNdc = useCallback(async (ndc: string, forceRefresh = false): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ingest-inactives', {
        body: { ndc, forceRefresh }
      });

      if (fnError) throw fnError;

      if (data?.success) {
        // Refetch the data
        await fetchByNdc(ndc);
        return true;
      } else {
        setError(data?.error || 'Ingestion failed');
        return false;
      }
    } catch (err) {
      console.error('Error ingesting NDC:', err);
      setError(err instanceof Error ? err.message : 'Failed to ingest NDC');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchByNdc]);

  return {
    ingredients,
    product,
    isLoading,
    error,
    hasData: ingredients.length > 0,
    fetchByNdc,
    ingestNdc,
  };
}
