
-- Add generation tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS free_generations_used integer NOT NULL DEFAULT 0;
