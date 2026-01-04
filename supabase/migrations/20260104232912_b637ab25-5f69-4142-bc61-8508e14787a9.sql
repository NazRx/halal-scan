-- Add unique constraint on ingredients.name for upsert operations
ALTER TABLE ingredients ADD CONSTRAINT ingredients_name_key UNIQUE (name);