ALTER TABLE public.otc_products ADD COLUMN IF NOT EXISTS default_status text DEFAULT 'unknown';

-- Backfill from otc_ingredient_profiles where available
UPDATE public.otc_products op
SET default_status = oip.default_status
FROM public.otc_ingredient_profiles oip
WHERE oip.otc_product_id = op.id
  AND oip.default_status IS NOT NULL
  AND op.default_status IS NULL OR op.default_status = 'unknown';