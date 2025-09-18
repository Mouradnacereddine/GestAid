-- Agency isolation hardening: add agency_id columns and strict RLS across core tables
-- Safe to run multiple times (IF EXISTS / IF NOT EXISTS used). Review in staging first.

-- 1) Ensure admin_signup_requests has agency_id to link created agencies
ALTER TABLE public.admin_signup_requests
  ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agencies(id);
CREATE INDEX IF NOT EXISTS admin_signup_requests_agency_id_idx ON public.admin_signup_requests(agency_id);

-- 2) Add agency_id to business tables that must be scoped
ALTER TABLE public.donors
  ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agencies(id);
CREATE INDEX IF NOT EXISTS donors_agency_id_idx ON public.donors(agency_id);

ALTER TABLE public.beneficiaries
  ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agencies(id);
CREATE INDEX IF NOT EXISTS beneficiaries_agency_id_idx ON public.beneficiaries(agency_id);

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agencies(id);
CREATE INDEX IF NOT EXISTS articles_agency_id_idx ON public.articles(agency_id);

ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agencies(id);
CREATE INDEX IF NOT EXISTS loans_agency_id_idx ON public.loans(agency_id);

ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agencies(id);
CREATE INDEX IF NOT EXISTS donations_agency_id_idx ON public.donations(agency_id);

ALTER TABLE public.financial_transactions
  ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agencies(id);
CREATE INDEX IF NOT EXISTS financial_transactions_agency_id_idx ON public.financial_transactions(agency_id);

-- 3) Best-effort backfill for loans using creator link
UPDATE public.loans l
SET agency_id = p.agency_id
FROM public.profiles p
WHERE l.agency_id IS NULL AND p.id = l.loaned_by;

-- NOTE: For donors/beneficiaries/articles/donations, backfill must be done manually if data exists.
-- You can temporarily set agency_id via admin UI or targeted UPDATEs if you know ownership.

-- 4) Tighten RLS policies: superadmin sees all; admins restricted to their agency
-- Helpers
CREATE OR REPLACE FUNCTION public.is_superadmin(_user uuid)
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = _user AND p.role = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.same_agency(_user uuid, _agency uuid)
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = _user AND p.agency_id = _agency
  );
$$;

CREATE OR REPLACE FUNCTION public.is_agency_admin(_user uuid)
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = _user AND p.role = 'admin'
  );
$$;

-- Donors
DROP POLICY IF EXISTS "Admins and managers can view donors" ON public.donors;
DROP POLICY IF EXISTS "Admins and managers can manage donors" ON public.donors;
DROP POLICY IF EXISTS "Admins can manage donors (multi-admin)" ON public.donors;

CREATE POLICY "superadmin_all_donors"
  ON public.donors FOR ALL TO authenticated
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "agency_read_donors"
  ON public.donors FOR SELECT TO authenticated
  USING (public.same_agency(auth.uid(), donors.agency_id));

CREATE POLICY "agency_admin_write_donors"
  ON public.donors FOR INSERT TO authenticated
  WITH CHECK (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), donors.agency_id));

CREATE POLICY "agency_admin_update_delete_donors"
  ON public.donors FOR UPDATE TO authenticated
  USING (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), donors.agency_id))
  WITH CHECK (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), donors.agency_id));

CREATE POLICY "agency_admin_delete_donors"
  ON public.donors FOR DELETE TO authenticated
  USING (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), donors.agency_id));

-- Beneficiaries
DROP POLICY IF EXISTS "Admins and managers can view beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Admins and managers can manage beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Admins and managers can insert beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Admins and managers can update beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Admins and managers can delete beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Admins can manage beneficiaries (multi-admin)" ON public.beneficiaries;

CREATE POLICY "superadmin_all_beneficiaries"
  ON public.beneficiaries FOR ALL TO authenticated
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "agency_read_beneficiaries"
  ON public.beneficiaries FOR SELECT TO authenticated
  USING (public.same_agency(auth.uid(), beneficiaries.agency_id));

CREATE POLICY "agency_admin_write_beneficiaries"
  ON public.beneficiaries FOR INSERT TO authenticated
  WITH CHECK (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), beneficiaries.agency_id));

CREATE POLICY "agency_admin_update_beneficiaries"
  ON public.beneficiaries FOR UPDATE TO authenticated
  USING (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), beneficiaries.agency_id))
  WITH CHECK (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), beneficiaries.agency_id));

CREATE POLICY "agency_admin_delete_beneficiaries"
  ON public.beneficiaries FOR DELETE TO authenticated
  USING (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), beneficiaries.agency_id));

-- Articles
DROP POLICY IF EXISTS "Everyone can view articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can manage articles" ON public.articles;
DROP POLICY IF EXISTS "Supprimer les articles" ON public.articles;
DROP POLICY IF EXISTS "Modifier les articles" ON public.articles;
DROP POLICY IF EXISTS "Consulter les articles" ON public.articles;
DROP POLICY IF EXISTS "Ajouter des articles" ON public.articles;
DROP POLICY IF EXISTS "Admins can manage articles (multi-admin)" ON public.articles;

CREATE POLICY "superadmin_all_articles"
  ON public.articles FOR ALL TO authenticated
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "agency_read_articles"
  ON public.articles FOR SELECT TO authenticated
  USING (public.same_agency(auth.uid(), articles.agency_id));

CREATE POLICY "agency_admin_write_articles"
  ON public.articles FOR INSERT TO authenticated
  WITH CHECK (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), articles.agency_id));

