-- Add hydrate_attempts and last_hydrate_error columns to rx_meds
-- These track retry attempts for meds that repeatedly return "no inactive ingredients"

ALTER TABLE public.rx_meds
ADD COLUMN IF NOT EXISTS hydrate_attempts integer NOT NULL DEFAULT 0;

ALTER TABLE public.rx_meds
ADD COLUMN IF NOT EXISTS last_hydrate_error text;

-- Add index for efficient querying of unhydrated meds
CREATE INDEX IF NOT EXISTS idx_rx_meds_hydrate_attempts ON public.rx_meds(hydrate_attempts);

-- Add comment for clarity
COMMENT ON COLUMN public.rx_meds.hydrate_attempts IS 'Number of hydration attempts - after 2 failed attempts with no inactive ingredients, med is marked terminal';
COMMENT ON COLUMN public.rx_meds.last_hydrate_error IS 'Last error or status message from hydration attempt';