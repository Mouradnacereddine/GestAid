
ALTER TABLE public.loan_articles
ADD COLUMN returned_at TIMESTAMPTZ,
ADD COLUMN returned_by UUID;
