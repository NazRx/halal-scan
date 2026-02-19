// OTC-Specific Verdict Engine
// Deterministic scoring for OTC products based on formulation data

export type OtcStatus = 'likely_halal' | 'use_caution' | 'unknown' | 'likely_haram';

export interface OtcIngredientProfile {
  id: string;
  otc_product_id: string;
  active_ingredients: Array<{ name: string; strength?: string; notes?: string }> | null;
  dosage_form: string | null;
  route: string | null;
  flags: OtcRiskFlags | null;
  risk_ingredients: Array<{ ingredient: string; risk_tag: string; note?: string }> | null;
  default_status: OtcStatus | null;
  rationale_short: string | null;
  rationale_long: string | null;
  sources: Array<{ label: string; url?: string; note?: string }> | null;
  created_at: string;
  updated_at: string;
}

export interface OtcRiskFlags {
  contains_alcohol?: boolean;
  contains_gelatin?: boolean;
  contains_glycerin?: boolean;
  contains_flavoring?: boolean;
  contains_colorants?: boolean;
  contains_lactose?: boolean;
  contains_magnesium_stearate?: boolean;
  contains_shellac?: boolean;
  contains_carmine?: boolean;
  contains_enzymes?: boolean;
}

export interface OtcSignal {
  label: string;
  impact: 'positive' | 'negative' | 'neutral';
  detail?: string;
}

export interface OtcVerdictOutput {
  status: OtcStatus;
  confidence: number; // 0-95 (never 100)
  signals: OtcSignal[];
  rationaleShort: string;
  rationaleLong?: string;
  lastUpdated?: string;
  hasProfile: boolean;
  nextSteps: string[];
}

// Confidence modifiers
const DOSAGE_FORM_MODIFIERS: Record<string, number> = {
  'tablet': 10,
  'caplet': 10,
  'capsule': 5,
  'liquid': -15,
  'syrup': -15,
  'solution': -10,
  'suspension': -10,
  'gelcap': -20,
  'softgel': -20,
  'gummy': -25,
  'gummies': -25,
  'cream': 5,
  'ointment': 5,
  'lotion': 0,
  'topical': 5,
  'inhalation': -5,
  'nasal spray': -5,
  'spray': -5,
  'powder': 0,
  'chewable': -10,
  'drops': -10,
};

const RISK_FLAG_PENALTIES: Record<keyof OtcRiskFlags, number> = {
  contains_alcohol: -35,
  contains_gelatin: -30,
  contains_carmine: -30,
  contains_shellac: -20,
  contains_enzymes: -15,
  contains_glycerin: -10,
  contains_magnesium_stearate: -10,
  contains_flavoring: -10,
  contains_lactose: -5,
  contains_colorants: -5,
};

function getDosageFormModifier(dosageForm: string | null): number {
  if (!dosageForm) return 0;
  const normalized = dosageForm.toLowerCase().trim();
  return DOSAGE_FORM_MODIFIERS[normalized] ?? 0;
}

function calculateFlagPenalties(flags: OtcRiskFlags | null): { 
  penalty: number; 
  triggeredFlags: Array<keyof OtcRiskFlags>;
} {
  if (!flags) return { penalty: 0, triggeredFlags: [] };
  
  let penalty = 0;
  const triggeredFlags: Array<keyof OtcRiskFlags> = [];
  
  for (const [key, value] of Object.entries(flags)) {
    if (value === true && key in RISK_FLAG_PENALTIES) {
      penalty += RISK_FLAG_PENALTIES[key as keyof OtcRiskFlags];
      triggeredFlags.push(key as keyof OtcRiskFlags);
    }
  }
  
  return { penalty, triggeredFlags };
}

function calculateUnknownsPenalty(
  riskIngredients: OtcIngredientProfile['risk_ingredients'],
  dosageForm: string | null,
  activeIngredients: OtcIngredientProfile['active_ingredients']
): number {
  let penalty = 0;
  
  if (riskIngredients && riskIngredients.length >= 3) {
    penalty -= 10;
  }
  
  if (!dosageForm) {
    penalty -= 5;
  }
  
  if (!activeIngredients || activeIngredients.length === 0) {
    penalty -= 10;
  }
  
  return penalty;
}

