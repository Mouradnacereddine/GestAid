-- Create volunteer_signup_requests table
CREATE TABLE IF NOT EXISTS public.volunteer_signup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  agency_id UUID REFERENCES public.agencies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  agency_name TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_volunteer_requests_email ON public.volunteer_signup_requests(email);
CREATE INDEX IF NOT EXISTS idx_volunteer_requests_agency_id ON public.volunteer_signup_requests(agency_id);

-- Create trigger to update agency_name
CREATE OR REPLACE FUNCTION public.update_agency_name()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.agency_name := (
      SELECT name FROM public.agencies WHERE id = NEW.agency_id
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.agency_id IS DISTINCT FROM OLD.agency_id THEN
      NEW.agency_name := (
        SELECT name FROM public.agencies WHERE id = NEW.agency_id
      );
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agency_name
BEFORE INSERT OR UPDATE ON public.volunteer_signup_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_agency_name();

-- Create RPC function to get user ID by email
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT id FROM auth.users 
    WHERE email = p_email
    LIMIT 1
  );
END;
$$;
