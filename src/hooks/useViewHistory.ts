import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface HistoryItem {
  id: string;
  event_type: string;
  ref_id: string | null;
  created_at: string;
  metadata: {
    medication_name?: string;
    manufacturer_name?: string;
    status?: string;
    med_id?: string;
  } | null;
}

export function useViewHistory(limit = 50) {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('usage_events')
        .select('id, event_type, ref_id, created_at, metadata')
        .eq('user_id', user.id)
        .in('event_type', ['rx_search', 'report_view'])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      setHistory((data || []) as HistoryItem[]);
      setError(null);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const trackView = useCallback(async (
    eventType: 'rx_search' | 'report_view',
    refId: string,
    metadata: {
      medication_name: string;
      manufacturer_name?: string;
      status?: string;
      med_id?: string;
    }
  ) => {
    if (!user) return;

    try {
      await supabase.from('usage_events').insert({
        user_id: user.id,
        event_type: eventType,
        ref_id: refId,
        metadata
      });
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  }, [user]);

  return {
    history,
    loading,
    error,
    refresh: fetchHistory,
    trackView
  };
}
