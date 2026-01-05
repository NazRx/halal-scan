import { useState, useEffect } from 'react';
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
  matchType?: 'generic' | 'brand' | 'form' | 'exact';
}

interface RxMedRow {
  id: string;
  generic_name: string;
  brand_names: string[] | null;
  category: string | null;
  dosage_forms: string[] | null;
}

interface OtcProductRow {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
}

// Map DB halal_status to UI status
function mapStatus(dbStatus: string | null): SearchResult['status'] {
  if (!dbStatus) return 'unknown';
  if (dbStatus === 'halal') return 'halal';
  if (dbStatus === 'mushbooh') return 'questionable';
  if (dbStatus === 'haram') return 'not-halal';
  return 'unknown';
}

// Common misspellings and aliases
const COMMON_ALIASES: Record<string, string[]> = {
  'tylenol': ['acetaminophen', 'paracetamol'],
  'advil': ['ibuprofen'],
  'motrin': ['ibuprofen'],
  'lipitor': ['atorvastatin'],
  'zestril': ['lisinopril'],
  'prinivil': ['lisinopril'],
  'glucophage': ['metformin'],
  'synthroid': ['levothyroxine'],
  'norvasc': ['amlodipine'],
  'zoloft': ['sertraline'],
  'prozac': ['fluoxetine'],
  'lexapro': ['escitalopram'],
  'prilosec': ['omeprazole'],
  'nexium': ['esomeprazole'],
  'plavix': ['clopidogrel'],
};

// Dosage form keywords to detect
const DOSAGE_FORM_KEYWORDS = [
  'tablet', 'tablets', 'tab', 'tabs',
  'capsule', 'capsules', 'cap', 'caps',
  'suspension', 'liquid', 'syrup',
  'injection', 'injectable', 'inj',
  'cream', 'ointment', 'gel', 'lotion',
  'patch', 'patches',
  'drops', 'solution',
  'inhaler', 'spray', 'nasal',
  'suppository', 'rectal',
  'chewable', 'chew',
  'extended-release', 'er', 'xr', 'xl',
  'immediate-release', 'ir',
];

// Extract dosage form from query
function extractDosageForm(query: string): { cleanQuery: string; form: string | null } {
  const lowerQuery = query.toLowerCase();
  for (const form of DOSAGE_FORM_KEYWORDS) {
    if (lowerQuery.includes(form)) {
      const cleanQuery = query.replace(new RegExp(`\\s*${form}\\s*`, 'gi'), ' ').trim();
      return { cleanQuery, form };
    }
  }
  return { cleanQuery: query, form: null };
}

// Get search terms including aliases
function getSearchTerms(query: string): string[] {
  const terms = [query.toLowerCase()];
  
  // Check for known aliases
  for (const [brand, generics] of Object.entries(COMMON_ALIASES)) {
    if (query.toLowerCase().includes(brand)) {
      terms.push(...generics);
    }
    // Also check reverse (generic -> brand)
    for (const generic of generics) {
      if (query.toLowerCase().includes(generic)) {
        terms.push(brand);
      }
    }
  }
  
  return [...new Set(terms)];
}

