/**
 * Ramadan date detection utility
 * Ramadan 2025: Feb 28 - Mar 29, 2025
 * Ramadan 2026: Feb 17 - Mar 18, 2026
 * Ramadan 2027: Feb 7 - Mar 8, 2027
 */

interface RamadanPeriod {
  start: Date;
  end: Date;
  year: number;
}

// Pre-calculated Ramadan dates (approximate - based on lunar calendar predictions)
const RAMADAN_DATES: RamadanPeriod[] = [
  { start: new Date('2025-02-28'), end: new Date('2025-03-29'), year: 2025 },
  { start: new Date('2026-02-17'), end: new Date('2026-03-18'), year: 2026 },
  { start: new Date('2027-02-07'), end: new Date('2027-03-08'), year: 2027 },
  { start: new Date('2028-01-27'), end: new Date('2028-02-25'), year: 2028 },
];

export interface RamadanStatus {
  isRamadan: boolean;
  dayOfRamadan: number | null;
  isFirstWeek: boolean;
  daysRemaining: number | null;
  currentPeriod: RamadanPeriod | null;
}

export function getRamadanStatus(date: Date = new Date()): RamadanStatus {
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  for (const period of RAMADAN_DATES) {
    const start = new Date(period.start);
    const end = new Date(period.end);
    
    if (today >= start && today <= end) {
      const dayOfRamadan = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const daysRemaining = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        isRamadan: true,
        dayOfRamadan,
        isFirstWeek: dayOfRamadan <= 7,
        daysRemaining,
        currentPeriod: period,
      };
    }
  }
  
  return {
    isRamadan: false,
    dayOfRamadan: null,
    isFirstWeek: false,
    daysRemaining: null,
    currentPeriod: null,
  };
}

// Ramadan pricing constants
export const RAMADAN_PRICING = {
  FREE_RX_SCAN_LIMIT: 20, // Double the normal limit
  FIRST_WEEK_NO_ADS: true,
  PRO_FIRST_MONTH_PRICE: 2.99,
  PRO_YEARLY_PRICE: 29,
  SCAN_PACKS: [
    { credits: 50, price: 2.99, display: '$2.99', label: 'Ramadan Pack' },
    { credits: 200, price: 6.99, display: '$6.99', label: 'Family Pack' },
  ],
};

export const NORMAL_PRICING = {
  FREE_RX_SCAN_LIMIT: 10,
  FIRST_WEEK_NO_ADS: false,
  PRO_FIRST_MONTH_PRICE: 4.99,
  PRO_YEARLY_PRICE: 39,
  SCAN_PACKS: [
    { credits: 25, price: 2.99, display: '$2.99' },
    { credits: 100, price: 6.99, display: '$6.99' },
  ],
};

export function getCurrentPricing() {
  const { isRamadan } = getRamadanStatus();
  return isRamadan ? RAMADAN_PRICING : NORMAL_PRICING;
}

// Stripe price IDs for Ramadan offers
// Note: These need to be created in Stripe dashboard
export const STRIPE_PRICE_IDS = {
  // Normal pricing
  PRO_MONTHLY: 'price_1RXZf5Q4PL0VJjZGG2HbQ55S',
  PRO_YEARLY: 'price_1RXw8DQ4PL0VJjZGR71J0emq',
  CREDITS_25: 'credits_25',
  CREDITS_100: 'credits_100',
  
  // Ramadan pricing (to be created)
  RAMADAN_PRO_MONTHLY: 'price_ramadan_pro_monthly', // $2.99/month
  RAMADAN_PRO_YEARLY: 'price_ramadan_pro_yearly', // $29/year
  RAMADAN_CREDITS_50: 'credits_50_ramadan',
  RAMADAN_CREDITS_200: 'credits_200_ramadan',
};
