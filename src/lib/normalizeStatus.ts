// Canonical status values used for UI filtering
export type CanonicalStatus = 'halal' | 'questionable' | 'not_halal' | 'unknown';

/**
 * Normalizes any raw status string from DB or engine into a canonical value.
 * Handles all known variants: haram, mushbooh, not-halal, needs_verification, etc.
 */
export function normalizeStatus(raw: string | null | undefined): CanonicalStatus {
  if (!raw) return 'unknown';
  const s = raw.trim().toLowerCase().replace(/[\s_-]+/g, '_');

  if (s === 'halal') return 'halal';
  if (['haram', 'not_halal', 'not halal'].includes(s)) return 'not_halal';
  if (['mushbooh', 'questionable', 'mashbooh', 'doubtful', 'unclear'].includes(s)) return 'questionable';
  if (['needs_verification', 'unknown', 'unverified'].includes(s)) return 'unknown';

  return 'unknown';
}

/**
 * Converts a UI filter value (which uses hyphens like "not-halal") to CanonicalStatus.
 */
export function filterToCanonical(filter: string): CanonicalStatus | 'all' {
  if (filter === 'all') return 'all';
  if (filter === 'not-halal') return 'not_halal';
  return filter as CanonicalStatus;
}
