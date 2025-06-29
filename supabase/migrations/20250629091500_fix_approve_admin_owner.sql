-- Revert to SECURITY DEFINER and set owner to postgres to allow calling auth.admin functions
-- This is the correct way to bypass the cross-schema security check for this use case.
CREATE OR REPLACE FUNCTION public.approve_admin_request(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET SEARCH_PATH = public
AS $$
DECLARE
  req record;
  new_user_id uuid;
  v_agency_id uuid;
  user_email text;
  user_first_name text;
  user_last_name text;
  agency_name_text text;
BEGIN
  -- 1. Fetch the request details and lock the row
  SELECT * INTO req FROM public.admin_signup_requests WHERE id = request_id FOR UPDATE;

  -- 2. Check if the request is still pending
  IF req.status <> 'pending' THEN
    RAISE EXCEPTION 'La demande n''est plus en attente.';
  END IF;

  -- 3. Get request data
  user_email := req.email;
  user_first_name := req.first_name;
  user_last_name := req.last_name;
  agency_name_text := req.agency_name;

  -- 4. Create or find the agency
  SELECT id INTO v_agency_id FROM public.agencies WHERE name = agency_name_text;

  IF v_agency_id IS NULL THEN
    INSERT INTO public.agencies (name) VALUES (agency_name_text) RETURNING id INTO v_agency_id;
  END IF;

  -- 5. Invite the user via email. This creates an auth user and sends an invitation.
  SELECT (auth.admin.invite_user_by_email(user_email) ->> 'id')::uuid INTO new_user_id;

  -- 6. Create the profile for the new user
  INSERT INTO public.profiles (id, first_name, last_name, role, agency_id)
  VALUES (new_user_id, user_first_name, user_last_name, 'admin', v_agency_id);

  -- 7. Set the new user as the admin of the agency if no one is assigned
  UPDATE public.agencies SET admin_id = new_user_id WHERE id = v_agency_id AND admin_id IS NULL;

  -- 8. Update the request status
  UPDATE public.admin_signup_requests
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = request_id;

END;
$$;

-- Set the owner to the postgres superuser, which has the supabase_admin role
ALTER FUNCTION public.approve_admin_request(uuid) OWNER TO postgres;
