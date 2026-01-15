// Deterministic Verdict Engine
// Shared logic for OTC and Rx halal status determination

import type {
  VerdictEngineInput,
  VerdictOutput,
  IngredientInput,
  IngredientVerdict,
  VerdictReason,
  HalalStatus,
} from '@/types/verdict';

const CONFIDENCE_WEIGHTS = {
  BASE: 20,
  MANUFACTURER_SOURCE: 15,
  CERTIFIER_SOURCE: 20,
  REFERENCE_SOURCE: 10,
  VARIANT_SPECIFIC_DATA: 15,
  ALL_INGREDIENTS_SOURCED: 10,
  CERTIFICATION_PRESENT: 10,
  GENERIC_ASSUMPTION_PENALTY: -20,
  UNKNOWN_INGREDIENT_PENALTY: -10,
};

function evaluateIngredient(ingredient: IngredientInput): IngredientVerdict {
  const flags: string[] = [];
  let status: HalalStatus = 'halal';
  let concern: string | undefined;

  // Rule 1: Explicitly porcine-derived → Not Halal
  if (ingredient.isPorcine || ingredient.animalSource === 'porcine') {
    status = 'not_halal';
    concern = 'Porcine-derived ingredient';
    flags.push('porcine');
  }
  // Rule 2: Gelatin with unknown animal source → Questionable
  else if (ingredient.isGelatin && !ingredient.animalSourceKnown) {
    status = 'questionable';
    concern = 'Gelatin present but animal source unknown';
    flags.push('gelatin_unknown_source');
  }
  // Rule 2b: Gelatin from bovine without halal certification → Questionable
  else if (ingredient.isGelatin && ingredient.animalSource === 'bovine' && !ingredient.isCertified) {
    status = 'questionable';
    concern = 'Bovine gelatin without halal certification';
    flags.push('gelatin_uncertified');
  }
  // Rule 2c: Gelatin from fish or certified halal → Halal
  else if (ingredient.isGelatin && (ingredient.animalSource === 'fish' || ingredient.isCertified)) {
    status = 'halal';
    flags.push('gelatin_halal');
  }
  // Rule 3: Alcohol/ethanol evaluation
  else if (ingredient.isAlcohol) {
    if (ingredient.isDenatured || ingredient.isProcessingAid || ingredient.isTraceAmount) {
      status = 'halal';
      flags.push('alcohol_permissible');
    } else {
      status = 'questionable';
      concern = 'Ethanol/alcohol present - verify if trace, denatured, or processing aid';
      flags.push('alcohol_questionable');
    }
  }
  // Rule 4: High risk ingredient without resolution
  else if (ingredient.risk === 'high' && !ingredient.isCertified && !ingredient.sourceId) {
    status = 'questionable';
    concern = ingredient.defaultConcernReason || 'High-risk ingredient without verification';
    flags.push('high_risk_unverified');
  }
  // Rule 5: Medium risk ingredient
  else if (ingredient.risk === 'medium' && !ingredient.sourceId) {
    status = 'halal'; // Assume halal but note the risk
    concern = ingredient.defaultConcernReason;
    flags.push('medium_risk');
  }

  // Add source type flag
  if (ingredient.sourceType === 'manufacturer') flags.push('manufacturer_verified');
  if (ingredient.sourceType === 'certifier') flags.push('certifier_verified');
  if (ingredient.isCertified) flags.push('certified');

  return {
    ingredientId: ingredient.id,
    ingredientName: ingredient.name,
    role: ingredient.role,
    status,
    concern,
    sourceTitle: ingredient.sourceTitle,
    sourceUrl: ingredient.sourceUrl,
    notes: ingredient.notes,
    flags,
  };
}

function determineOverallStatus(
  ingredientVerdicts: IngredientVerdict[],
  hasInactiveIngredients: boolean
): HalalStatus {
  // HOTFIX: If no inactive ingredients are available, force unknown status
  // We cannot determine halal compliance without reviewing inactive ingredients
  if (!hasInactiveIngredients) {
    return 'unknown';
  }

  // Priority: not_halal > questionable > unknown > halal
  
  const hasNotHalal = ingredientVerdicts.some(v => v.status === 'not_halal');
  if (hasNotHalal) return 'not_halal';

  const hasQuestionable = ingredientVerdicts.some(v => v.status === 'questionable');
  if (hasQuestionable) return 'questionable';

  const hasUnknown = ingredientVerdicts.some(v => v.status === 'unknown');
  if (hasUnknown) return 'unknown';

  // If no ingredients, status is unknown
  if (ingredientVerdicts.length === 0) return 'unknown';

  return 'halal';
}