function determineStatus(
  confidence: number,
  flags: OtcRiskFlags | null,
  dosageForm: string | null
): OtcStatus {
  const normalizedForm = dosageForm?.toLowerCase() || '';
  const isHighRiskForm = ['gelcap', 'softgel', 'gummy', 'gummies'].includes(normalizedForm);
  
  // Check for definite haram indicators
  const hasCarmine = flags?.contains_carmine === true;
  const hasGelatin = flags?.contains_gelatin === true;
  
  if ((hasCarmine || hasGelatin) && isHighRiskForm) {
    return 'likely_haram';
  }
  
  // Check for major flags
  const hasMajorFlag = hasCarmine || hasGelatin || 
    flags?.contains_alcohol === true || 
    flags?.contains_shellac === true;
  
  // Determine status based on confidence and flags
  if (confidence >= 80 && !hasMajorFlag) {
    return 'likely_halal';
  }
  
  if ((confidence >= 55 && confidence < 80) || hasMajorFlag) {
    return 'use_caution';
  }
  
  return 'unknown';
}

function generateSignals(
  flags: OtcRiskFlags | null,
  triggeredFlags: Array<keyof OtcRiskFlags>,
  dosageForm: string | null,
  riskIngredients: OtcIngredientProfile['risk_ingredients']
): OtcSignal[] {
  const signals: OtcSignal[] = [];
  const normalizedForm = dosageForm?.toLowerCase() || '';
  
  // Positive signals for safe forms
  if (['tablet', 'caplet'].includes(normalizedForm)) {
    signals.push({
      label: 'Tablet/caplet form',
      impact: 'positive',
      detail: 'Tablets typically have fewer animal-derived excipients than softgels or gummies.'
    });
  }
  
  if (['cream', 'ointment', 'topical'].includes(normalizedForm)) {
    signals.push({
      label: 'Topical form',
      impact: 'positive',
      detail: 'Topical products are generally lower risk for halal concerns.'
    });
  }
  
  // Negative signals from flags
  if (triggeredFlags.includes('contains_gelatin')) {
    signals.push({
      label: 'Contains gelatin',
      impact: 'negative',
      detail: 'Gelatin source is typically animal-derived and may not be halal.'
    });
  }
  
  if (triggeredFlags.includes('contains_alcohol')) {
    signals.push({
      label: 'Contains alcohol',
      impact: 'negative',
      detail: 'May contain ethanol; verify if trace amount or denatured.'
    });
  }
  
  if (triggeredFlags.includes('contains_carmine')) {
    signals.push({
      label: 'Contains carmine',
      impact: 'negative',
      detail: 'Carmine (E120) is derived from insects and not halal.'
    });
  }
  
  if (triggeredFlags.includes('contains_shellac')) {
    signals.push({
      label: 'Contains shellac',
      impact: 'negative',
      detail: 'Shellac is derived from insects; halal status is debated.'
    });
  }
  
  if (triggeredFlags.includes('contains_glycerin')) {
    signals.push({
      label: 'Contains glycerin',
      impact: 'neutral',
      detail: 'Glycerin source unknown; could be plant or animal-derived.'
    });
  }
  
  if (triggeredFlags.includes('contains_magnesium_stearate')) {
    signals.push({
      label: 'Contains magnesium stearate',
      impact: 'neutral',
      detail: 'Source unknown; may be plant or animal-derived.'
    });
  }
  
  if (triggeredFlags.includes('contains_enzymes')) {
    signals.push({
      label: 'Contains enzymes',
      impact: 'neutral',
      detail: 'Enzyme source varies; may be animal, plant, or microbial.'
    });
  }
  
  // Form-based negative signals
  if (['gelcap', 'softgel'].includes(normalizedForm)) {
    signals.push({
      label: 'Softgel/gelcap form',
      impact: 'negative',
      detail: 'Softgel capsules often contain animal-derived gelatin.'
    });
  }
  
  if (['gummy', 'gummies'].includes(normalizedForm)) {
    signals.push({
      label: 'Gummy form',
      impact: 'negative',
      detail: 'Gummies typically contain gelatin unless labeled plant-based.'
    });
  }
  
  if (['liquid', 'syrup'].includes(normalizedForm)) {
    signals.push({
      label: 'Liquid formulation',
      impact: 'neutral',
      detail: 'Liquids may contain alcohol or glycerin; check inactive ingredients.'
    });
  }
  
  // Sort by impact: negative first, then neutral, then positive
  const impactOrder = { negative: 0, neutral: 1, positive: 2 };
  signals.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);
  
  return signals;
}

