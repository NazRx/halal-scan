-- Create user_issue_reports table for product-related issue submissions
CREATE TABLE public.user_issue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NULL,
  email TEXT NULL,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  product_id UUID NULL,
  brand_id UUID NULL,
  upc TEXT NULL,
  page_url TEXT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT NULL,
  resolved_at TIMESTAMPTZ NULL
);

-- Enable RLS
ALTER TABLE public.user_issue_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit issue reports (authenticated or anonymous)
CREATE POLICY "Anyone can submit issue reports"
ON public.user_issue_reports
FOR INSERT
WITH CHECK (true);

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
ON public.user_issue_reports
FOR SELECT
USING (user_id = auth.uid());

-- Admins can manage all reports
CREATE POLICY "Admins can manage all reports"
ON public.user_issue_reports
FOR ALL
USING (is_admin(auth.uid()));

-- Create index for admin queries
CREATE INDEX idx_user_issue_reports_status ON public.user_issue_reports(status);
CREATE INDEX idx_user_issue_reports_created_at ON public.user_issue_reports(created_at DESC);