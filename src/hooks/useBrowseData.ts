import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { normalizeStatus, filterToCanonical, type CanonicalStatus } from '@/lib/normalizeStatus';

export type RxBrowseMode = 'alpha-generic' | 'alpha-brand' | 'drug-class';
export type OtcBrowseMode = 'alpha-name' | 'alpha-brand' | 'category';
export type StatusFilter = 'all' | 'halal' | 'questionable' | 'not-halal' | 'unknown';

// Drug classes for Rx browsing
export const DRUG_CLASSES = [
  'ACE Inhibitors',
  'ARBs',
  'Antibiotics - Cephalosporins',
  'Antibiotics - Macrolides',
  'Antibiotics - Penicillins',
  'Antibiotics - Tetracyclines',
  'Anticoagulants',
  'Antipsychotics',
  'Benzodiazepines',
  'Beta Blockers',
  'Calcium Channel Blockers',
  'Diabetes - GLP-1 Agonists',
  'Diabetes - Insulin',
  'Diabetes - Metformin',
  'Diabetes - SGLT2 Inhibitors',
  'H2 Blockers',
  'PPIs',
  'SNRIs',
  'SSRIs',
  'Statins',
  'Thiazide Diuretics',
];

// OTC categories
export const OTC_CATEGORIES = [
  'pain',
  'allergy',
  'cold_flu',
  'cough',
  'gi',
  'oral_care',
  'eye_ear',
  'first_aid',
  'feminine',
  'skin',
  'sleep',
  'smoking_cessation',
  'supplements',
  'vitamins',
  'other',
];

export interface RxBrowseItem {
  id: string;
  genericName: string;
  brandNames: string[];
  drugClass: string | null;
  category: string | null;
  status: 'halal' | 'questionable' | 'not-halal' | 'unknown' | 'varies';
  variantCount: number;
}

export interface OtcBrowseItem {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  status: 'halal' | 'questionable' | 'not-halal' | 'unknown';
}

interface BrandIndex {
  brand: string;
  rxMedId: string;
  genericName: string;
}

// Map DB status to UI status using canonical normalization, then to hyphenated UI format
function mapStatus(dbStatus: string | null): 'halal' | 'questionable' | 'not-halal' | 'unknown' {
  const canonical = normalizeStatus(dbStatus);
  if (canonical === 'not_halal') return 'not-halal';
  return canonical;
}

