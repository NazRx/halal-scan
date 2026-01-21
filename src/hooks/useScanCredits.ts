import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useRamadan } from '@/hooks/useRamadan';

interface ScanCreditsState {
  rxScansUsed: number;
  purchasedCredits: number;
  loading: boolean;
  error: string | null;
}

export function useScanCredits() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const { pricing, isRamadan, isFirstWeek } = useRamadan();
  
  // Use Ramadan limit (20) during Ramadan, otherwise normal (10)
  const FREE_RX_SCAN_LIMIT = pricing.FREE_RX_SCAN_LIMIT;
  
  const [state, setState] = useState<ScanCreditsState>({
    rxScansUsed: 0,
    purchasedCredits: 0,
    loading: true,
    error: null,
  });

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('rx_scans_used, purchased_credits')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setState({
        rxScansUsed: data?.rx_scans_used ?? 0,
        purchasedCredits: data?.purchased_credits ?? 0,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error fetching scan credits:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch credits',
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Calculate remaining free scans (for free tier users)
  const freeScansRemaining = Math.max(0, FREE_RX_SCAN_LIMIT - state.rxScansUsed);
  
  // Total available scans (free remaining + purchased credits)
  const totalScansAvailable = isPro 
    ? Infinity 
    : freeScansRemaining + state.purchasedCredits;

  // Check if user can perform an Rx scan
  const canScanRx = isPro || totalScansAvailable > 0;

  // Use a scan credit (called after successful Rx scan)
  const useRxScan = useCallback(async () => {
    if (!user || isPro) return true; // Pro users don't use credits

    try {
      // First try to use purchased credits, then free scans
      if (state.purchasedCredits > 0) {
        const { error } = await supabase
          .from('profiles')
          .update({ purchased_credits: state.purchasedCredits - 1 })
          .eq('id', user.id);
        
        if (error) throw error;
        setState(prev => ({ ...prev, purchasedCredits: prev.purchasedCredits - 1 }));
      } else if (freeScansRemaining > 0) {
        const { error } = await supabase
          .from('profiles')
          .update({ rx_scans_used: state.rxScansUsed + 1 })
          .eq('id', user.id);
        
        if (error) throw error;
        setState(prev => ({ ...prev, rxScansUsed: prev.rxScansUsed + 1 }));
      } else {
        return false; // No credits available
      }
      
      return true;
    } catch (err) {
      console.error('Error using scan credit:', err);
      return false;
    }
  }, [user, isPro, state.purchasedCredits, state.rxScansUsed, freeScansRemaining]);

  // Add purchased credits (called after successful purchase)
  const addCredits = useCallback(async (amount: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ purchased_credits: state.purchasedCredits + amount })
        .eq('id', user.id);

      if (error) throw error;
      setState(prev => ({ ...prev, purchasedCredits: prev.purchasedCredits + amount }));
      return true;
    } catch (err) {
      console.error('Error adding credits:', err);
      return false;
    }
  }, [user, state.purchasedCredits]);

  return {
    ...state,
    freeScansRemaining,
    totalScansAvailable,
    canScanRx,
    useRxScan,
    addCredits,
    refresh: fetchCredits,
    FREE_RX_SCAN_LIMIT,
    isRamadan,
    isFirstWeekNoAds: isRamadan && isFirstWeek,
  };
}
