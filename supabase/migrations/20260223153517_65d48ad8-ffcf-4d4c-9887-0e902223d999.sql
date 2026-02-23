
-- Trigger to prevent non-admin users from changing affiliate status or affiliate_code
CREATE OR REPLACE FUNCTION public.prevent_affiliate_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status OR OLD.affiliate_code IS DISTINCT FROM NEW.affiliate_code) THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only admins can change affiliate status or code';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_affiliate_status_change
BEFORE UPDATE ON public.affiliates
FOR EACH ROW
EXECUTE FUNCTION public.prevent_affiliate_status_change();
