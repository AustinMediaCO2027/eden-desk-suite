UPDATE public.profiles
SET subscription_plan = 'free',
    trial_active = false,
    trial_start_date = NULL,
    trial_end_date = NULL,
    trial_ends_at = NULL,
    payment_status = CASE WHEN payment_status = 'trialing' THEN 'free' ELSE payment_status END,
    updated_at = now()
WHERE subscription_plan = 'trial'
   OR trial_active IS TRUE
   OR payment_status = 'trialing';