export function useRxBrowseData(
  mode: RxBrowseMode,
  statusFilter: StatusFilter,
  selectedDrugClass: string | null,
  letter: string | null,
  page: number,
  pageSize: number = 25
) {
  const [data, setData] = useState<RxBrowseItem[]>([]);
  const [brandIndex, setBrandIndex] = useState<BrandIndex[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // For alpha-brand mode, handle separately with brand-focused query
        if (mode === 'alpha-brand') {
          await fetchBrandMode();
          return;
        }

        // Build base query
        let query = supabase
          .from('rx_meds')
          .select('id, generic_name, brand_names, drug_class, category, dosage_forms, default_status', { count: 'exact' });

        // Apply letter filter for alpha-generic mode
        if (letter && mode === 'alpha-generic') {
          query = query.ilike('generic_name', `${letter}%`);
        }

        // Apply drug class filter
        if (mode === 'drug-class' && selectedDrugClass) {
          query = query.eq('drug_class', selectedDrugClass);
        }

        // When status filter is active, fetch all matching meds (no server pagination)
        // so we can compute verdicts and filter accurately, then paginate locally.
        // When 'all', use server-side pagination for efficiency.
        let rxMeds: typeof query extends any ? any[] : never;
        let serverCount: number | null = null;

        if (statusFilter === 'all') {
          const { data: paginated, count, error: rxError } = await query
            .order('generic_name')
            .range(page * pageSize, (page + 1) * pageSize - 1);
          if (rxError) throw rxError;
          rxMeds = paginated || [];
          serverCount = count;
        } else {
          // Fetch up to 5000 for status-filtered mode
          const { data: allMeds, error: rxError } = await query
            .order('generic_name')
            .range(0, 4999);
          if (rxError) throw rxError;
          rxMeds = allMeds || [];
        }

        if (rxMeds.length === 0) {
          setData([]);
          setBrandIndex([]);
          setTotalCount(serverCount || 0);
          setIsLoading(false);
          return;
        }

        // Batch variant lookups in chunks of 25 to avoid URL length limits
        const medIds = rxMeds.map((m: any) => m.id);
        const allVariants: any[] = [];
        for (let i = 0; i < medIds.length; i += 25) {
          const chunk = medIds.slice(i, i + 25);
          const { data: variants, error: variantsError } = await supabase
            .from('rx_variants')
            .select('id, rx_med_id, dosage_form')
            .in('rx_med_id', chunk);
          if (variantsError) throw variantsError;
          if (variants) allVariants.push(...variants);
        }

        // Get verdicts for all variants in chunks
        const allVariantIds = allVariants.map(v => v.id);
        let verdicts: Record<string, string[]> = {};

        for (let i = 0; i < allVariantIds.length; i += 50) {
          const chunk = allVariantIds.slice(i, i + 50);
          const { data: verdictData, error: verdictError } = await supabase
            .from('rx_verdicts')
            .select('variant_id, status')
            .in('variant_id', chunk);

          if (!verdictError && verdictData) {
            const variantToMed = new Map(allVariants.map(v => [v.id, v.rx_med_id]));
            verdictData.forEach(v => {
              const medId = variantToMed.get(v.variant_id);
              if (medId) {
                if (!verdicts[medId]) verdicts[medId] = [];
                verdicts[medId].push(v.status);
              }
            });
          }
        }

        // Count variants per med
        const variantCounts: Record<string, number> = {};
        allVariants.forEach(v => {
          variantCounts[v.rx_med_id] = (variantCounts[v.rx_med_id] || 0) + 1;
        });

        // Build browse items
        const items: RxBrowseItem[] = rxMeds.map((med: any) => {
          const medVerdicts = verdicts[med.id] || [];
          let status: RxBrowseItem['status'] = 'unknown';
          
          if (medVerdicts.length > 0) {
            const uniqueStatuses = [...new Set(medVerdicts.map(mapStatus))];
            if (uniqueStatuses.length === 1) {
              status = uniqueStatuses[0];
            } else if (uniqueStatuses.length > 1) {
              status = 'varies';
            }
          }
          
          if (status === 'unknown' && med.default_status) {
            status = mapStatus(med.default_status);
          }

          return {
            id: med.id,
            genericName: med.generic_name,
            brandNames: med.brand_names || [],
            drugClass: med.drug_class,
            category: med.category,
            status,
            variantCount: variantCounts[med.id] || 0,
          };
        });

        if (statusFilter === 'all') {
          // Server-paginated: items are already the correct page
          setData(items);
          setTotalCount(serverCount || 0);
        } else {
          // Client-side filter + paginate
          const filteredItems = items.filter(item => item.status === statusFilter);
          const start = page * pageSize;
          setData(filteredItems.slice(start, start + pageSize));
          setTotalCount(filteredItems.length);
        }
        setBrandIndex([]);
      } catch (err) {
        console.error('Browse data error:', err);
        setError('Failed to load data');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBrandMode = async () => {
      try {
        // For brand mode, fetch meds that have brand names
        let query = supabase
          .from('rx_meds')
          .select('id, generic_name, brand_names', { count: 'exact' })
          .not('brand_names', 'eq', '{}');

        const { data: medsWithBrands, error: brandsError } = await query.order('generic_name');

        if (brandsError) throw brandsError;

        // Build brand index from fetched meds
        const brands: BrandIndex[] = [];
        (medsWithBrands || []).forEach(med => {
          (med.brand_names || []).forEach(brand => {
            if (brand) {
              brands.push({
                brand,
                rxMedId: med.id,
                genericName: med.generic_name,
              });
            }
          });
        });
        brands.sort((a, b) => a.brand.localeCompare(b.brand));

        // Filter by letter
        let filteredBrands = brands;
        if (letter) {
          filteredBrands = brands.filter(b => 
            b.brand.toUpperCase().startsWith(letter)
          );
        }

        // Paginate the brand index
        const start = page * pageSize;
        const paginatedBrands = filteredBrands.slice(start, start + pageSize);

        setBrandIndex(paginatedBrands);
        setTotalCount(filteredBrands.length);
        setData([]);
      } catch (err) {
        console.error('Brand mode error:', err);
        setError('Failed to load data');
        setBrandIndex([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mode, statusFilter, selectedDrugClass, letter, page, pageSize]);

  return { data, brandIndex, totalCount, isLoading, error };
}

export function useOtcBrowseData(
  mode: OtcBrowseMode,
  statusFilter: StatusFilter,
  categoryFilter: string,
  letter: string | null,
  page: number,
  pageSize: number = 25
) {
  const [data, setData] = useState<OtcBrowseItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('otc_products')
          .select('id, name, brand, category, primary_category, generic_name, default_status');

        // Apply letter filter
        if (letter) {
          if (mode === 'alpha-name') {
            query = query.ilike('name', `${letter}%`);
          } else if (mode === 'alpha-brand') {
            query = query.ilike('brand', `${letter}%`);
          }
        }

        // Apply category filter
        if (mode === 'category' && categoryFilter && categoryFilter !== 'all') {
          query = query.eq('category', categoryFilter);
        } else if (categoryFilter && categoryFilter !== 'all') {
          query = query.eq('category', categoryFilter);
        }

        // Order based on mode
        if (mode === 'alpha-brand') {
          query = query.order('brand').order('name');
        } else if (mode === 'category') {
          query = query.order('category').order('name');
        } else {
          query = query.order('name');
        }

        const { data: products, error: productsError } = await query;

        if (productsError) throw productsError;

        if (!products || products.length === 0) {
          setData([]);
          setTotalCount(0);
          setIsLoading(false);
          return;
        }

        // Get verdicts
        const productIds = products.map(p => p.id);
        const { data: verdicts, error: verdictsError } = await supabase
          .from('otc_verdicts')
          .select('product_id, status')
          .in('product_id', productIds);

        const verdictMap: Record<string, string> = {};
        if (!verdictsError && verdicts) {
          verdicts.forEach(v => {
            verdictMap[v.product_id] = v.status;
          });
        }

        // Build items with fallback: verdict -> product default_status -> null
        let items: OtcBrowseItem[] = products.map((product: any) => {
          const raw = verdictMap[product.id] ?? product.default_status ?? null;
          return {
            id: product.id,
            name: product.name,
            brand: product.brand,
            category: product.primary_category ?? product.category,
            status: mapStatus(raw),
          };
        });

        // Apply status filter
        if (statusFilter !== 'all') {
          items = items.filter(item => item.status === statusFilter);
        }

        setTotalCount(items.length);

        // Paginate
        const start = page * pageSize;
        const paginatedItems = items.slice(start, start + pageSize);

        setData(paginatedItems);
      } catch (err) {
        console.error('OTC browse error:', err);
        setError('Failed to load data');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mode, statusFilter, categoryFilter, letter, page, pageSize]);

  return { data, totalCount, isLoading, error };
}

// Get unique categories and forms from the database
export function useFilterOptions() {
  const [dosageForms, setDosageForms] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Get unique dosage forms from variants
        const { data: variants } = await supabase
          .from('rx_variants')
          .select('dosage_form')
          .not('dosage_form', 'is', null);

        const uniqueForms = [...new Set((variants || []).map(v => v.dosage_form).filter(Boolean))] as string[];
        setDosageForms(uniqueForms.sort());

        // Get unique categories from OTC products
        const { data: products } = await supabase
          .from('otc_products')
          .select('category')
          .not('category', 'is', null);

        const uniqueCategories = [...new Set((products || []).map(p => p.category).filter(Boolean))] as string[];
        setCategories(uniqueCategories.sort());
      } catch (err) {
        console.error('Failed to load filter options:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { dosageForms, categories, isLoading };
}
