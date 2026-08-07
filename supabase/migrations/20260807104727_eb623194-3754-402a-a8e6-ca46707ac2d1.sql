DROP POLICY IF EXISTS "Public can apply as affiliate" ON public.affiliates;
CREATE POLICY "Registered users can apply as affiliate"
ON public.affiliates
FOR INSERT
TO authenticated
WITH CHECK (status = 'pending'::text AND user_id = auth.uid());