function generateRationale(
  status: OtcStatus,
  dosageForm: string | null,
  signals: OtcSignal[],
  hasProfile: boolean
): { short: string; long?: string } {
  const formName = dosageForm || 'this product';
  
  if (!hasProfile) {
    return {
      short: "We don't yet have the formulation details for this specific OTC product.",
      long: "This product hasn't been analyzed yet. Without knowing the inactive ingredients, we can't determine its halal status with confidence. You can help by sharing the ingredient list from the package."
    };
  }
  
  switch (status) {
    case 'likely_halal':
      return {
        short: `Based on typical ${formName} formulations with no common high-risk excipients detected.`,
        long: `This ${formName} formulation appears to be halal-compliant based on available ingredient data. No animal-derived ingredients or alcohol concerns were identified. However, formulations can vary by brand and batch.`
      };
    
    case 'use_caution': {
      const negativeSignals = signals.filter(s => s.impact === 'negative');
      const concerns = negativeSignals.slice(0, 2).map(s => s.label.toLowerCase()).join(' and ');
      return {
        short: concerns 
          ? `This formulation may include ${concerns} with sourcing concerns.`
          : 'This formulation may include ingredients with animal or alcohol sourcing concerns.',
        long: `Caution is advised for this ${formName}. Some ingredients may have animal-derived or alcohol-based sources. The specific concern(s): ${negativeSignals.map(s => s.detail).join(' ')}`
      };
    }
    
    case 'likely_haram': {
      const haramSignals = signals.filter(s => s.impact === 'negative');
      return {
        short: 'Common high-risk excipients are present in this formulation (e.g., gelatin/carmine) and sourcing is unlikely to be halal.',
        long: `This ${formName} contains ingredients that are typically not halal: ${haramSignals.map(s => s.label).join(', ')}. These ingredients are often animal-derived without halal certification.`
      };
    }
    
    case 'unknown':
    default:
      return {
        short: 'Key formulation details are missing or unclear for this product.',
        long: 'We have partial information about this product, but not enough to make a confident determination. Consider checking the package label or contacting the manufacturer.'
      };
  }
}

function generateNextSteps(
  status: OtcStatus,
  dosageForm: string | null,
  flags: OtcRiskFlags | null,
  hasProfile: boolean
): string[] {
  const steps: string[] = [];
  const normalizedForm = dosageForm?.toLowerCase() || '';
  
  if (status === 'likely_halal') {
    // Minimal steps for likely halal products
    steps.push('Verify by checking the package for any formulation changes.');
    return steps;
  }
  
  // Always suggest checking the package
  if (['liquid', 'syrup', 'gelcap', 'softgel', 'gummy', 'gummies'].includes(normalizedForm)) {
    steps.push("Check the package 'Inactive ingredients' list — liquids/softgels/gummies vary most.");
  } else {
    steps.push("Check the package 'Inactive ingredients' list for the full formulation.");
  }
  
  // Form-based suggestion
  if (['gelcap', 'softgel', 'gummy', 'gummies', 'liquid'].includes(normalizedForm)) {
    steps.push('Prefer tablets/caplets when possible — they often have fewer animal-derived excipients than softgels/gummies.');
  }
  
  // Contribution prompt
  if (!hasProfile || status === 'unknown') {
    steps.push('If you share the inactive ingredient list, we can reassess with higher confidence.');
  }
  
  // Medical priority reminder
  if (status === 'unknown' || status === 'use_caution') {
    steps.push('If this is for a child or urgent need, prioritize medical safety first and consult your clinician.');
  }
  
  return steps;
}

