ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS trial_active boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payfast_subscription_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS payfast_token text DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'inactive';