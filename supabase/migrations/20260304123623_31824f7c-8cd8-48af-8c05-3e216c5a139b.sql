
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS free_invoices_used integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_quotes_used integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_letterheads_used integer NOT NULL DEFAULT 0;