CREATE POLICY "agency_admin_update_articles"
  ON public.articles FOR UPDATE TO authenticated
  USING (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), articles.agency_id))
  WITH CHECK (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), articles.agency_id));

CREATE POLICY "agency_admin_delete_articles"
  ON public.articles FOR DELETE TO authenticated
  USING (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), articles.agency_id));

-- Loans
DROP POLICY IF EXISTS "Admins and managers can view loans" ON public.loans;
DROP POLICY IF EXISTS "Admins and managers can manage loans" ON public.loans;
DROP POLICY IF EXISTS "Admins can manage loans (multi-admin)" ON public.loans;

CREATE POLICY "superadmin_all_loans"
  ON public.loans FOR ALL TO authenticated
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "agency_read_loans"
  ON public.loans FOR SELECT TO authenticated
  USING (public.same_agency(auth.uid(), loans.agency_id));

CREATE POLICY "agency_admin_write_loans"
  ON public.loans FOR INSERT TO authenticated
  WITH CHECK (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), loans.agency_id));

CREATE POLICY "agency_admin_update_loans"
  ON public.loans FOR UPDATE TO authenticated
  USING (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), loans.agency_id))
  WITH CHECK (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), loans.agency_id));

CREATE POLICY "agency_admin_delete_loans"
  ON public.loans FOR DELETE TO authenticated
  USING (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), loans.agency_id));

-- Loan articles: scope via parent loan
DROP POLICY IF EXISTS "Admins and managers can view loan articles" ON public.loan_articles;
DROP POLICY IF EXISTS "Admins and managers can manage loan articles" ON public.loan_articles;
DROP POLICY IF EXISTS "Admins can manage loan_articles (multi-admin)" ON public.loan_articles;

CREATE POLICY "superadmin_all_loan_articles"
  ON public.loan_articles FOR ALL TO authenticated
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "agency_read_loan_articles"
  ON public.loan_articles FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.loans l
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE l.id = loan_articles.loan_id
      AND (p.role = 'superadmin' OR p.agency_id = l.agency_id)
  ));

CREATE POLICY "agency_admin_write_loan_articles"
  ON public.loan_articles FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.loans l
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE l.id = loan_articles.loan_id
      AND p.role = 'admin'
      AND p.agency_id = l.agency_id
  ));

CREATE POLICY "agency_admin_update_delete_loan_articles"
  ON public.loan_articles FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.loans l
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE l.id = loan_articles.loan_id
      AND p.role = 'admin'
      AND p.agency_id = l.agency_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.loans l
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE l.id = loan_articles.loan_id
      AND p.role = 'admin'
      AND p.agency_id = l.agency_id
  ));

-- Donations
DROP POLICY IF EXISTS "Admins and managers can view donations" ON public.donations;
DROP POLICY IF EXISTS "Admins and managers can manage donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can manage donations (multi-admin)" ON public.donations;

CREATE POLICY "superadmin_all_donations"
  ON public.donations FOR ALL TO authenticated
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "agency_read_donations"
  ON public.donations FOR SELECT TO authenticated
  USING (public.same_agency(auth.uid(), donations.agency_id));

CREATE POLICY "agency_admin_write_donations"
  ON public.donations FOR INSERT TO authenticated
  WITH CHECK (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), donations.agency_id));

CREATE POLICY "agency_admin_update_delete_donations"
  ON public.donations FOR UPDATE TO authenticated
  USING (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), donations.agency_id))
  WITH CHECK (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), donations.agency_id));

CREATE POLICY "agency_admin_delete_donations"
  ON public.donations FOR DELETE TO authenticated
  USING (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), donations.agency_id));

-- Financial transactions
DROP POLICY IF EXISTS "Admins can view financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Admins can manage financial transactions" ON public.financial_transactions;

CREATE POLICY "superadmin_all_financial_transactions"
  ON public.financial_transactions FOR ALL TO authenticated
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "agency_read_financial_transactions"
  ON public.financial_transactions FOR SELECT TO authenticated
  USING (public.same_agency(auth.uid(), financial_transactions.agency_id));

CREATE POLICY "agency_admin_write_financial_transactions"
  ON public.financial_transactions FOR INSERT TO authenticated
  WITH CHECK (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), financial_transactions.agency_id));

CREATE POLICY "agency_admin_update_delete_financial_transactions"
  ON public.financial_transactions FOR UPDATE TO authenticated
  USING (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), financial_transactions.agency_id))
  WITH CHECK (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), financial_transactions.agency_id));

CREATE POLICY "agency_admin_delete_financial_transactions"
  ON public.financial_transactions FOR DELETE TO authenticated
  USING (public.is_agency_admin(auth.uid()) AND public.same_agency(auth.uid(), financial_transactions.agency_id));

-- Profiles: restrict cross-agency visibility
DROP POLICY IF EXISTS "Admins and managers can manage profiles" ON public.profiles;

CREATE POLICY "superadmin_all_profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- Everyone keeps: "Users can view their own profile" (already exists)
-- Update access: members can SELECT within their agency
DROP POLICY IF EXISTS "Users can view profiles in their agency" ON public.profiles;
CREATE POLICY "Users can view profiles in their agency"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.agency_id = profiles.agency_id
    )
  );

-- Agency admins can update profiles of their agency (e.g., set roles for volunteers)
DROP POLICY IF EXISTS "Agency admins can manage their agency profiles" ON public.profiles;
CREATE POLICY "Agency admins can manage their agency profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_agency_admin(auth.uid()) AND EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.agency_id = profiles.agency_id
  ))
  WITH CHECK (public.is_agency_admin(auth.uid()) AND EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.agency_id = profiles.agency_id
  ));