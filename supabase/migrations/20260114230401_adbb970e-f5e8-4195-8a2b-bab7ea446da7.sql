-- Add metadata column to usage_events for storing additional context
ALTER TABLE public.usage_events ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create saved_manufacturers table
CREATE TABLE public.saved_manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  variant_id UUID NOT NULL REFERENCES public.rx_variants(id) ON DELETE CASCADE,
  nickname TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate saves
CREATE UNIQUE INDEX saved_manufacturers_user_variant ON public.saved_manufacturers(user_id, variant_id);

-- Index for faster queries
CREATE INDEX saved_manufacturers_user_id_idx ON public.saved_manufacturers(user_id);
CREATE INDEX usage_events_user_created_idx ON public.usage_events(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.saved_manufacturers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_manufacturers
CREATE POLICY "Users can save manufacturers"
  ON public.saved_manufacturers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their saved manufacturers"
  ON public.saved_manufacturers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their saved manufacturers"
  ON public.saved_manufacturers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved manufacturers"
  ON public.saved_manufacturers FOR DELETE
  USING (auth.uid() = user_id);