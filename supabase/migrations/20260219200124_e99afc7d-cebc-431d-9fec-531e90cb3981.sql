
-- Add admin/resolution fields to review_requests
ALTER TABLE public.review_requests
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS resolved_summary text,
  ADD COLUMN IF NOT EXISTS final_manufacturer text,
  ADD COLUMN IF NOT EXISTS final_ndc text,
  ADD COLUMN IF NOT EXISTS resolution_links text[];

-- Ensure status column allows our custom statuses via text (already text-based via enum)
-- The existing enum is: 'new' | 'in_progress' | 'resolved' — we need 'triaged' and 'researching'
-- Since type is USER-DEFINED (review_request_status), we must add new enum values
ALTER TYPE public.review_request_status ADD VALUE IF NOT EXISTS 'triaged';
ALTER TYPE public.review_request_status ADD VALUE IF NOT EXISTS 'researching';
