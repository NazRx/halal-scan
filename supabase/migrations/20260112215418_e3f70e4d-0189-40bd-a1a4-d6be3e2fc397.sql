-- Add classification rationale to rx_verdicts for per-NDC reasoning
ALTER TABLE rx_verdicts ADD COLUMN classification_rationale text;

-- Add promotional fields to rx_variants for future sponsored listings
ALTER TABLE rx_variants ADD COLUMN is_promoted boolean DEFAULT false;
ALTER TABLE rx_variants ADD COLUMN promoted_until timestamptz;

-- Add comment for clarity
COMMENT ON COLUMN rx_verdicts.classification_rationale IS 'Specific reasoning for halal classification decision (premium feature)';
COMMENT ON COLUMN rx_variants.is_promoted IS 'Whether this variant is a promoted/sponsored listing';
COMMENT ON COLUMN rx_variants.promoted_until IS 'Expiration date for promotional status';