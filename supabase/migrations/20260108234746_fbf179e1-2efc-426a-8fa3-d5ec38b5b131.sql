-- Step 1: Add default_status column to rx_meds
ALTER TABLE rx_meds 
ADD COLUMN IF NOT EXISTS default_status halal_status DEFAULT 'needs_verification';

-- Step 2: Create generic variants for each medication that doesn't have one
INSERT INTO rx_variants (rx_med_id, manufacturer, strength_text, dosage_form, notes)
SELECT 
  id,
  'Generic (Any Manufacturer)',
  NULL,
  dosage_forms[1],
  'Generic variant for manufacturer-agnostic verdict'
FROM rx_meds
WHERE id NOT IN (SELECT DISTINCT rx_med_id FROM rx_variants);

-- Step 3: Create initial verdicts for the new generic variants
INSERT INTO rx_verdicts (variant_id, status, confidence, summary_reason)
SELECT 
  v.id,
  'needs_verification',
  0,
  'Awaiting ingredient analysis'
FROM rx_variants v
WHERE v.id NOT IN (SELECT variant_id FROM rx_verdicts);