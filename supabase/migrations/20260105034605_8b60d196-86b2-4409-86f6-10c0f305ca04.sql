-- Add unique constraint on rx_meds.generic_name for upsert operations
ALTER TABLE rx_meds ADD CONSTRAINT rx_meds_generic_name_key UNIQUE (generic_name);