// Simple fuzzy match for typos (Levenshtein-like tolerance)
function fuzzyMatch(str: string, query: string): boolean {
  const s = str.toLowerCase();
  const q = query.toLowerCase();
  
  // Direct match
  if (s.includes(q)) return true;
  
  // Very short queries require exact match
  if (q.length < 3) return s.startsWith(q);
  
  // Allow for small typos by checking if most characters are present in order
  let qIndex = 0;
  let matches = 0;
  for (let i = 0; i < s.length && qIndex < q.length; i++) {
    if (s[i] === q[qIndex]) {
      matches++;
      qIndex++;
    }
  }
  
  // If we matched at least 80% of the query characters in order
  return matches >= q.length * 0.8;
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
        // Extract dosage form if present
        const { cleanQuery, form: dosageForm } = extractDosageForm(debouncedQuery);
        
        // Get all search terms including aliases
        const searchTerms = getSearchTerms(cleanQuery);
        const primaryTerm = `%${cleanQuery}%`;

        // Search Rx meds - by generic name
        const rxPromise = supabase
          .from('rx_meds')
          .select('id, generic_name, brand_names, category, dosage_forms')
          .or(`generic_name.ilike.${primaryTerm}`)
          .limit(20);

        // Search OTC products - by name and brand
        const otcPromise = supabase
          .from('otc_products')
          .select('id, name, brand, category')
          .or(`name.ilike.${primaryTerm},brand.ilike.${primaryTerm}`)
          .limit(15);

        const [rxResponse, otcResponse] = await Promise.all([rxPromise, otcPromise]);

        if (rxResponse.error) throw rxResponse.error;
        if (otcResponse.error) throw otcResponse.error;

        let rxMeds = (rxResponse.data || []) as RxMedRow[];
        const otcProducts = (otcResponse.data || []) as OtcProductRow[];

        // Also search by brand names using array contains for each term
        const brandSearchPromises = searchTerms.map(term =>
          supabase
            .from('rx_meds')
            .select('id, generic_name, brand_names, category, dosage_forms')
            .ilike('brand_names', `%${term}%`)
            .limit(10)
        );
        
        const brandSearchResults = await Promise.all(brandSearchPromises);
        
        // Merge and dedupe Rx results
        brandSearchResults.forEach(result => {
          if (!result.error && result.data) {
            result.data.forEach(med => {
              if (!rxMeds.find(m => m.id === med.id)) {
                rxMeds.push(med as RxMedRow);
              }
            });
          }
        });

        // If we have a dosage form filter, apply it
        if (dosageForm) {
          rxMeds = rxMeds.filter(med => {
            const forms = med.dosage_forms || [];
            return forms.some(f => f.toLowerCase().includes(dosageForm));
          });
        }

        // Apply fuzzy matching to improve results
        rxMeds = rxMeds.filter(med => {
          // Check generic name
          if (fuzzyMatch(med.generic_name, cleanQuery)) return true;
          // Check brand names
          if (med.brand_names?.some(b => fuzzyMatch(b, cleanQuery))) return true;
          // Check aliases
          return searchTerms.some(term => 
            fuzzyMatch(med.generic_name, term) ||
            med.brand_names?.some(b => fuzzyMatch(b, term))
          );
        });

        // Get verdict statuses for Rx meds via their variants
        const rxMedIds = rxMeds.map(m => m.id);
        let rxVerdicts: Record<string, string> = {};
        
        if (rxMedIds.length > 0) {
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
                rxVerdictResponse.data.forEach(v => {
                  const medId = variantToMed.get(v.variant_id);
                  if (medId && !rxVerdicts[medId]) {
                    rxVerdicts[medId] = v.status;
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

        // Build search results with match type
        const searchResults: SearchResult[] = [];

        // Add Rx results
        rxMeds.forEach(med => {
          const brandNames = med.brand_names?.filter(Boolean).join(', ') || null;
          
          // Determine match type
          let matchType: SearchResult['matchType'] = 'generic';
          if (med.generic_name.toLowerCase().includes(cleanQuery.toLowerCase())) {
            matchType = 'generic';
          } else if (med.brand_names?.some(b => b.toLowerCase().includes(cleanQuery.toLowerCase()))) {
            matchType = 'brand';
          }
          
          searchResults.push({
            id: med.id,
            type: 'rx',
            primaryName: med.generic_name,
            secondaryLabel: brandNames,
            status: mapStatus(rxVerdicts[med.id] || null),
            matchType,
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

        // Sort: exact matches first, then by name
        searchResults.sort((a, b) => {
          const aExact = a.primaryName.toLowerCase().startsWith(cleanQuery.toLowerCase());
          const bExact = b.primaryName.toLowerCase().startsWith(cleanQuery.toLowerCase());
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          return a.primaryName.localeCompare(b.primaryName);
        });

        setResults(searchResults.slice(0, 15));
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
