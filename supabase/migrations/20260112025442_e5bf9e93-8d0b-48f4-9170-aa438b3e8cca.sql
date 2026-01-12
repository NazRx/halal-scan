-- Add brand and marketing category columns to rx_variants
ALTER TABLE rx_variants ADD COLUMN IF NOT EXISTS is_brand boolean DEFAULT false;
ALTER TABLE rx_variants ADD COLUMN IF NOT EXISTS marketing_category text;