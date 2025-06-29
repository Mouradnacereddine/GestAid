-- Créer les types énumérés (de manière idempotente)
DO $$ BEGIN CREATE TYPE public.article_state AS ENUM ('neuf', 'tres_bon', 'bon', 'usage', 'a_reparer'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.article_status AS ENUM ('disponible', 'en_pret', 'en_maintenance', 'hors_service'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.donation_type AS ENUM ('materiel', 'financier'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.user_role AS ENUM ('admin', 'gestionnaire', 'benevole', 'consultant'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.transaction_type AS ENUM ('entree', 'sortie'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Créer les tables (de manière idempotente)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL,
    first_name text, 
    last_name text, 
    email text UNIQUE, 
    role user_role NOT NULL DEFAULT 'benevole'::user_role,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS public.categories (id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL UNIQUE, description TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT now());
CREATE TABLE IF NOT EXISTS public.donors (id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, type TEXT DEFAULT 'particulier', email TEXT, phone TEXT, address TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());
CREATE TABLE IF NOT EXISTS public.beneficiaries (id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, birth_date DATE, phone TEXT, email TEXT, address TEXT, consent_given BOOLEAN DEFAULT false NOT NULL, consent_date TIMESTAMP WITH TIME ZONE, notes TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());
CREATE TABLE IF NOT EXISTS public.articles (id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, identifier TEXT NOT NULL UNIQUE, name TEXT NOT NULL, category_id UUID REFERENCES public.categories(id), state article_state NOT NULL, status article_status DEFAULT 'disponible', acquisition_date DATE DEFAULT CURRENT_DATE, donor_id UUID REFERENCES public.donors(id), estimated_value DECIMAL(10,2), maintenance_notes TEXT, storage_location TEXT, photos TEXT[], barcode TEXT UNIQUE, qr_code TEXT UNIQUE, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());
CREATE TABLE IF NOT EXISTS public.loans (id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, loan_number TEXT NOT NULL UNIQUE, beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id), loaned_by UUID NOT NULL REFERENCES public.profiles(id), loan_date DATE DEFAULT CURRENT_DATE, expected_return_date DATE NOT NULL, actual_return_date DATE, returned_by UUID REFERENCES public.profiles(id), notes TEXT, contract_signed BOOLEAN DEFAULT false, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());
CREATE TABLE IF NOT EXISTS public.loan_articles (id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE, article_id UUID NOT NULL REFERENCES public.articles(id), return_state article_state, return_notes TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT now());
CREATE TABLE IF NOT EXISTS public.donations (id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, donor_id UUID NOT NULL REFERENCES public.donors(id), donation_type donation_type NOT NULL, amount DECIMAL(10,2), description TEXT, donation_date DATE DEFAULT CURRENT_DATE, receipt_generated BOOLEAN DEFAULT false, created_at TIMESTAMP WITH TIME ZONE DEFAULT now());
CREATE TABLE IF NOT EXISTS public.financial_transactions (id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, type transaction_type NOT NULL, amount DECIMAL(10,2) NOT NULL, category TEXT NOT NULL, description TEXT, transaction_date DATE DEFAULT CURRENT_DATE, related_entity_id UUID, related_entity_type TEXT, created_by UUID REFERENCES public.profiles(id), created_at TIMESTAMP WITH TIME ZONE DEFAULT now());
CREATE TABLE IF NOT EXISTS public.activity_logs (id BIGSERIAL PRIMARY KEY, user_id UUID REFERENCES public.profiles(id), action TEXT NOT NULL, details JSONB, timestamp TIMESTAMP WITH TIME ZONE DEFAULT now());

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Fonctions (déjà idempotentes avec CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = _role); END; $$;
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id UUID) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND (role = 'admin' OR role = 'gestionnaire')); END; $$;

-- Politiques RLS (rendues idempotentes en les supprimant d'abord)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles; CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles; CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins and managers can manage profiles" ON public.profiles; CREATE POLICY "Admins and managers can manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
DROP POLICY IF EXISTS "Everyone can view categories" ON public.categories; CREATE POLICY "Everyone can view categories" ON public.categories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins and managers can manage categories" ON public.categories; CREATE POLICY "Admins and managers can manage categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
DROP POLICY IF EXISTS "Admins and managers can view donors" ON public.donors; CREATE POLICY "Admins and managers can view donors" ON public.donors FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins and managers can manage donors" ON public.donors; CREATE POLICY "Admins and managers can manage donors" ON public.donors FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
DROP POLICY IF EXISTS "Admins and managers can view beneficiaries" ON public.beneficiaries; CREATE POLICY "Admins and managers can view beneficiaries" ON public.beneficiaries FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins and managers can manage beneficiaries" ON public.beneficiaries; CREATE POLICY "Admins and managers can manage beneficiaries" ON public.beneficiaries FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
DROP POLICY IF EXISTS "Everyone can view articles" ON public.articles; CREATE POLICY "Everyone can view articles" ON public.articles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins and managers can manage articles" ON public.articles; CREATE POLICY "Admins and managers can manage articles" ON public.articles FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
DROP POLICY IF EXISTS "Admins and managers can view loans" ON public.loans; CREATE POLICY "Admins and managers can view loans" ON public.loans FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins and managers can manage loans" ON public.loans; CREATE POLICY "Admins and managers can manage loans" ON public.loans FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
DROP POLICY IF EXISTS "Admins and managers can view loan articles" ON public.loan_articles; CREATE POLICY "Admins and managers can view loan articles" ON public.loan_articles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins and managers can manage loan articles" ON public.loan_articles; CREATE POLICY "Admins and managers can manage loan articles" ON public.loan_articles FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
DROP POLICY IF EXISTS "Admins and managers can view donations" ON public.donations; CREATE POLICY "Admins and managers can view donations" ON public.donations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins and managers can manage donations" ON public.donations; CREATE POLICY "Admins and managers can manage donations" ON public.donations FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
DROP POLICY IF EXISTS "Admins can view financial transactions" ON public.financial_transactions; CREATE POLICY "Admins can view financial transactions" ON public.financial_transactions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage financial transactions" ON public.financial_transactions; CREATE POLICY "Admins can manage financial transactions" ON public.financial_transactions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs; CREATE POLICY "Admins can view activity logs" ON public.activity_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Everyone can create activity logs" ON public.activity_logs; CREATE POLICY "Everyone can create activity logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Triggers (rendus idempotents)
-- Creates a profile for a new user, inserting only the id and email.
-- first_name, last_name, and role will be populated by the application logic.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles; CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_donors ON public.donors; CREATE TRIGGER set_updated_at_donors BEFORE UPDATE ON public.donors FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_beneficiaries ON public.beneficiaries; CREATE TRIGGER set_updated_at_beneficiaries BEFORE UPDATE ON public.beneficiaries FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_articles ON public.articles; CREATE TRIGGER set_updated_at_articles BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_loans ON public.loans; CREATE TRIGGER set_updated_at_loans BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Séquences et Triggers associés (rendus idempotents)
CREATE OR REPLACE FUNCTION public.generate_article_identifier() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN IF NEW.identifier IS NULL THEN NEW.identifier := 'ART-' || LPAD(nextval('article_seq')::text, 5, '0'); END IF; RETURN NEW; END; $$;
CREATE SEQUENCE IF NOT EXISTS article_seq START 1;
DROP TRIGGER IF EXISTS set_article_identifier ON public.articles; CREATE TRIGGER set_article_identifier BEFORE INSERT ON public.articles FOR EACH ROW EXECUTE PROCEDURE public.generate_article_identifier();

CREATE OR REPLACE FUNCTION public.generate_loan_number() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN IF NEW.loan_number IS NULL THEN NEW.loan_number := 'PRET-' || LPAD(nextval('loan_seq')::text, 5, '0'); END IF; RETURN NEW; END; $$;
CREATE SEQUENCE IF NOT EXISTS loan_seq START 1;
DROP TRIGGER IF EXISTS set_loan_number ON public.loans; CREATE TRIGGER set_loan_number BEFORE INSERT ON public.loans FOR EACH ROW EXECUTE PROCEDURE public.generate_loan_number();

-- Insérer les données de base (de manière idempotente)
INSERT INTO public.categories (name, description) VALUES ('Médical', 'Matériel médical et de santé'), ('Mobilier', 'Meubles et équipements de maison'), ('Puériculture', 'Matériel pour enfants et bébés'), ('Électroménager', 'Appareils électroménagers'), ('Informatique', 'Matériel informatique et électronique'), ('Autre', 'Autres articles non classifiés') ON CONFLICT (name) DO NOTHING;
