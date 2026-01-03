
-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE public.plan_type AS ENUM ('free', 'pro', 'clinic');
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete');
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.source_type AS ENUM ('manufacturer', 'certifier', 'reference');
CREATE TYPE public.halal_status AS ENUM ('halal', 'questionable', 'not_halal', 'unknown');
CREATE TYPE public.ingredient_role AS ENUM ('active', 'inactive');
CREATE TYPE public.review_request_type AS ENUM ('otc_not_found', 'rx_not_found', 'variant_unclear');
CREATE TYPE public.review_request_status AS ENUM ('new', 'in_progress', 'resolved');
CREATE TYPE public.usage_event_type AS ENUM ('otc_scan', 'rx_search', 'report_view', 'report_download');

-- =============================================
-- USER ROLES (for admin access)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- =============================================
-- SUBSCRIPTIONS
-- =============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status subscription_status NOT NULL DEFAULT 'active',
  plan plan_type NOT NULL DEFAULT 'free',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ORGANIZATIONS (for Clinic tier)
-- =============================================
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Security definer for org role check
CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _org_id UUID, _roles org_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND org_id = _org_id AND role = ANY(_roles)
  )
$$;

-- =============================================
-- SHARED DATA: INGREDIENTS
-- =============================================
CREATE TABLE public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  synonyms TEXT[] DEFAULT '{}',
  risk risk_level NOT NULL DEFAULT 'low',
  default_concern_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SHARED DATA: SOURCES
-- =============================================
CREATE TABLE public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source_type source_type NOT NULL,
  url TEXT,
  citation_text TEXT,
  date_accessed DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

-- =============================================
-- OTC PRODUCTS
-- =============================================
CREATE TABLE public.otc_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  upc TEXT UNIQUE,
  category TEXT,
  manufacturer TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.otc_products ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.otc_product_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.otc_products(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  source_id UUID REFERENCES public.sources(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, ingredient_id)
);

