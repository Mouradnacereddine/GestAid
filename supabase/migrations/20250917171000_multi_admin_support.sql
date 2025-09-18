-- Multi-admin support across an agency
-- Idempotent helper and policies to ensure any user with role admin or superadmin
-- gets full admin permissions, regardless of agencies.admin_id.

-- Helper: check if user is admin or superadmin via profiles table
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = _user_id AND p.role IN ('admin','superadmin')
  );
$$;

-- Donors
DROP POLICY IF EXISTS "Admins can manage donors (multi-admin)" ON public.donors;
CREATE POLICY "Admins can manage donors (multi-admin)"
  ON public.donors
  FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Beneficiaries
DROP POLICY IF EXISTS "Admins can manage beneficiaries (multi-admin)" ON public.beneficiaries;
CREATE POLICY "Admins can manage beneficiaries (multi-admin)"
  ON public.beneficiaries
  FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Articles
DROP POLICY IF EXISTS "Admins can manage articles (multi-admin)" ON public.articles;
CREATE POLICY "Admins can manage articles (multi-admin)"
  ON public.articles
  FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Loans
DROP POLICY IF EXISTS "Admins can manage loans (multi-admin)" ON public.loans;
CREATE POLICY "Admins can manage loans (multi-admin)"
  ON public.loans
  FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Loan articles
DROP POLICY IF EXISTS "Admins can manage loan_articles (multi-admin)" ON public.loan_articles;
CREATE POLICY "Admins can manage loan_articles (multi-admin)"
  ON public.loan_articles
  FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Donations
DROP POLICY IF EXISTS "Admins can manage donations (multi-admin)" ON public.donations;
CREATE POLICY "Admins can manage donations (multi-admin)"
  ON public.donations
  FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Financial transactions (broaden to superadmin as well)
DROP POLICY IF EXISTS "Admins can manage financial transactions" ON public.financial_transactions;
CREATE POLICY "Admins can manage financial transactions"
  ON public.financial_transactions
  FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));