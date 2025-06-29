CREATE OR REPLACE FUNCTION public.get_my_claims()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('request.jwt.claims', true)::jsonb;
$$;
