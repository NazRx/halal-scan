-- Create feedback type enum
CREATE TYPE public.feedback_type AS ENUM ('correction', 'suggestion', 'compliment', 'question', 'other');

-- Create feedback status enum
CREATE TYPE public.feedback_status AS ENUM ('new', 'reviewed', 'resolved', 'dismissed');

-- Create user_feedback table
CREATE TABLE public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  feedback_type public.feedback_type NOT NULL DEFAULT 'suggestion',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  related_medication_id UUID REFERENCES public.rx_meds(id) ON DELETE SET NULL,
  related_product_upc TEXT,
  page_url TEXT,
  status public.feedback_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit feedback (both authenticated and anonymous)
CREATE POLICY "Anyone can submit feedback"
  ON public.user_feedback
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON public.user_feedback
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Admins can manage all feedback
CREATE POLICY "Admins can manage all feedback"
  ON public.user_feedback
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_user_feedback_updated_at
  BEFORE UPDATE ON public.user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();