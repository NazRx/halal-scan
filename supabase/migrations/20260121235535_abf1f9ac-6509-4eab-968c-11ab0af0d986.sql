-- Add new columns to existing otc_products table
ALTER TABLE public.otc_products 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS generic_name text,
ADD COLUMN IF NOT EXISTS primary_category text,
ADD COLUMN IF NOT EXISTS common_uses text,
ADD COLUMN IF NOT EXISTS search_terms text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_vitamin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_combo boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS combo_ingredients text[] DEFAULT '{}';

-- Create unique index on generic_name (partial - only where not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_otc_products_generic_name ON public.otc_products(generic_name) WHERE generic_name IS NOT NULL;

-- Create GIN index on search_terms for fast array search
CREATE INDEX IF NOT EXISTS idx_otc_products_search_terms ON public.otc_products USING GIN(search_terms);

-- Create index on primary_category
CREATE INDEX IF NOT EXISTS idx_otc_products_primary_category ON public.otc_products(primary_category);

-- Create otc_synonyms table
CREATE TABLE IF NOT EXISTS public.otc_synonyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  otc_product_id uuid NOT NULL REFERENCES public.otc_products(id) ON DELETE CASCADE,
  synonym text NOT NULL,
  synonym_type text DEFAULT 'alias',
  created_at timestamp with time zone DEFAULT now()
);

-- Create index on synonym for fast lookup
CREATE INDEX IF NOT EXISTS idx_otc_synonyms_synonym ON public.otc_synonyms(synonym);
CREATE INDEX IF NOT EXISTS idx_otc_synonyms_synonym_lower ON public.otc_synonyms(LOWER(synonym));
CREATE INDEX IF NOT EXISTS idx_otc_synonyms_product_id ON public.otc_synonyms(otc_product_id);

-- Enable RLS on otc_synonyms
ALTER TABLE public.otc_synonyms ENABLE ROW LEVEL SECURITY;

-- Anyone can view synonyms
CREATE POLICY "Anyone can view OTC synonyms" 
ON public.otc_synonyms 
FOR SELECT 
USING (true);

-- Admins can manage synonyms
CREATE POLICY "Admins can manage OTC synonyms" 
ON public.otc_synonyms 
FOR ALL 
USING (is_admin(auth.uid()));