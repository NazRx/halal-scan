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
// CRITICAL: For Rx meds, if no inactive ingredients exist, status MUST be 'unknown'
// and confidence is capped at 20. Never show 'halal' with only active ingredients.
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
    
    // Check if inactive ingredients exist
    const hasInactiveIngredients = dbIngredients.some(i => i.role === 'inactive');
    
    const input: VerdictEngineInput = {
      ingredients,
      adminOverride,
      isRxVariant: true,
      // Only mark as having variant-specific ingredients if inactives exist
      hasVariantSpecificIngredients: hasVariantSpecificIngredients && hasInactiveIngredients,
    };
    
    const verdict = evaluateVerdict(input);
    
    // Double-check: Force unknown status if no inactive ingredients for Rx meds
    // This ensures we NEVER show halal when only active ingredient data exists
    if (!hasInactiveIngredients && verdict.status === 'halal') {
      return {
        ...verdict,
        status: 'unknown' as const,
        confidence: Math.min(verdict.confidence, 20),
        summaryReason: 'Inactive ingredient (excipient) data is not available. Halal status cannot be determined without this information.',
        reasons: [
          {
            code: 'NO_INACTIVE_INGREDIENTS',
            severity: 'warning' as const,
            message: 'Inactive ingredient data is not available. Halal status cannot be determined without reviewing inactive ingredients (excipients).',
          },
          ...verdict.reasons.filter(r => r.code !== 'ALL_CLEAR'),
        ],
      };
    }
    
    return verdict;
  }, [dbIngredients, hasVariantSpecificIngredients, adminOverride]);
}

// Direct evaluation without hook (for SSR or non-React contexts)
export { evaluateVerdict, mapDbIngredientsToInput };
