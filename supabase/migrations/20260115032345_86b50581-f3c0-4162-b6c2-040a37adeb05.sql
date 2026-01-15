-- Add new columns to rx_meds for DailyMed SPL data integration
ALTER TABLE public.rx_meds
ADD COLUMN IF NOT EXISTS ndc text,
ADD COLUMN IF NOT EXISTS dailymed_set_id text,
ADD COLUMN IF NOT EXISTS active_ingredients text[],
ADD COLUMN IF NOT EXISTS inactive_ingredients text[],
ADD COLUMN IF NOT EXISTS confidence_level text,
ADD COLUMN IF NOT EXISTS status_reason text,
ADD COLUMN IF NOT EXISTS spl_last_fetched_at timestamp with time zone;

-- Add indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_rx_meds_ndc ON public.rx_meds(ndc);
CREATE INDEX IF NOT EXISTS idx_rx_meds_dailymed_set_id ON public.rx_meds(dailymed_set_id);