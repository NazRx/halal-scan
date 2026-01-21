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

export const OTC_CATEGORIES = [
  'Pain/Fever',
  'Allergy',
  'Sinus/Cold',
  'Cough/Cold',
  'GI',
  'Sleep/Stress',
  'Skin',
  'Eye/Ear/Mouth',
  'Smoking Cessation',
  'Vitamins & Minerals',
  'Supplements',
] as const;

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
          .select('id, display_name, generic_name, primary_category, common_uses, is_vitamin, is_combo, combo_ingredients', { count: 'exact' });

        // Filter by tab
        if (tab === 'vitamins') {
          query = query.eq('is_vitamin', true);
        } else {
          query = query.eq('is_vitamin', false);
        }

        // Apply category filter
        if (categoryFilter && categoryFilter !== 'all') {
          query = query.eq('primary_category', categoryFilter);
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
          category: p.primary_category,
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
          .select('primary_category')
          .not('primary_category', 'is', null);

        if (tab === 'vitamins') {
          query = query.eq('is_vitamin', true);
        } else {
          query = query.eq('is_vitamin', false);
        }

        const { data } = await query;
        const unique = [...new Set((data || []).map(p => p.primary_category).filter(Boolean))] as string[];
        setCategories(unique.sort());
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, [tab]);

  return categories;
}
