ALTER TABLE public.profiles
ADD COLUMN agency_id uuid;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_agency_id_fkey
FOREIGN KEY (agency_id) REFERENCES public.agencies(id);