/**
 * Compute OTC verdict based on product info and optional ingredient profile
 */
export function computeOtcVerdict(
  product: {
    id: string;
    name: string;
    display_name?: string | null;
    generic_name?: string;
    dosage_form?: string | null;
    route?: string | null;
  },
  profile?: OtcIngredientProfile | null
): OtcVerdictOutput {
  const hasProfile = !!profile;
  
  // Use profile data if available, otherwise fall back to product data
  const dosageForm = profile?.dosage_form || product.dosage_form || null;
  const flags = profile?.flags || null;
  const riskIngredients = profile?.risk_ingredients || null;
  const activeIngredients = profile?.active_ingredients || null;
  
  // If admin has set a default status, use it (but still compute confidence)
  const adminStatus = profile?.default_status;
  
  // Start with base confidence
  let confidence = 70;
  
  // Apply dosage form modifier
  confidence += getDosageFormModifier(dosageForm);
  
  // Apply flag penalties
  const { penalty: flagPenalty, triggeredFlags } = calculateFlagPenalties(flags);
  confidence += flagPenalty;
  
  // Apply unknowns penalty
  confidence += calculateUnknownsPenalty(riskIngredients, dosageForm, activeIngredients);
  
  // No profile = lower baseline confidence
  if (!hasProfile) {
    confidence = Math.min(confidence, 40); // Cap at 40 without profile data
    confidence = Math.max(25, confidence); // Floor at 25
  }
  
  // Clamp confidence to 0-95
  confidence = Math.min(95, Math.max(0, Math.round(confidence)));
  
  // For likely_haram, cap confidence at 50
  const preStatus = adminStatus || determineStatus(confidence, flags, dosageForm);
  if (preStatus === 'likely_haram') {
    confidence = Math.min(50, confidence);
  }
  
  // Determine final status
  const status = adminStatus || determineStatus(confidence, flags, dosageForm);
  
  // Generate signals
  const signals = hasProfile 
    ? generateSignals(flags, triggeredFlags, dosageForm, riskIngredients)
    : generateSignals(null, [], dosageForm, null);
  
  // Generate rationale
  const rationale = profile?.rationale_short 
    ? { short: profile.rationale_short, long: profile.rationale_long || undefined }
    : generateRationale(status, dosageForm, signals, hasProfile);
  
  // Generate next steps
  const nextSteps = generateNextSteps(status, dosageForm, flags, hasProfile);
  
  return {
    status,
    confidence,
    signals,
    rationaleShort: rationale.short,
    rationaleLong: rationale.long,
    lastUpdated: profile?.updated_at,
    hasProfile,
    nextSteps,
  };
}

// Status label mapping for UI — AmanahRx neutral language
export const OTC_STATUS_LABELS: Record<OtcStatus, string> = {
  likely_halal: 'No Flagged Concerns Identified',
  use_caution: 'Contains Ingredients Commonly Questioned',
  unknown: 'Insufficient Public Disclosure',
  likely_haram: 'Contains Ingredients Commonly Questioned',
};

// Status colors for UI — neutral palette
export const OTC_STATUS_COLORS: Record<OtcStatus, { bg: string; text: string; border: string }> = {
  likely_halal: {
    bg: 'bg-muted',
    text: 'text-foreground',
    border: 'border-border',
  },
  use_caution: {
    bg: 'bg-muted',
    text: 'text-foreground',
    border: 'border-border',
  },
  unknown: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
  },
  likely_haram: {
    bg: 'bg-muted',
    text: 'text-foreground',
    border: 'border-border',
  },
};

// Status icons for UI
export const OTC_STATUS_ICONS = {
  likely_halal: 'Search',
  use_caution: 'AlertTriangle',
  unknown: 'HelpCircle',
  likely_haram: 'Info',
} as const;

