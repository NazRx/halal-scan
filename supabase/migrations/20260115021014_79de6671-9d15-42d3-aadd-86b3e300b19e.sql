-- Drop and recreate the view with SECURITY INVOKER to respect RLS of querying user
DROP VIEW IF EXISTS public.ndc_ingredient_summary;

CREATE VIEW public.ndc_ingredient_summary 
WITH (security_invoker = true)
AS
SELECT 
  ndc,
  COUNT(*) as total_inactive_count,
  COUNT(*) FILTER (WHERE status = 'matched') as matched_count,
  COUNT(*) FILTER (WHERE status = 'unmatched') as unmatched_count,
  COUNT(*) FILTER (WHERE matched_status = 'haram') as haram_count,
  COUNT(*) FILTER (WHERE matched_status = 'mushbooh') as questionable_count,
  COUNT(*) FILTER (WHERE matched_status = 'halal') as halal_count,
  CASE 
    WHEN COUNT(*) FILTER (WHERE matched_status = 'haram') > 0 THEN 'haram'
    WHEN COUNT(*) FILTER (WHERE matched_status = 'mushbooh') > 0 THEN 'mushbooh'
    WHEN COUNT(*) FILTER (WHERE status = 'unmatched' OR status = 'pending') > 0 THEN 'needs_verification'
    WHEN COUNT(*) = COUNT(*) FILTER (WHERE matched_status = 'halal') THEN 'halal'
    ELSE 'needs_verification'
  END as overall_status
FROM public.ndc_inactive_ingredients
GROUP BY ndc;