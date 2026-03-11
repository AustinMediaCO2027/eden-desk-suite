
-- Drop ALL existing policies on affiliates (they're all restrictive)
DROP POLICY IF EXISTS "Admins can manage affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Users can view own affiliate" ON public.affiliates;
DROP POLICY IF EXISTS "Users can update own affiliate" ON public.affiliates;
DROP POLICY IF EXISTS "Public can apply as affiliate" ON public.affiliates;

-- Recreate as PERMISSIVE (default) policies
CREATE POLICY "Admins can manage affiliates"
  ON public.affiliates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own affiliate"
  ON public.affiliates FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate"
  ON public.affiliates FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can apply as affiliate"
  ON public.affiliates FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending');

-- Also fix payouts, referrals, commissions which have same issue
DROP POLICY IF EXISTS "Admins can manage payouts" ON public.payouts;
DROP POLICY IF EXISTS "Affiliates can request payouts" ON public.payouts;
DROP POLICY IF EXISTS "Affiliates can view own payouts" ON public.payouts;

CREATE POLICY "Admins can manage payouts"
  ON public.payouts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Affiliates can request payouts"
  ON public.payouts FOR INSERT TO authenticated
  WITH CHECK (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

CREATE POLICY "Affiliates can view own payouts"
  ON public.payouts FOR SELECT TO authenticated
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Fix referrals
DROP POLICY IF EXISTS "Admins can manage referrals" ON public.referrals;
DROP POLICY IF EXISTS "Affiliates can view own referrals" ON public.referrals;

CREATE POLICY "Admins can manage referrals"
  ON public.referrals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Affiliates can view own referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Fix commissions
DROP POLICY IF EXISTS "Admins can manage commissions" ON public.commissions;
DROP POLICY IF EXISTS "Affiliates can view own commissions" ON public.commissions;

CREATE POLICY "Admins can manage commissions"
  ON public.commissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Affiliates can view own commissions"
  ON public.commissions FOR SELECT TO authenticated
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));
