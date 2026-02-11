
-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  status text NOT NULL DEFAULT 'draft',
  author text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts
FOR SELECT
USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins can manage all blog posts"
ON public.blog_posts
FOR ALL
USING (is_admin(auth.uid()));

-- Reuse existing trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed existing placeholder posts
INSERT INTO public.blog_posts (title, slug, excerpt, status) VALUES
  ('Is Gelatin Always Haram?', 'is-gelatin-always-haram', 'Exploring the nuances of gelatin sourcing and its halal status.', 'published'),
  ('Understanding Alcohol in Medicine', 'understanding-alcohol-in-medicine', 'A look at alcohol-based ingredients in medications and scholarly opinions.', 'published'),
  ('Emergency Exceptions in Islamic Law', 'emergency-exceptions-in-islamic-law', 'When does the principle of darura (necessity) apply to medication?', 'published'),
  ('How to Ask Your Pharmacist About Ingredients', 'how-to-ask-your-pharmacist', 'Practical tips for having ingredient conversations with your pharmacist.', 'published');
