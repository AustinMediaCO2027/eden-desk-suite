
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function FIRST
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
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

-- Now RLS policies that use has_role
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Affiliates table
CREATE TABLE public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  affiliate_code text UNIQUE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  country text DEFAULT '',
  website text DEFAULT '',
  promotion_method text DEFAULT '',
  audience_type text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  payment_method text DEFAULT 'paypal',
  paypal_email text DEFAULT '',
  bank_name text DEFAULT '',
  bank_account_holder text DEFAULT '',
  bank_account_number text DEFAULT '',
  bank_branch_code text DEFAULT '',
  bank_country text DEFAULT '',
  total_earnings numeric NOT NULL DEFAULT 0,
  pending_balance numeric NOT NULL DEFAULT 0,
  paid_earnings numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own affiliate" ON public.affiliates
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own affiliate" ON public.affiliates
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public can apply as affiliate" ON public.affiliates
  FOR INSERT WITH CHECK (status = 'pending');
CREATE POLICY "Admins can manage affiliates" ON public.affiliates
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Affiliate clicks
CREATE TABLE public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  visitor_id text DEFAULT '',
  ip_hash text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own clicks" ON public.affiliate_clicks
  FOR SELECT TO authenticated
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage clicks" ON public.affiliate_clicks
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can insert clicks" ON public.affiliate_clicks
  FOR INSERT WITH CHECK (true);

-- Referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  referred_user_id uuid NOT NULL,
  subscription_plan text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage referrals" ON public.referrals
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Commissions table
CREATE TABLE public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  referral_id uuid REFERENCES public.referrals(id) ON DELETE CASCADE NOT NULL,
  plan text DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  billing_cycle text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own commissions" ON public.commissions
  FOR SELECT TO authenticated
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage commissions" ON public.commissions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Payouts table
CREATE TABLE public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  paid_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own payouts" ON public.payouts
  FOR SELECT TO authenticated
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));
CREATE POLICY "Affiliates can request payouts" ON public.payouts
  FOR INSERT TO authenticated
  WITH CHECK (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage payouts" ON public.payouts
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add referred_by to profiles
ALTER TABLE public.profiles ADD COLUMN referred_by_affiliate_id uuid REFERENCES public.affiliates(id);

-- Updated_at trigger for affiliates
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
