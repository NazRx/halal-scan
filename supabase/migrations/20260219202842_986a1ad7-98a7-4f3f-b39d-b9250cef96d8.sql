
-- 1. Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NULL,
  role_recipient text NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text NULL,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb NULL
);

-- 2. Indexes
CREATE INDEX idx_notifications_user_created ON public.notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications (is_read);
CREATE INDEX idx_notifications_type ON public.notifications (type);

-- 3. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can see their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can view all
CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT
  USING (is_admin(auth.uid()));

-- Only DB triggers (service role) can insert — no direct client insert
-- (no INSERT policy for authenticated users)

-- 5. Add notify_user_on_resolve column to review_requests
ALTER TABLE public.review_requests
  ADD COLUMN IF NOT EXISTS notify_user_on_resolve boolean NOT NULL DEFAULT false;

-- 6. Trigger function: notify admins when new review_request inserted
CREATE OR REPLACE FUNCTION public.notify_admins_on_review_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user record;
  drug_label text;
BEGIN
  drug_label := COALESCE(NEW.drug_name, '(name not provided)');

  FOR admin_user IN
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
    VALUES (
      admin_user.user_id,
      'review_request_new',
      'New review request',
      'A new request was submitted for: ' || drug_label,
      '/admin/review-requests',
      jsonb_build_object(
        'request_id', NEW.id,
        'drug_name', NEW.drug_name,
        'ndc', NEW.ndc_number,
        'upc', NEW.upc_number
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- 7. Attach trigger to review_requests INSERT
DROP TRIGGER IF EXISTS on_review_request_insert ON public.review_requests;
CREATE TRIGGER on_review_request_insert
  AFTER INSERT ON public.review_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_on_review_request();

-- 8. Trigger function: notify user when request status → resolved
CREATE OR REPLACE FUNCTION public.notify_user_on_request_resolved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  drug_label text;
BEGIN
  -- Only fire when status transitions to 'resolved'
  IF NEW.status = 'resolved'
     AND OLD.status IS DISTINCT FROM 'resolved'
     AND NEW.user_id IS NOT NULL
     AND NEW.notify_user_on_resolve = true
  THEN
    drug_label := COALESCE(NEW.drug_name, 'your product');

    INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.user_id,
      'review_request_resolved',
      'Request resolved',
      'Your review request for ' || drug_label || ' has been updated.',
      '/my-requests',
      jsonb_build_object(
        'request_id', NEW.id,
        'drug_name', NEW.drug_name,
        'resolved_summary', NEW.resolved_summary
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 9. Attach trigger to review_requests UPDATE
DROP TRIGGER IF EXISTS on_review_request_resolved ON public.review_requests;
CREATE TRIGGER on_review_request_resolved
  AFTER UPDATE ON public.review_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_on_request_resolved();