function calculateConfidence(
  ingredientVerdicts: IngredientVerdict[],
  input: VerdictEngineInput
): number {
  let confidence = CONFIDENCE_WEIGHTS.BASE;

  // Source quality bonuses
  const hasManufacturerSource = input.ingredients.some(i => i.sourceType === 'manufacturer');
  const hasCertifierSource = input.ingredients.some(i => i.sourceType === 'certifier');
  const hasReferenceSource = input.ingredients.some(i => i.sourceType === 'reference');
  const allIngredientsSourced = input.ingredients.every(i => i.sourceId);
  const hasCertification = input.ingredients.some(i => i.isCertified);

  if (hasManufacturerSource) confidence += CONFIDENCE_WEIGHTS.MANUFACTURER_SOURCE;
  if (hasCertifierSource) confidence += CONFIDENCE_WEIGHTS.CERTIFIER_SOURCE;
  if (hasReferenceSource) confidence += CONFIDENCE_WEIGHTS.REFERENCE_SOURCE;
  if (allIngredientsSourced) confidence += CONFIDENCE_WEIGHTS.ALL_INGREDIENTS_SOURCED;
  if (hasCertification) confidence += CONFIDENCE_WEIGHTS.CERTIFICATION_PRESENT;

  // Rx-specific: variant data bonus
  if (input.isRxVariant && input.hasVariantSpecificIngredients) {
    confidence += CONFIDENCE_WEIGHTS.VARIANT_SPECIFIC_DATA;
  }

  // Penalties
  const unsourcedCount = input.ingredients.filter(i => !i.sourceId).length;
  if (unsourcedCount > 0 && input.ingredients.length > 0) {
    const unsourcedRatio = unsourcedCount / input.ingredients.length;
    confidence += Math.round(CONFIDENCE_WEIGHTS.GENERIC_ASSUMPTION_PENALTY * unsourcedRatio);
  }

  const unknownVerdicts = ingredientVerdicts.filter(v => v.status === 'unknown').length;
  confidence += unknownVerdicts * CONFIDENCE_WEIGHTS.UNKNOWN_INGREDIENT_PENALTY;

  // Clamp to 0-100
  return Math.max(0, Math.min(100, confidence));
}

