-- 1. Shared files: remove public row access (now served by the shared-file edge function)
DROP POLICY IF EXISTS "Anyone can view shared files" ON public.user_files;

-- 2. Affiliates: prevent impersonation on insert
DROP POLICY IF EXISTS "Public can apply as affiliate" ON public.affiliates;

CREATE POLICY "Public can apply as affiliate"
ON public.affiliates
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND user_id IS NULL)
  )
);

-- 3. provider_webhook_events: admin read access only
GRANT SELECT ON public.provider_webhook_events TO authenticated;
GRANT ALL ON public.provider_webhook_events TO service_role;

CREATE POLICY "Admins can view webhook events"
ON public.provider_webhook_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Storage: stop bucket listing on the public logos bucket
DROP POLICY IF EXISTS "Logo images are publicly accessible" ON storage.objects;

-- 5. Lock down SECURITY DEFINER functions exposed through the API
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_affiliate_status_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.link_referral(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.link_referral(text) TO authenticated;