-- Fix shared file policy: require non-null expiry
DROP POLICY IF EXISTS "Anyone can view shared files" ON public.user_files;

CREATE POLICY "Anyone can view shared files" 
ON public.user_files 
FOR SELECT 
USING (
  share_token IS NOT NULL 
  AND share_expiry IS NOT NULL 
  AND share_expiry > now()
);