-- Add inactive_raw_text column to rx_meds for debugging extracted text
ALTER TABLE public.rx_meds ADD COLUMN IF NOT EXISTS inactive_raw_text text;