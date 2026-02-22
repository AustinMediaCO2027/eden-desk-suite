
-- Add social media fields to affiliates
ALTER TABLE public.affiliates ADD COLUMN IF NOT EXISTS instagram_url text DEFAULT '';
ALTER TABLE public.affiliates ADD COLUMN IF NOT EXISTS youtube_url text DEFAULT '';
ALTER TABLE public.affiliates ADD COLUMN IF NOT EXISTS tiktok_url text DEFAULT '';
ALTER TABLE public.affiliates ADD COLUMN IF NOT EXISTS linkedin_url text DEFAULT '';
ALTER TABLE public.affiliates ADD COLUMN IF NOT EXISTS audience_size text DEFAULT '';

-- Add commission tracking fields to referrals
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS subscription_start_date timestamptz;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS commission_expiry_date timestamptz;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS commissions_paid integer DEFAULT 0;
