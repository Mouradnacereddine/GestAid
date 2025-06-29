-- This migration changes the RLS policies to directly query the 'profiles' table
-- instead of relying on JWT claims, which have proven to be unreliable in this case.

-- Policy for admin_signup_requests
DROP POLICY IF EXISTS "Superadmins can manage admin signup requests" ON public.admin_signup_requests;
CREATE POLICY "Superadmins can manage admin signup requests" ON public.admin_signup_requests
FOR ALL
TO authenticated
USING ( (EXISTS ( SELECT 1 FROM public.profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'superadmin')))) )
WITH CHECK ( (EXISTS ( SELECT 1 FROM public.profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'superadmin')))) );

-- Policy for agencies
DROP POLICY IF EXISTS "Superadmins can manage agencies" ON public.agencies;
CREATE POLICY "Superadmins can manage agencies" ON public.agencies
FOR ALL
TO authenticated
USING ( (EXISTS ( SELECT 1 FROM public.profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'superadmin')))) )
WITH CHECK ( (EXISTS ( SELECT 1 FROM public.profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'superadmin')))) );
