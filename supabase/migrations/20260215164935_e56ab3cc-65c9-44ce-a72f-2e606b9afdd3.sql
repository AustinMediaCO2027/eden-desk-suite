-- Fix: New users should NOT get auto-trial. Default to 'free' with no trial period.
-- 1. Update the CHECK constraint to include 'free'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_plan_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_subscription_plan_check 
  CHECK (subscription_plan IN ('free', 'trial', 'standard', 'silver', 'premium', 'yearly'));

-- 2. Change default subscription_plan from 'trial' to 'free'
ALTER TABLE public.profiles ALTER COLUMN subscription_plan SET DEFAULT 'free';

-- 3. Change default trial_ends_at from auto 7-day to NULL
ALTER TABLE public.profiles ALTER COLUMN trial_ends_at SET DEFAULT NULL;

-- 4. Fix existing users who are on 'trial' but never paid - reset them to 'free'
UPDATE public.profiles 
SET subscription_plan = 'free', trial_ends_at = NULL 
WHERE subscription_plan = 'trial';