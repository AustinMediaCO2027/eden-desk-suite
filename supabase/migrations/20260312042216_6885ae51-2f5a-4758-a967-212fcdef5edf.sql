
-- Tighten insert policy: only service_role can insert notifications
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
  ON public.notifications AS PERMISSIVE FOR INSERT TO service_role
  WITH CHECK (true);
