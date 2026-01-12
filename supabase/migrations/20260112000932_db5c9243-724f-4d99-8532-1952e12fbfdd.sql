-- Add FDA enrichment columns to rx_variants
ALTER TABLE rx_variants ADD COLUMN IF NOT EXISTS has_active_recall boolean DEFAULT false;
ALTER TABLE rx_variants ADD COLUMN IF NOT EXISTS recall_info jsonb;
ALTER TABLE rx_variants ADD COLUMN IF NOT EXISTS rxcui text;

-- Add warning/indication columns to rx_meds
ALTER TABLE rx_meds ADD COLUMN IF NOT EXISTS fda_warnings text[];
ALTER TABLE rx_meds ADD COLUMN IF NOT EXISTS fda_indications text;
ALTER TABLE rx_meds ADD COLUMN IF NOT EXISTS fda_contraindications text;
ALTER TABLE rx_meds ADD COLUMN IF NOT EXISTS fda_drug_interactions text[];