-- Add drug_class column to rx_meds for categorization/browsing
ALTER TABLE public.rx_meds ADD COLUMN IF NOT EXISTS drug_class text;

-- Create index for faster drug class queries
CREATE INDEX IF NOT EXISTS idx_rx_meds_drug_class ON public.rx_meds(drug_class);

-- Create index on OTC category for filtering
CREATE INDEX IF NOT EXISTS idx_otc_products_category ON public.otc_products(category);

-- Create index on OTC brand for filtering
CREATE INDEX IF NOT EXISTS idx_otc_products_brand ON public.otc_products(brand);