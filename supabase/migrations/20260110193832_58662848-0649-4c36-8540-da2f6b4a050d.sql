-- Add tracking columns to rx_variants for FDA/DailyMed data
ALTER TABLE rx_variants 
ADD COLUMN IF NOT EXISTS labeler_code TEXT,
ADD COLUMN IF NOT EXISTS spl_set_id TEXT,
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'manual';

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_rx_variants_manufacturer 
ON rx_variants(manufacturer);

CREATE INDEX IF NOT EXISTS idx_rx_variants_rx_med_id 
ON rx_variants(rx_med_id);

CREATE INDEX IF NOT EXISTS idx_rx_variants_labeler_code 
ON rx_variants(labeler_code);