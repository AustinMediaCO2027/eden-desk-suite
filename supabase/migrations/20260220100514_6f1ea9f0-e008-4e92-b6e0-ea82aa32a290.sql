
-- Fix the overly permissive policy by restricting to valid affiliate_ids only
DROP POLICY "Public can insert clicks" ON public.affiliate_clicks;
CREATE POLICY "Public can insert clicks" ON public.affiliate_clicks
  FOR INSERT WITH CHECK (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE status = 'approved')
  );
