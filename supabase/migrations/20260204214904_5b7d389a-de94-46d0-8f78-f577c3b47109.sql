-- ================================================================
-- OTC INGREDIENT PROFILES TABLE
-- Stores enriched ingredient/formulation data for OTC products
-- ================================================================

CREATE TABLE public.otc_ingredient_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  otc_product_id UUID NOT NULL UNIQUE REFERENCES public.otc_products(id) ON DELETE CASCADE,
  
  -- Formulation details
  active_ingredients JSONB DEFAULT '[]'::jsonb,  -- [{name, strength?, notes?}]
  dosage_form TEXT,  -- tablet, capsule, liquid, gelcap, gummy, powder, ointment, etc.
  route TEXT,  -- oral, topical, nasal, etc.
  
  -- Risk flags (boolean indicators for common concerns)
  flags JSONB DEFAULT '{}'::jsonb,  -- {contains_alcohol, contains_gelatin, etc.}
  
  -- Detailed risk ingredient analysis
  risk_ingredients JSONB DEFAULT '[]'::jsonb,  -- [{ingredient, risk_tag, note}]
  
  -- Computed/admin-set status
  default_status TEXT DEFAULT 'unknown' CHECK (default_status IN ('likely_halal', 'use_caution', 'unknown', 'likely_haram')),
  
  -- Rationale and sources
  rationale_short TEXT,  -- 1-2 sentence public explanation
  rationale_long TEXT,   -- Extended explanation for accordion
  sources JSONB DEFAULT '[]'::jsonb,  -- [{label, url?, note?}]
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otc_ingredient_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view OTC ingredient profiles"
  ON public.otc_ingredient_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage OTC ingredient profiles"
  ON public.otc_ingredient_profiles
  FOR ALL
  USING (is_admin(auth.uid()));

-- Index for fast lookups
CREATE INDEX idx_otc_ingredient_profiles_product_id ON public.otc_ingredient_profiles(otc_product_id);

-- Trigger for updated_at
CREATE TRIGGER update_otc_ingredient_profiles_updated_at
  BEFORE UPDATE ON public.otc_ingredient_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- OTC USER SUBMISSIONS TABLE
-- For users to contribute ingredient lists
-- ================================================================

CREATE TABLE public.otc_user_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  otc_product_id UUID NOT NULL REFERENCES public.otc_products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Submitted content
  pasted_text TEXT NOT NULL,
  submission_type TEXT DEFAULT 'inactive_ingredients',
  
  -- Review status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'applied', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otc_user_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create submissions"
  ON public.otc_user_submissions
  FOR INSERT
  WITH CHECK (true);  -- Allow anonymous submissions

CREATE POLICY "Users can view their own submissions"
  ON public.otc_user_submissions
  FOR SELECT
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage all submissions"
  ON public.otc_user_submissions
  FOR ALL
  USING (is_admin(auth.uid()));

-- Index for lookups
CREATE INDEX idx_otc_user_submissions_product_id ON public.otc_user_submissions(otc_product_id);
CREATE INDEX idx_otc_user_submissions_status ON public.otc_user_submissions(status);