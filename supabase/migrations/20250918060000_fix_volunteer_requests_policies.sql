-- Fix policies so superadmins can read all volunteer requests directly
DROP POLICY IF EXISTS "Superadmins can view all requests" ON public.volunteer_signup_requests;
CREATE POLICY "Superadmins can view all requests"
  ON public.volunteer_signup_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );