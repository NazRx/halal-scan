-- 1. Update halal_status enum with new terminology
ALTER TYPE halal_status RENAME TO halal_status_old;

CREATE TYPE halal_status AS ENUM ('halal', 'mushbooh', 'haram', 'needs_verification');

-- Update rx_verdicts
ALTER TABLE rx_verdicts 
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE halal_status USING (
    CASE status::text
      WHEN 'halal' THEN 'halal'::halal_status
      WHEN 'questionable' THEN 'mushbooh'::halal_status
      WHEN 'not_halal' THEN 'haram'::halal_status
      WHEN 'unknown' THEN 'needs_verification'::halal_status
    END
  ),
  ALTER COLUMN status SET DEFAULT 'needs_verification'::halal_status;

-- Update otc_verdicts
ALTER TABLE otc_verdicts 
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE halal_status USING (
    CASE status::text
      WHEN 'halal' THEN 'halal'::halal_status
      WHEN 'questionable' THEN 'mushbooh'::halal_status
      WHEN 'not_halal' THEN 'haram'::halal_status
      WHEN 'unknown' THEN 'needs_verification'::halal_status
    END
  ),
  ALTER COLUMN status SET DEFAULT 'needs_verification'::halal_status;

DROP TYPE halal_status_old;

-- 2. Extend ingredients table for ruling data
ALTER TABLE ingredients
  ADD COLUMN IF NOT EXISTS default_status halal_status DEFAULT 'needs_verification',
  ADD COLUMN IF NOT EXISTS what_would_verify text,
  ADD COLUMN IF NOT EXISTS risk_tags text[];

-- 3. Extend rx_meds for medication metadata
ALTER TABLE rx_meds
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS rx_otc text DEFAULT 'Rx',
  ADD COLUMN IF NOT EXISTS dosage_forms text[];

-- 4. Extend verdict tables for report content
ALTER TABLE rx_verdicts
  ADD COLUMN IF NOT EXISTS clinical_breakdown text,
  ADD COLUMN IF NOT EXISTS halal_alternatives text[],
  ADD COLUMN IF NOT EXISTS pharmacist_note text,
  ADD COLUMN IF NOT EXISTS darura_context text;

ALTER TABLE otc_verdicts
  ADD COLUMN IF NOT EXISTS clinical_breakdown text,
  ADD COLUMN IF NOT EXISTS halal_alternatives text[],
  ADD COLUMN IF NOT EXISTS pharmacist_note text,
  ADD COLUMN IF NOT EXISTS darura_context text;

-- 5. Create saved_reports table for user bookmarks
CREATE TABLE IF NOT EXISTS saved_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('rx', 'otc')),
  rx_verdict_id uuid REFERENCES rx_verdicts(id) ON DELETE CASCADE,
  otc_verdict_id uuid REFERENCES otc_verdicts(id) ON DELETE CASCADE,
  saved_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  CONSTRAINT valid_verdict_ref CHECK (
    (report_type = 'rx' AND rx_verdict_id IS NOT NULL AND otc_verdict_id IS NULL) OR
    (report_type = 'otc' AND otc_verdict_id IS NOT NULL AND rx_verdict_id IS NULL)
  )
);

ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved reports"
  ON saved_reports FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can save reports"
  ON saved_reports FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own saved reports"
  ON saved_reports FOR DELETE
  USING (user_id = auth.uid());

-- 6. Add index for search performance
CREATE INDEX IF NOT EXISTS idx_rx_meds_generic_name ON rx_meds USING gin(to_tsvector('english', generic_name));
CREATE INDEX IF NOT EXISTS idx_rx_meds_brand_names ON rx_meds USING gin(brand_names);
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_ingredients_synonyms ON ingredients USING gin(synonyms);