-- Add scan credit tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS rx_scans_used INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchased_credits INTEGER NOT NULL DEFAULT 0;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_profiles_scan_credits ON public.profiles (id, rx_scans_used, purchased_credits);

-- Update the profiles RLS to allow users to see their credits
-- (Already has view own profile policy)