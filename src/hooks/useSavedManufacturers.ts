import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SavedManufacturer {
  id: string;
  user_id: string;
  variant_id: string;
  nickname: string | null;
  notes: string | null;
  created_at: string;
  // Joined data
  variant?: {
    id: string;
    manufacturer: string | null;
    strength_text: string | null;
    dosage_form: string | null;
    rx_med_id: string;
  };
  medication?: {
    id: string;
    generic_name: string;
    brand_names: string[] | null;
  };
  verdict?: {
    status: string;
    confidence: number;
  };
}

export function useSavedManufacturers() {
  const { user } = useAuth();
  const [savedManufacturers, setSavedManufacturers] = useState<SavedManufacturer[]>([]);
  const [savedVariantIds, setSavedVariantIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedManufacturers = useCallback(async () => {
    if (!user) {
      setSavedManufacturers([]);
      setSavedVariantIds(new Set());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First get saved manufacturers
      const { data: savedData, error: savedError } = await supabase
        .from('saved_manufacturers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (savedError) throw savedError;

      if (!savedData || savedData.length === 0) {
        setSavedManufacturers([]);
        setSavedVariantIds(new Set());
        setLoading(false);
        return;
      }

      // Get variant IDs
      const variantIds = savedData.map(s => s.variant_id);
      setSavedVariantIds(new Set(variantIds));

      // Fetch variants with their medications and verdicts
      const { data: variantsData, error: variantsError } = await supabase
        .from('rx_variants')
        .select(`
          id,
          manufacturer,
          strength_text,
          dosage_form,
          rx_med_id,
          rx_meds!inner(id, generic_name, brand_names),
          rx_verdicts(status, confidence)
        `)
        .in('id', variantIds);

      if (variantsError) throw variantsError;

      // Merge the data
      const enrichedData = savedData.map(saved => {
        const variant = variantsData?.find(v => v.id === saved.variant_id);
        return {
          ...saved,
          variant: variant ? {
            id: variant.id,
            manufacturer: variant.manufacturer,
            strength_text: variant.strength_text,
            dosage_form: variant.dosage_form,
            rx_med_id: variant.rx_med_id
          } : undefined,
          medication: variant?.rx_meds ? {
            id: (variant.rx_meds as any).id,
            generic_name: (variant.rx_meds as any).generic_name,
            brand_names: (variant.rx_meds as any).brand_names
          } : undefined,
          verdict: variant?.rx_verdicts?.[0] ? {
            status: (variant.rx_verdicts as any)[0].status,
            confidence: (variant.rx_verdicts as any)[0].confidence
          } : undefined
        };
      });

      setSavedManufacturers(enrichedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching saved manufacturers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch saved manufacturers');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedManufacturers();
  }, [fetchSavedManufacturers]);

  const saveManufacturer = useCallback(async (
    variantId: string,
    nickname?: string,
    notes?: string
  ) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error: insertError } = await supabase
        .from('saved_manufacturers')
        .insert({
          user_id: user.id,
          variant_id: variantId,
          nickname: nickname || null,
          notes: notes || null
        });

      if (insertError) throw insertError;

      // Optimistically update
      setSavedVariantIds(prev => new Set([...prev, variantId]));
      await fetchSavedManufacturers();
      
      return { success: true };
    } catch (err) {
      console.error('Error saving manufacturer:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to save' 
      };
    }
  }, [user, fetchSavedManufacturers]);

  const unsaveManufacturer = useCallback(async (variantId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error: deleteError } = await supabase
        .from('saved_manufacturers')
        .delete()
        .eq('user_id', user.id)
        .eq('variant_id', variantId);

      if (deleteError) throw deleteError;

      // Optimistically update
      setSavedVariantIds(prev => {
        const next = new Set(prev);
        next.delete(variantId);
        return next;
      });
      setSavedManufacturers(prev => prev.filter(s => s.variant_id !== variantId));
      
      return { success: true };
    } catch (err) {
      console.error('Error unsaving manufacturer:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to unsave' 
      };
    }
  }, [user]);

  const updateSavedManufacturer = useCallback(async (
    variantId: string,
    updates: { nickname?: string; notes?: string }
  ) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error: updateError } = await supabase
        .from('saved_manufacturers')
        .update(updates)
        .eq('user_id', user.id)
        .eq('variant_id', variantId);

      if (updateError) throw updateError;

      await fetchSavedManufacturers();
      return { success: true };
    } catch (err) {
      console.error('Error updating saved manufacturer:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update' 
      };
    }
  }, [user, fetchSavedManufacturers]);

  const isSaved = useCallback((variantId: string) => {
    return savedVariantIds.has(variantId);
  }, [savedVariantIds]);

  const toggleSave = useCallback(async (
    variantId: string,
    nickname?: string,
    notes?: string
  ) => {
    if (isSaved(variantId)) {
      return unsaveManufacturer(variantId);
    } else {
      return saveManufacturer(variantId, nickname, notes);
    }
  }, [isSaved, saveManufacturer, unsaveManufacturer]);

  return {
    savedManufacturers,
    savedVariantIds,
    loading,
    error,
    refresh: fetchSavedManufacturers,
    saveManufacturer,
    unsaveManufacturer,
    updateSavedManufacturer,
    isSaved,
    toggleSave
  };
}
