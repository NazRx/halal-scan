// Centralized status labels, tooltips, and confidence level utilities

export type UIStatus = 'halal' | 'questionable' | 'not-halal' | 'unknown';

// User-facing labels with emojis - Updated per engine rules
export const STATUS_LABELS: Record<UIStatus, string> = {
  halal: '✅ Likely Halal',
  questionable: '⚠️ Uncertain',
  'not-halal': '🚫 Not Halal',
  unknown: '❓ Unknown',
};

// Short labels for compact displays
export const STATUS_LABELS_SHORT: Record<UIStatus, string> = {
  halal: 'Likely Halal',
  questionable: 'Uncertain',
  'not-halal': 'Not Halal',
  unknown: 'Unknown',
};

// Tooltips explaining each status
export const STATUS_TOOLTIPS: Record<UIStatus, string> = {
  halal: 'Based on available ingredient data, no flagged ingredients were detected. Manufacturer excipients may still vary.',
  questionable: 'Contains ingredients that are often animal-derived or sourcing is unclear. More verification needed.',
  'not-halal': 'Contains a clearly prohibited ingredient (e.g., explicitly porcine-derived). If medically necessary and no alternative exists, necessity (darura) may apply.',
  unknown: 'Not enough ingredient data was available to confirm. Check manufacturer/NDC or consult your pharmacist.',
};

// Confidence level thresholds
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 80) return 'high';
  if (confidence >= 50) return 'medium';
  return 'low';
}

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  low: 'Low Confidence',
  medium: 'Moderate Confidence',
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
