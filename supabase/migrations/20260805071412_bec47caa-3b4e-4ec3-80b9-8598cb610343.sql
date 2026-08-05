
-- Helper: detect privileged (service role) callers
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
    ''
  ) = 'service_role'
     OR current_setting('request.jwt.claims', true) IS NULL
     OR nullif(current_setting('request.jwt.claims', true), '') IS NULL;
$$;
REVOKE ALL ON FUNCTION public.is_service_role() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_service_role() TO service_role;

-- 1. profiles: block self-service billing escalation
CREATE OR REPLACE FUNCTION public.prevent_profile_billing_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  NEW.subscription_plan        := OLD.subscription_plan;
  NEW.payment_status           := OLD.payment_status;
  NEW.trial_active             := OLD.trial_active;
  NEW.trial_used               := OLD.trial_used;
  NEW.trial_start_date         := OLD.trial_start_date;
  NEW.trial_end_date           := OLD.trial_end_date;
  NEW.trial_ends_at            := OLD.trial_ends_at;
  NEW.add_on_storage           := OLD.add_on_storage;
  NEW.storage_used             := OLD.storage_used;
  NEW.payfast_subscription_id  := OLD.payfast_subscription_id;
  NEW.payfast_token            := OLD.payfast_token;
  NEW.referred_by_affiliate_id := OLD.referred_by_affiliate_id;
  NEW.free_generations_used    := OLD.free_generations_used;
  NEW.free_invoices_used       := OLD.free_invoices_used;
  NEW.free_quotes_used         := OLD.free_quotes_used;
  NEW.free_letterheads_used    := OLD.free_letterheads_used;
  NEW.ai_prompts_used_today    := OLD.ai_prompts_used_today;
  NEW.ai_prompts_reset_date    := OLD.ai_prompts_reset_date;
  NEW.user_id                  := OLD.user_id;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.prevent_profile_billing_escalation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_profile_billing_guard ON public.profiles;
CREATE TRIGGER enforce_profile_billing_guard
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_billing_escalation();

-- 2. affiliates: block self-escalation of status/code/earnings/ownership
CREATE OR REPLACE FUNCTION public.prevent_affiliate_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  NEW.status          := OLD.status;
  NEW.affiliate_code  := OLD.affiliate_code;
  NEW.user_id         := OLD.user_id;
  NEW.total_earnings  := OLD.total_earnings;
  NEW.pending_balance := OLD.pending_balance;
  NEW.paid_earnings   := OLD.paid_earnings;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.prevent_affiliate_status_change() FROM PUBLIC, anon, authenticated;

-- 3. affiliates: only admins may delete
DROP POLICY IF EXISTS "Only admins can delete affiliates" ON public.affiliates;
CREATE POLICY "Only admins can delete affiliates"
ON public.affiliates
AS RESTRICTIVE
FOR DELETE
TO anon, authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. provider_webhook_events: writes only via service role
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.provider_webhook_events FROM anon, authenticated;
REVOKE SELECT ON public.provider_webhook_events FROM anon;

DROP POLICY IF EXISTS "No client writes to webhook events" ON public.provider_webhook_events;
CREATE POLICY "No client writes to webhook events"
ON public.provider_webhook_events
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Admins can view webhook events" ON public.provider_webhook_events;
CREATE POLICY "Admins can view webhook events"
ON public.provider_webhook_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. subscriptions: writes only via service role
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.subscriptions FROM anon, authenticated;
REVOKE SELECT ON public.subscriptions FROM anon;

DROP POLICY IF EXISTS "No client writes to subscriptions" ON public.subscriptions;
CREATE POLICY "No client writes to subscriptions"
ON public.subscriptions
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (false);

-- 6. user_roles: only admins can write; nobody can self-assign
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.user_roles FROM anon;
REVOKE SELECT ON public.user_roles FROM anon;

DROP POLICY IF EXISTS "Only admins can modify roles" ON public.user_roles;
CREATE POLICY "Only admins can modify roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
CREATE POLICY "Only admins can update roles"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO anon, authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO anon, authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. link_referral no longer directly callable by signed-in users (moved behind edge function)
REVOKE EXECUTE ON FUNCTION public.link_referral(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.link_referral(text) TO service_role;
