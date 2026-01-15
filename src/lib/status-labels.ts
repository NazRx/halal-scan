// Centralized status labels, tooltips, and confidence level utilities

export type UIStatus = 'halal' | 'questionable' | 'not-halal' | 'unknown';

// User-facing labels with emojis
export const STATUS_LABELS: Record<UIStatus, string> = {
  halal: '✅ Halal (Permissible)',
  questionable: '⚠️ Mashbooh (Questionable)',
  'not-halal': '🚫 Prohibited (Not Halal)',
  unknown: '❓ Unknown (Needs Verification)',
};

// Short labels for compact displays
export const STATUS_LABELS_SHORT: Record<UIStatus, string> = {
  halal: 'Halal (Permissible)',
  questionable: 'Mashbooh (Questionable)',
  'not-halal': 'Prohibited (Not Halal)',
  unknown: 'Unknown (Needs Verification)',
};

// Tooltips explaining each status
export const STATUS_TOOLTIPS: Record<UIStatus, string> = {
  halal: 'Based on available ingredient data, no flagged ingredients were detected. Manufacturer excipients may still vary.',
  questionable: 'Contains ingredients that are often animal-derived or not fully disclosed (e.g., gelatin, glycerin, magnesium stearate).',
  'not-halal': 'Contains a clearly prohibited ingredient (e.g., explicitly porcine-derived ingredient). If medically necessary and no alternative exists, necessity may apply.',
  unknown: 'Not enough ingredient data was available to confirm. Check manufacturer/NDC or consult your pharmacist.',
};

// Confidence level thresholds
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 70) return 'high';
  if (confidence >= 40) return 'medium';
  return 'low';
}

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  low: 'Low Confidence',
  medium: 'Medium Confidence',
  high: 'High Confidence',
};

export const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  low: 'text-status-not-halal',
  medium: 'text-status-questionable',
  high: 'text-status-halal',
};

// Map internal engine status to UI status
export function toUiStatus(status: string): UIStatus {
  if (status === 'not_halal' || status === 'haram') return 'not-halal';
  if (status === 'mushbooh') return 'questionable';
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
