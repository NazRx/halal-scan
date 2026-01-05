import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

export type SearchResultType = 'rx' | 'otc';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  primaryName: string;
  secondaryLabel: string | null;
  status: 'halal' | 'questionable' | 'not-halal' | 'unknown';
  hasMultipleVariants?: boolean;
}

interface RxMedRow {
  id: string;
  generic_name: string;
  brand_names: string[] | null;
  category: string | null;
}

interface OtcProductRow {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
}

interface RxVerdictRow {
  rx_med_id: string;
  status: string;
}

interface OtcVerdictRow {
  product_id: string;
  status: string;
}

// Map DB halal_status to UI status
function mapStatus(dbStatus: string | null): SearchResult['status'] {
  if (!dbStatus) return 'unknown';
  if (dbStatus === 'halal') return 'halal';
  if (dbStatus === 'mushbooh') return 'questionable';
  if (dbStatus === 'haram') return 'not-halal';
  return 'unknown';
}

export function useGlobalSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const searchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchTerm = `%${debouncedQuery}%`;

        // Search Rx meds - by generic name and brand names
        const rxPromise = supabase
          .from('rx_meds')
          .select('id, generic_name, brand_names, category')
          .or(`generic_name.ilike.${searchTerm}`)
          .limit(10);

        // Search OTC products - by name and brand
        const otcPromise = supabase
          .from('otc_products')
          .select('id, name, brand, category')
          .or(`name.ilike.${searchTerm},brand.ilike.${searchTerm}`)
          .limit(10);

        const [rxResponse, otcResponse] = await Promise.all([rxPromise, otcPromise]);

        if (rxResponse.error) throw rxResponse.error;
        if (otcResponse.error) throw otcResponse.error;

        const rxMeds = (rxResponse.data || []) as RxMedRow[];
        const otcProducts = (otcResponse.data || []) as OtcProductRow[];

        // Also search by brand names (array contains)
        let brandMatchRxMeds: RxMedRow[] = [];
        if (debouncedQuery.length >= 2) {
          const brandSearchResponse = await supabase
            .from('rx_meds')
            .select('id, generic_name, brand_names, category')
            .filter('brand_names', 'cs', `{${debouncedQuery}}`)
            .limit(10);
          
          if (!brandSearchResponse.error) {
            brandMatchRxMeds = (brandSearchResponse.data || []) as RxMedRow[];
          }
        }

        // Merge and dedupe Rx results
        const allRxMeds = [...rxMeds];
        brandMatchRxMeds.forEach(med => {
          if (!allRxMeds.find(m => m.id === med.id)) {
            allRxMeds.push(med);
          }
        });

        // Get verdict statuses for Rx meds via their variants
        const rxMedIds = allRxMeds.map(m => m.id);
        let rxVerdicts: Record<string, string> = {};
        
        if (rxMedIds.length > 0) {
          // Get variants for these meds
          const variantsResponse = await supabase
            .from('rx_variants')
            .select('id, rx_med_id')
            .in('rx_med_id', rxMedIds);
          
          if (!variantsResponse.error && variantsResponse.data) {
            const variantIds = variantsResponse.data.map(v => v.id);
            const variantToMed = new Map(variantsResponse.data.map(v => [v.id, v.rx_med_id]));
            
            if (variantIds.length > 0) {
              const rxVerdictResponse = await supabase
                .from('rx_verdicts')
                .select('variant_id, status')
                .in('variant_id', variantIds);
              
              if (!rxVerdictResponse.error && rxVerdictResponse.data) {
                // Map verdicts back to med IDs
                rxVerdictResponse.data.forEach(v => {
                  const medId = variantToMed.get(v.variant_id);
                  if (medId) {
                    // If multiple variants, we'd show "Varies", but for search just take first
                    if (!rxVerdicts[medId]) {
                      rxVerdicts[medId] = v.status;
                    }
                  }
                });
              }
            }
          }
        }

        // Get verdict statuses for OTC products
        const otcProductIds = otcProducts.map(p => p.id);
        let otcVerdicts: Record<string, string> = {};
        
        if (otcProductIds.length > 0) {
          const otcVerdictResponse = await supabase
            .from('otc_verdicts')
            .select('product_id, status')
            .in('product_id', otcProductIds);
          
          if (!otcVerdictResponse.error && otcVerdictResponse.data) {
            otcVerdictResponse.data.forEach(v => {
              otcVerdicts[v.product_id] = v.status;
            });
          }
        }

        // Build search results
        const searchResults: SearchResult[] = [];

        // Add Rx results
        allRxMeds.forEach(med => {
          const brandNames = med.brand_names?.filter(Boolean).join(', ') || null;
          searchResults.push({
            id: med.id,
            type: 'rx',
            primaryName: med.generic_name,
            secondaryLabel: brandNames,
            status: mapStatus(rxVerdicts[med.id] || null),
          });
        });

        // Add OTC results
        otcProducts.forEach(product => {
          searchResults.push({
            id: product.id,
            type: 'otc',
            primaryName: product.name,
            secondaryLabel: product.brand,
            status: mapStatus(otcVerdicts[product.id] || null),
          });
        });

        setResults(searchResults.slice(0, 15)); // Limit total results
      } catch (err) {
        console.error('Search error:', err);
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [debouncedQuery]);

  return { results, isLoading, error };
}