function generateReasons(
  ingredientVerdicts: IngredientVerdict[],
  status: HalalStatus
): VerdictReason[] {
  const reasons: VerdictReason[] = [];

  // Critical reasons (not halal)
  const porcineIngredients = ingredientVerdicts.filter(v => v.flags.includes('porcine'));
  porcineIngredients.forEach(v => {
    reasons.push({
      code: 'PORCINE_DERIVED',
      severity: 'critical',
      message: `${v.ingredientName} is porcine-derived and not permissible`,
      ingredientName: v.ingredientName,
      ingredientId: v.ingredientId,
    });
  });

  // Warning reasons (questionable)
  const gelatinUnknown = ingredientVerdicts.filter(v => v.flags.includes('gelatin_unknown_source'));
  gelatinUnknown.forEach(v => {
    reasons.push({
      code: 'GELATIN_UNKNOWN_SOURCE',
      severity: 'warning',
      message: `${v.ingredientName}: gelatin source not verified - could be animal-derived`,
      ingredientName: v.ingredientName,
      ingredientId: v.ingredientId,
    });
  });

  const gelatinUncertified = ingredientVerdicts.filter(v => v.flags.includes('gelatin_uncertified'));
  gelatinUncertified.forEach(v => {
    reasons.push({
      code: 'GELATIN_UNCERTIFIED',
      severity: 'warning',
      message: `${v.ingredientName}: bovine gelatin without halal slaughter certification`,
      ingredientName: v.ingredientName,
      ingredientId: v.ingredientId,
    });
  });

  const alcoholQuestionable = ingredientVerdicts.filter(v => v.flags.includes('alcohol_questionable'));
  alcoholQuestionable.forEach(v => {
    reasons.push({
      code: 'ALCOHOL_QUESTIONABLE',
      severity: 'warning',
      message: `${v.ingredientName}: alcohol content requires verification (trace/denatured/processing aid status unknown)`,
      ingredientName: v.ingredientName,
      ingredientId: v.ingredientId,
    });
  });

  const highRiskUnverified = ingredientVerdicts.filter(v => v.flags.includes('high_risk_unverified'));
  highRiskUnverified.forEach(v => {
    reasons.push({
      code: 'HIGH_RISK_UNVERIFIED',
      severity: 'warning',
      message: v.concern || `${v.ingredientName}: high-risk ingredient without verification`,
      ingredientName: v.ingredientName,
      ingredientId: v.ingredientId,
    });
  });

  // Info reasons (positive)
  const certified = ingredientVerdicts.filter(v => v.flags.includes('certified'));
  if (certified.length > 0) {
    reasons.push({
      code: 'HAS_CERTIFICATION',
      severity: 'info',
      message: `${certified.length} ingredient(s) have halal certification`,
    });
  }

  const manufacturerVerified = ingredientVerdicts.filter(v => v.flags.includes('manufacturer_verified'));
  if (manufacturerVerified.length > 0) {
    reasons.push({
      code: 'MANUFACTURER_VERIFIED',
      severity: 'info',
      message: `${manufacturerVerified.length} ingredient(s) verified via manufacturer documentation`,
    });
  }

  // Status-specific summary reasons
  if (status === 'halal' && reasons.filter(r => r.severity === 'info').length === 0) {
    reasons.push({
      code: 'ALL_CLEAR',
      severity: 'info',
      message: 'No concerning ingredients identified',
    });
  }

  if (status === 'unknown') {
    reasons.push({
      code: 'INSUFFICIENT_DATA',
      severity: 'warning',
      message: 'Insufficient ingredient data to make a determination',
    });
  }

  return reasons;
}

function generateReasonsWithInactiveCheck(
  ingredientVerdicts: IngredientVerdict[],
  status: HalalStatus,
  hasInactiveIngredients: boolean
): VerdictReason[] {
  const reasons = generateReasons(ingredientVerdicts, status);
  
  // Add specific reason when no inactive ingredients are available
  if (!hasInactiveIngredients) {
    // Remove any existing INSUFFICIENT_DATA reason to avoid duplication
    const filteredReasons = reasons.filter(r => r.code !== 'INSUFFICIENT_DATA');
    filteredReasons.unshift({
      code: 'NO_INACTIVE_INGREDIENTS',
      severity: 'warning',
      message: 'Inactive ingredient data is not available. Halal status cannot be determined without reviewing inactive ingredients (excipients).',
    });
    return filteredReasons;
  }

  return reasons;

  return reasons;
}

function generateSummary(status: HalalStatus, reasons: VerdictReason[]): string {
  switch (status) {
    case 'halal':
      return 'All ingredients have been verified as halal-compliant based on available sources and certifications.';
    
    case 'not_halal': {
      const criticalReasons = reasons.filter(r => r.severity === 'critical');
      const ingredients = criticalReasons.map(r => r.ingredientName).filter(Boolean).join(', ');
      return `Contains non-halal ingredient(s): ${ingredients || 'See details below'}.`;
    }
    
    case 'questionable': {
      const warningReasons = reasons.filter(r => r.severity === 'warning');
      if (warningReasons.some(r => r.code === 'GELATIN_UNKNOWN_SOURCE' || r.code === 'GELATIN_UNCERTIFIED')) {
        return 'Contains gelatin or animal-derived ingredients that require source verification. Contact manufacturer for confirmation.';
      }
      if (warningReasons.some(r => r.code === 'ALCOHOL_QUESTIONABLE')) {
        return 'Contains alcohol/ethanol that may require verification. Check if trace amount, denatured, or used as processing aid.';
      }
      return 'Some ingredients require additional verification. See breakdown for details.';
    }
    
    case 'unknown':
    default:
      return 'Insufficient data to determine halal status. Consider requesting a review or contacting the manufacturer.';
  }
}

