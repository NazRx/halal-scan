import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type SubscriptionTier = 'free' | 'pro' | 'clinic';

interface SubscriptionState {
  tier: SubscriptionTier;
  subscriptionEnd: string | null;
  loading: boolean;
  error: string | null;
}

// Map Stripe product IDs to tiers
const PRODUCT_TIERS: Record<string, SubscriptionTier> = {
  'prod_TjQ9oSqBsqYAM6': 'pro',    // HalalRx Pro
  'prod_Tj0lisDNdac8bT': 'pro',    // HalalRx Pro (alternate)
  'prod_Tj0mHEPqLbW8VC': 'clinic', // HalalRx Clinic
};

export function useSubscription() {
  const { user, session } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    tier: 'free',
    subscriptionEnd: null,
    loading: true,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setState(prev => ({ ...prev, tier: 'free', subscriptionEnd: null, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.subscribed && data.product_id) {
        const tier = PRODUCT_TIERS[data.product_id] || 'pro';
        setState({
          tier,
          subscriptionEnd: data.subscription_end,
          loading: false,
          error: null,
        });
      } else {
        setState({
          tier: 'free',
          subscriptionEnd: null,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      console.error('Subscription check error:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to check subscription',
      }));
    }
  }, [session?.access_token]);

  // Check on mount and when session changes
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return {
    ...state,
    isPro: state.tier === 'pro' || state.tier === 'clinic',
    isClinic: state.tier === 'clinic',
    isFree: state.tier === 'free',
    refresh: checkSubscription,
  };
}
