-- Phase 3: Create otc_brand_review_status table for future verification framework
-- This is a foundation for deeper brand verification without exposing it publicly yet

-- Create review level enum
CREATE TYPE public.otc_review_level AS ENUM (
  'none',
  'pattern_reviewed',
  'ingredient_reviewed',
  'manufacturer_confirmed',
  'halal_certified'
);

-- Create the brand review status table
CREATE TABLE public.otc_brand_review_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.otc_brands(id) ON DELETE CASCADE,
  review_level public.otc_review_level NOT NULL DEFAULT 'none',
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(brand_id)
);

-- Enable RLS
ALTER TABLE public.otc_brand_review_status ENABLE ROW LEVEL SECURITY;

-- Anyone can view review status (public data)
CREATE POLICY "Anyone can view OTC brand review status"
  ON public.otc_brand_review_status
  FOR SELECT
  USING (true);

-- Only admins can manage review status
CREATE POLICY "Admins can manage OTC brand review status"
  ON public.otc_brand_review_status
  FOR ALL
  USING (is_admin(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_otc_brand_review_status_updated_at
  BEFORE UPDATE ON public.otc_brand_review_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();