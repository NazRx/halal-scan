import { useMemo } from 'react';
import { getRamadanStatus, getCurrentPricing, RamadanStatus } from '@/lib/ramadan';

export function useRamadan() {
  const status = useMemo<RamadanStatus>(() => getRamadanStatus(), []);
  const pricing = useMemo(() => getCurrentPricing(), []);
  
  return {
    ...status,
    pricing,
  };
}
