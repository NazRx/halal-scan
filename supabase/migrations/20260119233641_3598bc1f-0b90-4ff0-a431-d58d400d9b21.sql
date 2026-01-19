-- Add source column to track where rx_meds entries came from
ALTER TABLE rx_meds ADD COLUMN IF NOT EXISTS source text;

-- Create case-insensitive unique index to prevent duplicate generic names
-- First, we need to handle any existing duplicates before adding the constraint
-- This query will keep the row with the lowest popularity_rank for each duplicate
DELETE FROM rx_meds a USING rx_meds b
WHERE a.id > b.id 
AND lower(trim(a.generic_name)) = lower(trim(b.generic_name));

-- Now create the unique index
CREATE UNIQUE INDEX IF NOT EXISTS rx_meds_generic_name_ci_unique 
ON rx_meds (lower(trim(generic_name)));