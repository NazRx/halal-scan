import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  'Allergy',
  'Antacids',
  'Cough/Cold',
  'Fish Oil',
  'Gummies',
  'Kids',
  'Pain Relief',
  'Prenatal',
  'Probiotics',
  'Sleep',
  'Vitamins',
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

// Map DB status to UI status
function mapStatus(dbStatus: string | null): 'halal' | 'questionable' | 'not-halal' | 'unknown' {
  if (!dbStatus) return 'unknown';
  if (dbStatus === 'halal') return 'halal';
  if (dbStatus === 'mushbooh') return 'questionable';
  if (dbStatus === 'haram') return 'not-halal';
  return 'unknown';
}

export function useRxBrowseData(
  mode: RxBrowseMode,
  statusFilter: StatusFilter,
  formFilter: string,
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
        // Fetch all Rx meds with their variants and default_status
        let query = supabase
          .from('rx_meds')
          .select('id, generic_name, brand_names, drug_class, category, dosage_forms, default_status');

        // Apply letter filter for alpha modes
        if (letter && (mode === 'alpha-generic')) {
          query = query.ilike('generic_name', `${letter}%`);
        }

        // Apply drug class filter
        if (mode === 'drug-class' && selectedDrugClass) {
          query = query.eq('drug_class', selectedDrugClass);
        }

        const { data: rxMeds, error: rxError } = await query.order('generic_name');

        if (rxError) throw rxError;

        if (!rxMeds || rxMeds.length === 0) {
          setData([]);
          setBrandIndex([]);
          setTotalCount(0);
          setIsLoading(false);
          return;
        }

        // Get all variants for these meds
        const medIds = rxMeds.map(m => m.id);
        const { data: variants, error: variantsError } = await supabase
          .from('rx_variants')
          .select('id, rx_med_id, dosage_form')
          .in('rx_med_id', medIds);

        if (variantsError) throw variantsError;

        // Get verdicts for all variants
        const variantIds = (variants || []).map(v => v.id);
        let verdicts: Record<string, string[]> = {};

        if (variantIds.length > 0) {
          const { data: verdictData, error: verdictError } = await supabase
            .from('rx_verdicts')
            .select('variant_id, status')
            .in('variant_id', variantIds);

          if (!verdictError && verdictData) {
            // Group verdicts by med ID
            const variantToMed = new Map((variants || []).map(v => [v.id, v.rx_med_id]));
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
        (variants || []).forEach(v => {
          variantCounts[v.rx_med_id] = (variantCounts[v.rx_med_id] || 0) + 1;
        });

        // Build browse items
        let items: RxBrowseItem[] = rxMeds.map(med => {
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
          
          // Fallback to default_status from rx_meds if no variant verdicts or all are unknown
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

        // Build brand index for alpha-brand mode
        const brands: BrandIndex[] = [];
        rxMeds.forEach(med => {
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

        // Filter by letter for brand mode
        if (mode === 'alpha-brand' && letter) {
          const filteredBrands = brands.filter(b => 
            b.brand.toUpperCase().startsWith(letter)
          );
          setBrandIndex(filteredBrands);
        } else {
          setBrandIndex(brands);
        }

        // Apply status filter
        if (statusFilter !== 'all') {
          items = items.filter(item => {
            if (statusFilter === 'halal') return item.status === 'halal';
            if (statusFilter === 'questionable') return item.status === 'questionable' || item.status === 'varies';
            if (statusFilter === 'not-halal') return item.status === 'not-halal';
            if (statusFilter === 'unknown') return item.status === 'unknown';
            return true;
          });
        }

        // Apply form filter (check if any variant has this form)
        if (formFilter && formFilter !== 'all') {
          const medsWithForm = new Set(
            (variants || [])
              .filter(v => v.dosage_form?.toLowerCase() === formFilter.toLowerCase())
              .map(v => v.rx_med_id)
          );
          items = items.filter(item => medsWithForm.has(item.id));
        }

        setTotalCount(items.length);

        // Paginate
        const start = page * pageSize;
        const paginatedItems = items.slice(start, start + pageSize);

        setData(paginatedItems);
      } catch (err) {
        console.error('Browse data error:', err);
        setError('Failed to load data');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mode, statusFilter, formFilter, selectedDrugClass, letter, page, pageSize]);

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
          .select('id, name, brand, category');

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

        // Build items
        let items: OtcBrowseItem[] = products.map(product => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          status: mapStatus(verdictMap[product.id] || null),
        }));

        // Apply status filter
        if (statusFilter !== 'all') {
          items = items.filter(item => {
            if (statusFilter === 'halal') return item.status === 'halal';
            if (statusFilter === 'questionable') return item.status === 'questionable';
            if (statusFilter === 'not-halal') return item.status === 'not-halal';
            if (statusFilter === 'unknown') return item.status === 'unknown';
            return true;
          });
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
