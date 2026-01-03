import { useMemo } from 'react';
import { evaluateVerdict, mapDbIngredientsToInput } from '@/lib/verdict-engine';
import type { VerdictEngineInput, VerdictOutput, AdminOverride } from '@/types/verdict';

// For OTC products
export function useOtcVerdict(
  dbIngredients: Array<{
    ingredient_id: string;
    notes?: string | null;
    source_id?: string | null;
    ingredients: {
      id: string;
      name: string;
      risk: 'low' | 'medium' | 'high';
      default_concern_reason?: string | null;
      synonyms?: string[];
    };
    sources?: {
      id: string;
      title: string;
      source_type: 'manufacturer' | 'certifier' | 'reference';
      url?: string | null;
    } | null;
  }>,
  adminOverride?: AdminOverride
): VerdictOutput {
  return useMemo(() => {
    const ingredients = mapDbIngredientsToInput(dbIngredients);
    
    const input: VerdictEngineInput = {
      ingredients,
      adminOverride,
      isRxVariant: false,
    };
    
    return evaluateVerdict(input);
  }, [dbIngredients, adminOverride]);
}

// For Rx medication variants
export function useRxVerdict(
  dbIngredients: Array<{
    ingredient_id: string;
    notes?: string | null;
    source_id?: string | null;
    role?: 'active' | 'inactive';
    ingredients: {
      id: string;
      name: string;
      risk: 'low' | 'medium' | 'high';
      default_concern_reason?: string | null;
      synonyms?: string[];
    };
    sources?: {
      id: string;
      title: string;
      source_type: 'manufacturer' | 'certifier' | 'reference';
      url?: string | null;
    } | null;
  }>,
  hasVariantSpecificIngredients: boolean,
  adminOverride?: AdminOverride
): VerdictOutput {
  return useMemo(() => {
    const ingredients = mapDbIngredientsToInput(dbIngredients);
    
    const input: VerdictEngineInput = {
      ingredients,
      adminOverride,
      isRxVariant: true,
      hasVariantSpecificIngredients,
    };
    
    return evaluateVerdict(input);
  }, [dbIngredients, hasVariantSpecificIngredients, adminOverride]);
}

// Direct evaluation without hook (for SSR or non-React contexts)
export { evaluateVerdict, mapDbIngredientsToInput };
