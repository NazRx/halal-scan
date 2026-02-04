-- ============================================
-- OTC BRANDS SYSTEM
-- Adds brand/labeler support for OTC products
-- ============================================

-- 1) Create otc_brands table
CREATE TABLE public.otc_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text NOT NULL UNIQUE,
  labeler_name text NULL,
  website text NULL,
  notes text NULL,
  is_halal_certified boolean NOT NULL DEFAULT false,
  certification_body text NULL,
  certification_url text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otc_brands ENABLE ROW LEVEL SECURITY;

-- RLS policies for otc_brands
CREATE POLICY "Anyone can view OTC brands"
  ON public.otc_brands
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage OTC brands"
  ON public.otc_brands
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Updated at trigger
CREATE TRIGGER update_otc_brands_updated_at
  BEFORE UPDATE ON public.otc_brands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Create otc_product_brands join table
CREATE TABLE public.otc_product_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  otc_product_id uuid NOT NULL REFERENCES public.otc_products(id) ON DELETE CASCADE,
  otc_brand_id uuid NOT NULL REFERENCES public.otc_brands(id) ON DELETE CASCADE,
  upc text NULL,
  ndc text NULL,
  is_primary boolean NOT NULL DEFAULT false,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (otc_product_id, otc_brand_id)
);

-- Create indexes
CREATE INDEX idx_otc_product_brands_product_id ON public.otc_product_brands(otc_product_id);
CREATE INDEX idx_otc_product_brands_brand_id ON public.otc_product_brands(otc_brand_id);

-- Enable RLS
ALTER TABLE public.otc_product_brands ENABLE ROW LEVEL SECURITY;

-- RLS policies for otc_product_brands
CREATE POLICY "Anyone can view OTC product brands"
  ON public.otc_product_brands
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage OTC product brands"
  ON public.otc_product_brands
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- 3) Create otc_brand_ingredient_profiles for brand-specific overrides
CREATE TABLE public.otc_brand_ingredient_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  otc_product_id uuid NOT NULL REFERENCES public.otc_products(id) ON DELETE CASCADE,
  otc_brand_id uuid NOT NULL REFERENCES public.otc_brands(id) ON DELETE CASCADE,
  dosage_form text NULL,
  route text NULL,
  active_ingredients jsonb NULL DEFAULT '[]'::jsonb,
  flags jsonb NULL DEFAULT '{}'::jsonb,
  risk_ingredients jsonb NULL DEFAULT '[]'::jsonb,
  rationale_short text NULL,
  rationale_long text NULL,
  sources jsonb NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (otc_product_id, otc_brand_id)
);

-- Create indexes
CREATE INDEX idx_otc_brand_profiles_product_id ON public.otc_brand_ingredient_profiles(otc_product_id);
CREATE INDEX idx_otc_brand_profiles_brand_id ON public.otc_brand_ingredient_profiles(otc_brand_id);

-- Enable RLS
ALTER TABLE public.otc_brand_ingredient_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for otc_brand_ingredient_profiles
CREATE POLICY "Anyone can view OTC brand profiles"
  ON public.otc_brand_ingredient_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage OTC brand profiles"
  ON public.otc_brand_ingredient_profiles
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Updated at trigger
CREATE TRIGGER update_otc_brand_profiles_updated_at
  BEFORE UPDATE ON public.otc_brand_ingredient_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Add otc_brand_id to existing otc_user_submissions table
ALTER TABLE public.otc_user_submissions 
  ADD COLUMN IF NOT EXISTS otc_brand_id uuid NULL REFERENCES public.otc_brands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS upc text NULL;