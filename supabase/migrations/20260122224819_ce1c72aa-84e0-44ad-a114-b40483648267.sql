-- Ensure generic_name is NOT NULL and add unique constraint for upserts
ALTER TABLE otc_products
ALTER COLUMN generic_name SET NOT NULL;

-- Add unique constraint on generic_name (needed for upsert on_conflict)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'otc_products_generic_name_key'
  ) THEN
    ALTER TABLE otc_products ADD CONSTRAINT otc_products_generic_name_key UNIQUE (generic_name);
  END IF;
END
$$;

-- Add unique constraint on otc_synonyms (otc_product_id, synonym) for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'otc_synonyms_product_synonym_key'
  ) THEN
    -- First remove any duplicate synonyms if they exist
    DELETE FROM otc_synonyms a USING otc_synonyms b
    WHERE a.id > b.id 
      AND a.otc_product_id = b.otc_product_id 
      AND a.synonym = b.synonym;
    
    ALTER TABLE otc_synonyms ADD CONSTRAINT otc_synonyms_product_synonym_key UNIQUE (otc_product_id, synonym);
  END IF;
END
$$;

-- Add index on otc_synonyms.synonym for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_otc_synonyms_synonym_lower ON otc_synonyms (lower(synonym));

-- Add index on otc_products.generic_name for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_otc_products_generic_name_lower ON otc_products (lower(generic_name));