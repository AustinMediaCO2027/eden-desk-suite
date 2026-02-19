
-- Add trial tracking columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS trial_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_start_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS trial_end_date timestamp with time zone;

-- Backfill: if someone already had a trial, mark it used
UPDATE public.profiles 
SET trial_used = true 
WHERE subscription_plan = 'trial' OR trial_ends_at IS NOT NULL;
