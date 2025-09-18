-- Restrict agencies SELECT: admins see only their agency, superadmins see all
-- 1) Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view agencies" ON public.agencies;

-- 2) Superadmins can view all agencies (SELECT)
DROP POLICY IF EXISTS "Superadmins can view agencies (select)" ON public.agencies;
CREATE POLICY "Superadmins can view agencies (select)"
  ON public.agencies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );

-- 3) Admins can view their own agency (SELECT scoped)
DROP POLICY IF EXISTS "Admins can view their agency" ON public.agencies;
CREATE POLICY "Admins can view their agency"
  ON public.agencies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin' AND p.agency_id = agencies.id
    )
  );