export type OtcReviewCardTone = 'neutral' | 'caution';

export type OtcReviewCard = {
  id: string;
  title: string;
  subtitle?: string;
  tone: OtcReviewCardTone;
  body: string;
  bullets?: string[];
  footerNote?: string;
};

export type OtcSignalTagKey =
  | 'publishes_ingredient_list'
  | 'varies_by_brand'
  | 'contract_manufactured'
  | 'gelatin_commonly_used'
  | 'alcohol_sometimes_used';

export type OtcSignalTag = {
  key: OtcSignalTagKey;
  label: string;
  tooltipFree: string;
  // Pro-only expansion content:
  proTitle: string;
  proBody: string;
  proEvidenceNote?: string;
};