ALTER TABLE public.otc_product_ingredients ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.otc_verdicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.otc_products(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status halal_status NOT NULL DEFAULT 'unknown',
  confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  summary_reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.otc_verdicts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RX MEDICATIONS
-- =============================================
CREATE TABLE public.rx_meds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generic_name TEXT NOT NULL,
  brand_names TEXT[] DEFAULT '{}',
  route TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rx_meds ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rx_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rx_med_id UUID REFERENCES public.rx_meds(id) ON DELETE CASCADE NOT NULL,
  strength_text TEXT,
  dosage_form TEXT,
  manufacturer TEXT,
  ndc_list TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rx_variants ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rx_variant_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES public.rx_variants(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE NOT NULL,
  role ingredient_role NOT NULL DEFAULT 'inactive',
  notes TEXT,
  source_id UUID REFERENCES public.sources(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (variant_id, ingredient_id)
);

ALTER TABLE public.rx_variant_ingredients ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rx_verdicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES public.rx_variants(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status halal_status NOT NULL DEFAULT 'unknown',
  confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  summary_reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.rx_verdicts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- REVIEW REQUESTS
-- =============================================
CREATE TABLE public.review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type review_request_type NOT NULL,
  query_text TEXT,
  upc TEXT,
  rx_fields JSONB,
  message TEXT,
  status review_request_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;

-- =============================================
-- UPLOADS (file references for Supabase Storage)
-- =============================================
CREATE TABLE public.uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  review_request_id UUID REFERENCES public.review_requests(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USAGE EVENTS
-- =============================================
CREATE TABLE public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type usage_event_type NOT NULL,
  ref_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: USER ROLES
-- =============================================
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES: SUBSCRIPTIONS
-- =============================================
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscription"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES: ORGANIZATIONS
-- =============================================
CREATE POLICY "Org members can view their organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE org_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage organizations"
  ON public.organizations FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES: ORGANIZATION MEMBERS
-- =============================================
CREATE POLICY "Members can view their org membership"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_org_role(auth.uid(), org_id, ARRAY['owner', 'admin']::org_role[]));

CREATE POLICY "Org owners/admins can manage members"
  ON public.organization_members FOR ALL
  TO authenticated
  USING (public.has_org_role(auth.uid(), org_id, ARRAY['owner', 'admin']::org_role[]) OR public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES: INGREDIENTS (public read, admin write)
-- =============================================
CREATE POLICY "Anyone can view ingredients"
  ON public.ingredients FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage ingredients"
  ON public.ingredients FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES: SOURCES (public read, admin write)
-- =============================================
CREATE POLICY "Anyone can view sources"
  ON public.sources FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage sources"
  ON public.sources FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES: OTC PRODUCTS (public read, admin write)
-- =============================================
CREATE POLICY "Anyone can view OTC products"
  ON public.otc_products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage OTC products"
  ON public.otc_products FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES: OTC PRODUCT INGREDIENTS (public read, admin write)
-- =============================================
CREATE POLICY "Anyone can view OTC product ingredients"
  ON public.otc_product_ingredients FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage OTC product ingredients"
  ON public.otc_product_ingredients FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES: OTC VERDICTS (public read, admin write)
-- =============================================
CREATE POLICY "Anyone can view OTC verdicts"
  ON public.otc_verdicts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage OTC verdicts"
  ON public.otc_verdicts FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES: RX MEDS (public read, admin write)
-- =============================================
CREATE POLICY "Anyone can view Rx meds"
  ON public.rx_meds FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage Rx meds"
  ON public.rx_meds FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES: RX VARIANTS (public read, admin write)
-- =============================================
CREATE POLICY "Anyone can view Rx variants"
  ON public.rx_variants FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage Rx variants"
  ON public.rx_variants FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES: RX VARIANT INGREDIENTS (public read, admin write)
-- =============================================
CREATE POLICY "Anyone can view Rx variant ingredients"
  ON public.rx_variant_ingredients FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage Rx variant ingredients"
  ON public.rx_variant_ingredients FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES: RX VERDICTS (public read, admin write)
-- =============================================
CREATE POLICY "Anyone can view Rx verdicts"
  ON public.rx_verdicts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage Rx verdicts"
  ON public.rx_verdicts FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES: REVIEW REQUESTS (user owns their data)
-- =============================================
CREATE POLICY "Users can view their own review requests"
  ON public.review_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create review requests"
  ON public.review_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update review requests"
  ON public.review_requests FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES: UPLOADS (user owns their data)
-- =============================================
CREATE POLICY "Users can view their own uploads"
  ON public.uploads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create uploads"
  ON public.uploads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own uploads"
  ON public.uploads FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES: USAGE EVENTS (user owns their data)
-- =============================================
CREATE POLICY "Users can view their own usage events"
  ON public.usage_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create usage events"
  ON public.usage_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- STORAGE BUCKET FOR UPLOADS
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('review-uploads', 'review-uploads', false);

-- Storage policies
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'review-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'review-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'review-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'review-uploads' AND public.is_admin(auth.uid()));

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_otc_products_updated_at
  BEFORE UPDATE ON public.otc_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rx_meds_updated_at
  BEFORE UPDATE ON public.rx_meds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rx_variants_updated_at
  BEFORE UPDATE ON public.rx_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_requests_updated_at
  BEFORE UPDATE ON public.review_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_otc_products_upc ON public.otc_products(upc);
CREATE INDEX idx_otc_products_name ON public.otc_products USING gin(to_tsvector('english', name));
CREATE INDEX idx_rx_meds_generic_name ON public.rx_meds USING gin(to_tsvector('english', generic_name));
CREATE INDEX idx_rx_variants_manufacturer ON public.rx_variants(manufacturer);
CREATE INDEX idx_ingredients_name ON public.ingredients USING gin(to_tsvector('english', name));
CREATE INDEX idx_usage_events_user_id ON public.usage_events(user_id);
CREATE INDEX idx_usage_events_created_at ON public.usage_events(created_at);
CREATE INDEX idx_review_requests_user_id ON public.review_requests(user_id);
CREATE INDEX idx_review_requests_status ON public.review_requests(status);
