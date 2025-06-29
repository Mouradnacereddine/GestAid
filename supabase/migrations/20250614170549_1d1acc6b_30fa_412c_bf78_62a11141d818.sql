
-- Corriger le trigger pour qu'il génère toujours un nouveau numéro, même si loan_number est vide
CREATE OR REPLACE FUNCTION public.generate_loan_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Générer un nouveau numéro même si loan_number est fourni mais vide
  IF NEW.loan_number IS NULL OR NEW.loan_number = '' THEN
    NEW.loan_number := 'PRET-' || LPAD(nextval('loan_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- S'assurer que la colonne loan_number existe avant de la mettre à jour
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS loan_number text UNIQUE;

-- Mettre à jour les prêts existants qui ont un loan_number vide
UPDATE public.loans 
SET loan_number = 'PRET-' || LPAD(nextval('loan_seq')::text, 5, '0')
WHERE loan_number = '' OR loan_number IS NULL;
