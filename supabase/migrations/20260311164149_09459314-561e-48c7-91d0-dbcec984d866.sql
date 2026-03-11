
-- Drop all existing restrictive policies on affiliates
DROP POLICY IF EXISTS "Admins can manage affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Users can view own affiliate" ON public.affiliates;
DROP POLICY IF EXISTS "Users can update own affiliate" ON public.affiliates;
DROP POLICY IF EXISTS "Public can apply as affiliate" ON public.affiliates;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admins can manage affiliates" ON public.affiliates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own affiliate" ON public.affiliates
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate" ON public.affiliates
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can apply as affiliate" ON public.affiliates
  FOR INSERT TO public
  WITH CHECK (status = 'pending');
