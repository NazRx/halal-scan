-- Create ndc_products table to store DailyMed product information
CREATE TABLE public.ndc_products (
  ndc TEXT PRIMARY KEY,
  generic_name TEXT,
  brand_name TEXT,
  dosage_form TEXT,
  strength TEXT,
  route TEXT,
  labeler_name TEXT,
  set_id TEXT,
  spl_version TEXT,
  last_ingested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on set_id for lookups
CREATE INDEX idx_ndc_products_set_id ON public.ndc_products(set_id);
CREATE INDEX idx_ndc_products_labeler ON public.ndc_products(labeler_name);

-- Enable RLS
ALTER TABLE public.ndc_products ENABLE ROW LEVEL SECURITY;

-- Anyone can view NDC products (public reference data)
CREATE POLICY "Anyone can view NDC products"
  ON public.ndc_products FOR SELECT
  USING (true);

-- Only admins can manage NDC products
CREATE POLICY "Admins can manage NDC products"
  ON public.ndc_products FOR ALL
  USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_ndc_products_updated_at
  BEFORE UPDATE ON public.ndc_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- Create ndc_inactive_ingredients table
CREATE TABLE public.ndc_inactive_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ndc TEXT NOT NULL REFERENCES public.ndc_products(ndc) ON DELETE CASCADE,
  ingredient_text_raw TEXT NOT NULL,
  ingredient_name_normalized TEXT NOT NULL,
  unii_code TEXT,
  matched_ingredient_id UUID REFERENCES public.ingredients(id),
  matched_status public.halal_status,
  match_confidence TEXT CHECK (match_confidence IN ('exact', 'synonym', 'partial', 'manual', 'none')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'unmatched', 'reviewed')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_ndc_inactive_ingredients_ndc ON public.ndc_inactive_ingredients(ndc);
CREATE INDEX idx_ndc_inactive_ingredients_status ON public.ndc_inactive_ingredients(status);
CREATE INDEX idx_ndc_inactive_ingredients_matched ON public.ndc_inactive_ingredients(matched_ingredient_id);
CREATE INDEX idx_ndc_inactive_ingredients_normalized ON public.ndc_inactive_ingredients(ingredient_name_normalized);

-- Enable RLS
ALTER TABLE public.ndc_inactive_ingredients ENABLE ROW LEVEL SECURITY;

-- Anyone can view inactive ingredients (public reference data)
CREATE POLICY "Anyone can view NDC inactive ingredients"
  ON public.ndc_inactive_ingredients FOR SELECT
  USING (true);

-- Only admins can manage inactive ingredients
CREATE POLICY "Admins can manage NDC inactive ingredients"
  ON public.ndc_inactive_ingredients FOR ALL
  USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_ndc_inactive_ingredients_updated_at
  BEFORE UPDATE ON public.ndc_inactive_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- Create a view to easily get ingredient counts per NDC
CREATE VIEW public.ndc_ingredient_summary AS
SELECT 
  ndc,
  COUNT(*) as total_inactive_count,
  COUNT(*) FILTER (WHERE status = 'matched') as matched_count,
  COUNT(*) FILTER (WHERE status = 'unmatched') as unmatched_count,
  COUNT(*) FILTER (WHERE matched_status = 'haram') as haram_count,
  COUNT(*) FILTER (WHERE matched_status = 'mushbooh') as questionable_count,
  COUNT(*) FILTER (WHERE matched_status = 'halal') as halal_count,
  CASE 
    WHEN COUNT(*) FILTER (WHERE matched_status = 'haram') > 0 THEN 'haram'
    WHEN COUNT(*) FILTER (WHERE matched_status = 'mushbooh') > 0 THEN 'mushbooh'
    WHEN COUNT(*) FILTER (WHERE status = 'unmatched' OR status = 'pending') > 0 THEN 'needs_verification'
    WHEN COUNT(*) = COUNT(*) FILTER (WHERE matched_status = 'halal') THEN 'halal'
    ELSE 'needs_verification'
  END as overall_status
FROM public.ndc_inactive_ingredients
GROUP BY ndc;