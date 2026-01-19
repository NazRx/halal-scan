-- Step 1: Add popularity_rank column to rx_meds for tiered manufacturer seeding
ALTER TABLE public.rx_meds 
ADD COLUMN IF NOT EXISTS popularity_rank integer;

-- Step 2: Create index for efficient ordering by rank
CREATE INDEX IF NOT EXISTS idx_rx_meds_popularity_rank 
ON public.rx_meds (popularity_rank ASC NULLS LAST, generic_name ASC);

-- Step 3: Initialize popularity_rank for existing rx_meds based on current order
WITH ranked AS (
  SELECT id, 
         ROW_NUMBER() OVER (ORDER BY generic_name ASC) as rn
  FROM public.rx_meds
  WHERE popularity_rank IS NULL
)
UPDATE public.rx_meds m
SET popularity_rank = r.rn
FROM ranked r
WHERE m.id = r.id;

-- Step 4: Deduplicate rx_variants BEFORE adding normalized column
-- Use manufacturer field directly with normalization expression
WITH ranked_variants AS (
  SELECT 
    id,
    rx_med_id,
    lower(trim(regexp_replace(COALESCE(manufacturer, ''), '\s+', ' ', 'g'))) as norm_mfr,
    ROW_NUMBER() OVER (
      PARTITION BY rx_med_id, lower(trim(regexp_replace(COALESCE(manufacturer, ''), '\s+', ' ', 'g')))
      ORDER BY 
        COALESCE(array_length(ndc_list, 1), 0) DESC,
        spl_set_id IS NOT NULL DESC,
        created_at ASC
    ) as rn
  FROM public.rx_variants
  WHERE manufacturer IS NOT NULL AND manufacturer != ''
),
duplicates_to_delete AS (
  SELECT id FROM ranked_variants WHERE rn > 1
)
DELETE FROM public.rx_variants 
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Step 5: Now add the generated column for manufacturer normalization
ALTER TABLE public.rx_variants 
ADD COLUMN IF NOT EXISTS manufacturer_normalized text 
GENERATED ALWAYS AS (lower(trim(regexp_replace(COALESCE(manufacturer, ''), '\s+', ' ', 'g')))) STORED;

-- Step 6: Create unique constraint to prevent duplicate manufacturer variants per med
CREATE UNIQUE INDEX IF NOT EXISTS idx_rx_variants_med_manufacturer_unique 
ON public.rx_variants (rx_med_id, manufacturer_normalized) 
WHERE manufacturer_normalized IS NOT NULL AND manufacturer_normalized != '';

-- Step 7: Add seed_status tracking fields to rx_variants
ALTER TABLE public.rx_variants 
ADD COLUMN IF NOT EXISTS seed_status text DEFAULT 'pending';

ALTER TABLE public.rx_variants 
ADD COLUMN IF NOT EXISTS seed_attempts integer DEFAULT 0;

ALTER TABLE public.rx_variants 
ADD COLUMN IF NOT EXISTS seed_last_error text;

ALTER TABLE public.rx_variants 
ADD COLUMN IF NOT EXISTS seed_next_retry_at timestamp with time zone;

-- Step 8: Add comments for documentation
COMMENT ON COLUMN public.rx_meds.popularity_rank IS 'Rank for tiered manufacturer seeding: 1-300 = top tier (10 mfrs), 301+ = standard tier (5 mfrs)';
COMMENT ON COLUMN public.rx_variants.manufacturer_normalized IS 'Normalized manufacturer name for deduplication (auto-generated)';
COMMENT ON COLUMN public.rx_variants.seed_status IS 'Seeding status: pending, complete, failed, needs_manual';