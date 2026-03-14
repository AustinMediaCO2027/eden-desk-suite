-- Create a SECURITY DEFINER function to handle referral linking server-side
-- This bypasses RLS so the client doesn't need direct access to affiliates/referrals tables
CREATE OR REPLACE FUNCTION public.link_referral(_affiliate_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _affiliate_id uuid;
  _affiliate_user_id uuid;
  _existing_ref uuid;
  _already_linked uuid;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  SELECT referred_by_affiliate_id INTO _already_linked
  FROM profiles
  WHERE user_id = _user_id;

  IF _already_linked IS NOT NULL THEN
    RETURN jsonb_build_object('skipped', true, 'reason', 'Already linked');
  END IF;

  SELECT id, user_id INTO _affiliate_id, _affiliate_user_id
  FROM affiliates
  WHERE affiliate_code = _affiliate_code
    AND status = 'approved';

  IF _affiliate_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Invalid affiliate code');
  END IF;

  IF _affiliate_user_id = _user_id THEN
    RETURN jsonb_build_object('skipped', true, 'reason', 'Self-referral blocked');
  END IF;

  SELECT id INTO _existing_ref
  FROM referrals
  WHERE affiliate_id = _affiliate_id
    AND referred_user_id = _user_id;

  IF _existing_ref IS NOT NULL THEN
    RETURN jsonb_build_object('skipped', true, 'reason', 'Referral already exists');
  END IF;

  UPDATE profiles
  SET referred_by_affiliate_id = _affiliate_id
  WHERE user_id = _user_id;

  INSERT INTO referrals (affiliate_id, referred_user_id, subscription_plan, is_active)
  VALUES (_affiliate_id, _user_id, '', true);

  RETURN jsonb_build_object('success', true, 'affiliate_id', _affiliate_id);
END;
$$;