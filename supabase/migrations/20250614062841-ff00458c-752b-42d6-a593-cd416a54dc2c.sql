
-- Créer les types énumérés
CREATE TYPE public.article_state AS ENUM ('neuf', 'tres_bon', 'bon', 'usage', 'a_reparer');
CREATE TYPE public.article_status AS ENUM ('disponible', 'en_pret', 'en_maintenance', 'hors_service');
CREATE TYPE public.donation_type AS ENUM ('materiel', 'financier');
CREATE TYPE public.user_role AS ENUM ('admin', 'gestionnaire', 'benevole', 'consultant');
CREATE TYPE public.transaction_type AS ENUM ('entree', 'sortie');

-- Table des profils utilisateurs
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'benevole',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Table des catégories d'articles
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des donateurs
CREATE TABLE public.donors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'particulier', -- particulier, entreprise, fondation
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des bénéficiaires
CREATE TABLE public.beneficiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  phone TEXT,
  email TEXT,
  address TEXT,
  consent_given BOOLEAN DEFAULT false NOT NULL,
  consent_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des articles
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  state article_state NOT NULL,
  status article_status DEFAULT 'disponible',
  acquisition_date DATE DEFAULT CURRENT_DATE,
  donor_id UUID REFERENCES public.donors(id),
  estimated_value DECIMAL(10,2),
  maintenance_notes TEXT,
  storage_location TEXT,
  photos TEXT[], -- URLs des photos
  barcode TEXT UNIQUE,
  qr_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des prêts
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_number TEXT NOT NULL UNIQUE,
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id),
  loaned_by UUID NOT NULL REFERENCES public.profiles(id),
  loan_date DATE DEFAULT CURRENT_DATE,
  expected_return_date DATE NOT NULL,
  actual_return_date DATE,
  returned_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  contract_signed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des articles prêtés (relation many-to-many entre loans et articles)
CREATE TABLE public.loan_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id),
  return_state article_state,
  return_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des dons
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID NOT NULL REFERENCES public.donors(id),
  donation_type donation_type NOT NULL,
  amount DECIMAL(10,2), -- pour les dons financiers
  description TEXT,
  donation_date DATE DEFAULT CURRENT_DATE,
  receipt_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des transactions financières
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  donation_id UUID REFERENCES public.donations(id),
  article_id UUID REFERENCES public.articles(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des journaux d'activité (audit trail)
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur toutes les tables
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

-- Fonction pour vérifier les rôles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- Fonction pour vérifier si l'utilisateur est admin ou gestionnaire
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role IN ('admin', 'gestionnaire')
  )
$$;

-- Politiques RLS pour les profils
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Politiques RLS pour les catégories
CREATE POLICY "Everyone can view categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can manage categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- Politiques RLS pour les donateurs
CREATE POLICY "Everyone can view donors" ON public.donors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can manage donors" ON public.donors FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- Politiques RLS pour les bénéficiaires
CREATE POLICY "Admins and managers can view beneficiaries" ON public.beneficiaries FOR SELECT TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can manage beneficiaries" ON public.beneficiaries FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- Politiques RLS pour les articles
CREATE POLICY "Everyone can view articles" ON public.articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can manage articles" ON public.articles FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- Politiques RLS pour les prêts
CREATE POLICY "Admins and managers can view loans" ON public.loans FOR SELECT TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can manage loans" ON public.loans FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- Politiques RLS pour les articles prêtés
CREATE POLICY "Admins and managers can view loan articles" ON public.loan_articles FOR SELECT TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can manage loan articles" ON public.loan_articles FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- Politiques RLS pour les dons
CREATE POLICY "Admins and managers can view donations" ON public.donations FOR SELECT TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can manage donations" ON public.donations FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- Politiques RLS pour les transactions financières
CREATE POLICY "Admins can view financial transactions" ON public.financial_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage financial transactions" ON public.financial_transactions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Politiques RLS pour les journaux d'activité
CREATE POLICY "Admins can view activity logs" ON public.activity_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Everyone can create activity logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Trigger pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    'benevole'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER set_updated_at_donors BEFORE UPDATE ON public.donors FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER set_updated_at_beneficiaries BEFORE UPDATE ON public.beneficiaries FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER set_updated_at_articles BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER set_updated_at_loans BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Générer automatiquement les identifiants d'articles
CREATE OR REPLACE FUNCTION public.generate_article_identifier()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.identifier IS NULL THEN
    NEW.identifier := 'ART-' || LPAD(nextval('article_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS article_seq START 1;
CREATE TRIGGER set_article_identifier BEFORE INSERT ON public.articles FOR EACH ROW EXECUTE PROCEDURE public.generate_article_identifier();

-- Générer automatiquement les numéros de prêt
CREATE OR REPLACE FUNCTION public.generate_loan_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.loan_number IS NULL THEN
    NEW.loan_number := 'PRET-' || LPAD(nextval('loan_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS loan_seq START 1;
CREATE TRIGGER set_loan_number BEFORE INSERT ON public.loans FOR EACH ROW EXECUTE PROCEDURE public.generate_loan_number();

-- Insérer quelques catégories par défaut
INSERT INTO public.categories (name, description) VALUES
('Médical', 'Matériel médical et de santé'),
('Mobilier', 'Meubles et équipements de maison'),
('Puériculture', 'Matériel pour enfants et bébés'),
('Électroménager', 'Appareils électroménagers'),
('Informatique', 'Matériel informatique et électronique'),
('Autre', 'Autres articles non classifiés');