export function evaluateVerdict(input: VerdictEngineInput): VerdictOutput {
  // Check for admin override first
  if (input.adminOverride?.status) {
    const ingredientVerdicts = input.ingredients.map(evaluateIngredient);
    return {
      status: input.adminOverride.status,
      confidence: input.adminOverride.confidence ?? 100,
      summaryReason: input.adminOverride.reason || `Status set by administrator`,
      reasons: [{
        code: 'ADMIN_OVERRIDE',
        severity: 'info',
        message: input.adminOverride.reason || 'Status manually set by administrator',
      }],
      ingredientVerdicts,
      hasAdminOverride: true,
      adminOverride: input.adminOverride,
      hasManufacturerSource: input.ingredients.some(i => i.sourceType === 'manufacturer'),
      hasCertifierSource: input.ingredients.some(i => i.sourceType === 'certifier'),
      hasVariantSpecificData: input.hasVariantSpecificIngredients ?? false,
      isGenericAssumption: !input.hasVariantSpecificIngredients && input.isRxVariant === true,
    };
  }

  // Evaluate each ingredient
  const ingredientVerdicts = input.ingredients.map(evaluateIngredient);

  // Check if there are any inactive ingredients
  // For Rx products, we need inactive ingredients to make a determination
  // For OTC products, if role is not specified, we assume ingredients include inactive ones
  const hasInactiveIngredients = input.isRxVariant 
    ? input.ingredients.some(i => i.role === 'inactive')
    : input.ingredients.length > 0; // OTC doesn't track roles, assume data is complete if present

  // Determine overall status
  const status = determineOverallStatus(ingredientVerdicts, hasInactiveIngredients);

  // Calculate confidence - lower confidence if no inactive ingredients
  let confidence = calculateConfidence(ingredientVerdicts, input);
  if (!hasInactiveIngredients && input.isRxVariant) {
    confidence = Math.min(confidence, 30); // Cap at 30% if no inactive ingredients
  }

  // Generate reasons with inactive ingredient check
  const reasons = generateReasonsWithInactiveCheck(ingredientVerdicts, status, hasInactiveIngredients);

  // Generate summary
  const summaryReason = hasInactiveIngredients 
    ? generateSummary(status, reasons)
    : 'Inactive ingredient (excipient) data is not available. Halal status cannot be determined without this information.';

  return {
    status,
    confidence,
    summaryReason,
    reasons,
    ingredientVerdicts,
    hasAdminOverride: false,
    hasManufacturerSource: input.ingredients.some(i => i.sourceType === 'manufacturer'),
    hasCertifierSource: input.ingredients.some(i => i.sourceType === 'certifier'),
    hasVariantSpecificData: input.hasVariantSpecificIngredients ?? false,
    isGenericAssumption: !input.hasVariantSpecificIngredients && input.isRxVariant === true,
  };
}

// Helper to convert DB data to engine input
export function mapDbIngredientsToInput(
  dbIngredients: Array<{
    ingredient_id: string;
    notes?: string | null;
    source_id?: string | null;
    role?: 'active' | 'inactive';
    ingredients: {
      id: string;
      name: string;
      risk: 'low' | 'medium' | 'high';
      default_concern_reason?: string | null;
      synonyms?: string[];
    };
    sources?: {
      id: string;
      title: string;
      source_type: 'manufacturer' | 'certifier' | 'reference';
      url?: string | null;
    } | null;
  }>
): IngredientInput[] {
  return dbIngredients.map(item => {
    const name = item.ingredients.name.toLowerCase();
    
    // Auto-detect ingredient flags based on name
    const isPorcine = /pork|porcine|swine|lard/.test(name);
    const isGelatin = /gelatin/.test(name);
    const isAlcohol = /alcohol|ethanol|ethyl alcohol/.test(name);
    
    return {
      id: item.ingredient_id,
      name: item.ingredients.name,
      role: item.role,
      risk: item.ingredients.risk,
      defaultConcernReason: item.ingredients.default_concern_reason ?? undefined,
      notes: item.notes ?? undefined,
      sourceId: item.source_id ?? undefined,
      sourceTitle: item.sources?.title,
      sourceUrl: item.sources?.url ?? undefined,
      sourceType: item.sources?.source_type,
      isPorcine,
      isGelatin,
      isAlcohol,
      // These would come from additional DB fields or admin annotations
      animalSourceKnown: false,
      isDenatured: false,
      isProcessingAid: false,
      isTraceAmount: false,
      isCertified: item.sources?.source_type === 'certifier',
    };
  });
}
