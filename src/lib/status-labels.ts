// Centralized status labels, tooltips, and confidence level utilities
// AmanahRx: All user-facing labels use neutral, research-based language.
// Internal statuses (halal/questionable/not-halal/unknown) are kept for logic only.

export type UIStatus = 'halal' | 'questionable' | 'not-halal' | 'unknown';

// User-facing labels — neutral, research-based
export const STATUS_LABELS: Record<UIStatus, string> = {
  halal: 'No Flagged Concerns Identified',
  questionable: 'Contains Ingredients Commonly Questioned',
  'not-halal': 'Insufficient Public Disclosure',
  unknown: 'Insufficient Public Disclosure',
};

// Short labels for compact displays
export const STATUS_LABELS_SHORT: Record<UIStatus, string> = {
  halal: 'No Flagged Concerns',
  questionable: 'Commonly Questioned',
  'not-halal': 'Flagged Concerns',
  unknown: 'Unverified',
};

// Tooltips explaining each status
export const STATUS_TOOLTIPS: Record<UIStatus, string> = {
  halal: 'Based on available public ingredient data, no commonly questioned ingredients were identified. Formulations may vary by manufacturer and batch.',
  questionable: 'This formulation contains one or more ingredients commonly discussed in Islamic dietary law. Origin or sourcing is unclear from public data. Scholarly opinions differ.',
  'not-halal': 'Available data indicates the presence of ingredients with known sourcing concerns. In cases of medical necessity, scholarly guidance on necessity (darura) may apply.',
  unknown: 'Insufficient public ingredient data is available to assess this formulation. Consult your pharmacist or the manufacturer for complete ingredient information.',
};

// Disclosure level for research summary display
export type DisclosureLevel = 'high' | 'moderate' | 'limited';

export const DISCLOSURE_LABELS: Record<DisclosureLevel, string> = {
  high: 'High',
  moderate: 'Moderate',
  limited: 'Limited',
};

export const DISCLOSURE_DESCRIPTIONS: Record<DisclosureLevel, string> = {
  high: 'Manufacturer ingredient data is publicly available with source documentation.',
  moderate: 'Partial ingredient information is available. Some excipients may not be fully disclosed.',
  limited: 'Insufficient public information is available to assess this formulation.',
};

// Map confidence score to disclosure level (replacing old "confidence" tier labels)
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 80) return 'high';
  if (confidence >= 50) return 'medium';
  return 'low';
}

export function getDisclosureLevel(confidence: number): DisclosureLevel {
  if (confidence >= 80) return 'high';
  if (confidence >= 50) return 'moderate';
  return 'limited';
}

// Map internal engine status to UI status
export function toUiStatus(status: string): UIStatus {
  if (status === 'not_halal' || status === 'haram') return 'not-halal';
  if (status === 'mushbooh' || status === 'questionable') return 'questionable';
  if (status === 'halal') return 'halal';
  return 'unknown';
}

// Map database status to UI status
export function mapDbStatus(dbStatus: string | null | undefined): UIStatus {
  if (!dbStatus) return 'unknown';
  if (dbStatus === 'halal') return 'halal';
  if (dbStatus === 'mushbooh') return 'questionable';
  if (dbStatus === 'haram') return 'not-halal';
  return 'unknown';
}
