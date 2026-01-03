// Verdict Engine Types

export type HalalStatus = 'halal' | 'questionable' | 'not_halal' | 'unknown';
export type RiskLevel = 'low' | 'medium' | 'high';
export type IngredientRole = 'active' | 'inactive';

export interface IngredientInput {
  id: string;
  name: string;
  role?: IngredientRole; // For Rx meds
  risk: RiskLevel;
  defaultConcernReason?: string;
  notes?: string;
  sourceId?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  sourceType?: 'manufacturer' | 'certifier' | 'reference';
  
  // Flags for verdict logic
  isPorcine?: boolean;
  isGelatin?: boolean;
  isAlcohol?: boolean;
  animalSourceKnown?: boolean;
  animalSource?: string; // e.g., "bovine", "porcine", "fish"
  isDenatured?: boolean;
  isProcessingAid?: boolean;
  isTraceAmount?: boolean;
  isCertified?: boolean;
  certificationBody?: string;
}

export interface AdminOverride {
  status?: HalalStatus;
  confidence?: number;
  reason?: string;
  overriddenBy?: string;
  overriddenAt?: Date;
}

export interface VerdictReason {
  code: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  ingredientName?: string;
  ingredientId?: string;
}

export interface IngredientVerdict {
  ingredientId: string;
  ingredientName: string;
  role?: IngredientRole;
  status: HalalStatus;
  concern?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  notes?: string;
  flags: string[];
}

export interface VerdictOutput {
  status: HalalStatus;
  confidence: number; // 0-100
  summaryReason: string;
  reasons: VerdictReason[];
  ingredientVerdicts: IngredientVerdict[];
  hasAdminOverride: boolean;
  adminOverride?: AdminOverride;
  
  // Metadata
  hasManufacturerSource: boolean;
  hasCertifierSource: boolean;
  hasVariantSpecificData: boolean; // For Rx
  isGenericAssumption: boolean;
}

export interface VerdictEngineInput {
  ingredients: IngredientInput[];
  adminOverride?: AdminOverride;
  isRxVariant?: boolean; // Changes confidence scoring
  hasVariantSpecificIngredients?: boolean;
}
