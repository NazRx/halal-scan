-- First, delete duplicate synonyms keeping only the first one
DELETE FROM otc_synonyms a
USING otc_synonyms b
WHERE a.otc_product_id = b.otc_product_id
  AND LOWER(TRIM(a.synonym)) = LOWER(TRIM(b.synonym))
  AND a.id > b.id;

-- Normalize existing synonyms to lowercase trimmed
UPDATE otc_synonyms
SET synonym = LOWER(TRIM(synonym));

-- Now add the unique constraint
ALTER TABLE otc_synonyms
ADD CONSTRAINT otc_synonyms_unique_per_product UNIQUE (otc_product_id, synonym);