ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS agency_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conname = 'profiles_agency_id_fkey' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_agency_id_fkey
    FOREIGN KEY (agency_id) REFERENCES public.agencies(id);
  END IF;
END;
$$;
