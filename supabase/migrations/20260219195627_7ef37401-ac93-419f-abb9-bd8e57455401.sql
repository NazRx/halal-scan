
-- Add missing columns to existing review_requests table
ALTER TABLE public.review_requests
  ADD COLUMN IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS drug_name text,
  ADD COLUMN IF NOT EXISTS brand_or_manufacturer text,
  ADD COLUMN IF NOT EXISTS ndc_number text,
  ADD COLUMN IF NOT EXISTS upc_number text,
  ADD COLUMN IF NOT EXISTS notes_text text,
  ADD COLUMN IF NOT EXISTS barcode_image_path text,
  ADD COLUMN IF NOT EXISTS ingredients_image_path text,
  ADD COLUMN IF NOT EXISTS source_page text;
