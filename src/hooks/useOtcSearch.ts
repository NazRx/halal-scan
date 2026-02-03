import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

export interface OtcSearchResult {
  id: string;
  displayName: string;
  genericName: string;
  category: string;
  commonUses: string | null;
  isVitamin: boolean;
  isCombo: boolean;
  matchType: 'exact-generic' | 'exact-synonym' | 'partial';
}

export function useOtcSearch(query: string) {
  const [results, setResults] = useState<OtcSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchLower = debouncedQuery.toLowerCase().trim();
        
        // 1. Exact generic_name match
        const { data: exactGeneric } = await supabase
          .from('otc_products')
          .select('id, display_name, generic_name, primary_category, common_uses, is_vitamin, is_combo')
          .ilike('generic_name', searchLower);

        // 2. Exact synonym match
        const { data: synonymMatches } = await supabase
          .from('otc_synonyms')
          .select('otc_product_id, synonym')
          .ilike('synonym', searchLower);

        // 3. Partial matches on display_name, generic_name, or search_terms
        const { data: partialMatches } = await supabase
          .from('otc_products')
          .select('id, display_name, generic_name, primary_category, common_uses, is_vitamin, is_combo, search_terms')
          .or(`display_name.ilike.%${searchLower}%,generic_name.ilike.%${searchLower}%`);

        // 4. Get products for synonym matches
        const synonymProductIds = (synonymMatches || []).map(s => s.otc_product_id);
        let synonymProducts: any[] = [];
        if (synonymProductIds.length > 0) {
          const { data } = await supabase
            .from('otc_products')
            .select('id, display_name, generic_name, primary_category, common_uses, is_vitamin, is_combo')
            .in('id', synonymProductIds);
          synonymProducts = data || [];
        }

        // Combine and deduplicate results with scoring
        const resultMap = new Map<string, OtcSearchResult>();

        // Exact generic matches get highest priority
        (exactGeneric || []).forEach(p => {
          resultMap.set(p.id, {
            id: p.id,
            displayName: p.display_name,
            genericName: p.generic_name,
            category: p.primary_category,
            commonUses: p.common_uses,
            isVitamin: p.is_vitamin || false,
            isCombo: p.is_combo || false,
            matchType: 'exact-generic',
          });
        });

        // Synonym matches second priority
        synonymProducts.forEach(p => {
          if (!resultMap.has(p.id)) {
            resultMap.set(p.id, {
              id: p.id,
              displayName: p.display_name,
              genericName: p.generic_name,
              category: p.primary_category,
              commonUses: p.common_uses,
              isVitamin: p.is_vitamin || false,
              isCombo: p.is_combo || false,
              matchType: 'exact-synonym',
            });
          }
        });

        // Partial matches lowest priority
        (partialMatches || []).forEach(p => {
          if (!resultMap.has(p.id)) {
            // Also check if any search_terms match
            const termsMatch = (p.search_terms || []).some((term: string) => 
              term.toLowerCase().includes(searchLower)
            );
            if (p.display_name.toLowerCase().includes(searchLower) || 
                p.generic_name.toLowerCase().includes(searchLower) ||
                termsMatch) {
              resultMap.set(p.id, {
                id: p.id,
                displayName: p.display_name,
                genericName: p.generic_name,
                category: p.primary_category,
                commonUses: p.common_uses,
                isVitamin: p.is_vitamin || false,
                isCombo: p.is_combo || false,
                matchType: 'partial',
              });
            }
          }
        });

        // Sort by match type priority, then alphabetically
        // Prefer non-combo products when match types are equal
        const sortedResults = Array.from(resultMap.values()).sort((a, b) => {
          const priority = { 'exact-generic': 0, 'exact-synonym': 1, 'partial': 2 };
          const pDiff = priority[a.matchType] - priority[b.matchType];
          if (pDiff !== 0) return pDiff;
          // Non-combo products should come before combo products
          if (a.isCombo !== b.isCombo) return a.isCombo ? 1 : -1;
          return a.displayName.localeCompare(b.displayName);
        });

        // DEBUG: Log search diagnostics
        const exactSynonymMatches = sortedResults.filter(r => r.matchType === 'exact-synonym');
        const exactGenericMatches = sortedResults.filter(r => r.matchType === 'exact-generic');
        console.log('🔍 [OTC Search Debug]', {
          query: searchLower,
          exactSynonymMatchFound: exactSynonymMatches.length > 0,
          synonymMatchCount: synonymProducts.length,
          totalResults: sortedResults.length,
          top5: sortedResults.slice(0, 5).map(r => ({
            displayName: r.displayName,
            genericName: r.genericName,
            isCombo: r.isCombo,
            category: r.category,
            matchType: r.matchType
          }))
        });

        setResults(sortedResults.slice(0, 50)); // Limit to 50 results
      } catch (err) {
        console.error('OTC search error:', err);
        setError('Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  return { results, isLoading, error };
}
