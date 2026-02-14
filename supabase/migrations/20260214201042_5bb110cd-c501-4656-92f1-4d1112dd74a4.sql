
-- Add new fields to profiles table for invoice template customization
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_number text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vat_number text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS brand_color text DEFAULT '#2563EB';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS template_style text DEFAULT 'classic';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_name text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account_holder text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account_number text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_branch_code text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account_type text DEFAULT '';
