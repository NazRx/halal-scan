import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OtcBrowseProduct {
  id: string;
  displayName: string;
  genericName: string;
  category: string;
  commonUses: string | null;
  isVitamin: boolean;
  isCombo: boolean;
  comboIngredients: string[];
}

export type OtcBrowseTab = 'common' | 'vitamins';

// Canonical category keys matching the database
export const OTC_CATEGORIES = [
  'pain',
  'allergy',
  'cold_flu',
  'cough',
  'gi',
  'sleep',
  'vitamins',
  'supplements',
  'skin',
  'eye_ear',
  'first_aid',
  'feminine',
  'oral_care',
  'smoking_cessation',
] as const;

// Human-readable labels for display
export const OTC_CATEGORY_LABELS: Record<string, string> = {
  'pain': 'Pain Relief',
  'allergy': 'Allergy',
  'cold_flu': 'Cold & Flu',
  'cough': 'Cough',
  'gi': 'Digestive',
  'sleep': 'Sleep',
  'vitamins': 'Vitamins',
  'supplements': 'Supplements',
  'skin': 'Skin Care',
  'eye_ear': 'Eye & Ear',
  'first_aid': 'First Aid',
  'feminine': 'Feminine Care',
  'oral_care': 'Oral Care',
  'smoking_cessation': 'Quit Smoking',
};

export function useOtcBrowseList(
  tab: OtcBrowseTab,
  categoryFilter: string | null,
  page: number = 0,
  pageSize: number = 25
) {
  const [data, setData] = useState<OtcBrowseProduct[]>([]);
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
          .select('id, display_name, generic_name, category, primary_category, common_uses, is_vitamin, is_combo, combo_ingredients', { count: 'exact' });

        // Filter by tab
        if (tab === 'vitamins') {
          query = query.eq('is_vitamin', true);
        } else {
          query = query.eq('is_vitamin', false);
        }

        // Apply category filter using canonical category key
        if (categoryFilter && categoryFilter !== 'all') {
          query = query.eq('category', categoryFilter);
        }

        // Order and paginate
        const { data: products, count, error: queryError } = await query
          .order('display_name')
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (queryError) throw queryError;

        const items: OtcBrowseProduct[] = (products || []).map(p => ({
          id: p.id,
          displayName: p.display_name || p.generic_name,
          genericName: p.generic_name,
          category: p.category || p.primary_category,
          commonUses: p.common_uses,
          isVitamin: p.is_vitamin || false,
          isCombo: p.is_combo || false,
          comboIngredients: p.combo_ingredients || [],
        }));

        setData(items);
        setTotalCount(count || 0);
      } catch (err) {
        console.error('OTC browse error:', err);
        setError('Failed to load products');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tab, categoryFilter, page, pageSize]);

  return { data, totalCount, isLoading, error };
}

export function useOtcCategories(tab: OtcBrowseTab) {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let query = supabase
          .from('otc_products')
          .select('category')
          .not('category', 'is', null);

        if (tab === 'vitamins') {
          query = query.eq('is_vitamin', true);
        } else {
          query = query.eq('is_vitamin', false);
        }

        const { data } = await query;
        // Get unique canonical category keys
        const unique = [...new Set((data || []).map(p => p.category).filter(Boolean))] as string[];
        // Sort by the order defined in OTC_CATEGORIES
        const sorted = unique.sort((a, b) => {
          const indexA = OTC_CATEGORIES.indexOf(a as typeof OTC_CATEGORIES[number]);
          const indexB = OTC_CATEGORIES.indexOf(b as typeof OTC_CATEGORIES[number]);
          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });
        setCategories(sorted);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, [tab]);

  return categories;
}
