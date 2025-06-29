-- Alter the approve_admin_request function to use SECURITY INVOKER
-- This allows the function to call auth.admin.invite_user_by_email
-- by using the permissions of the currently logged-in user (the superadmin).
create or replace function public.approve_admin_request(request_id uuid)
returns void
language plpgsql
security invoker set search_path = public
as $$
declare
  req record;
  new_user_id uuid;
  v_agency_id uuid;
  user_email text;
  user_first_name text;
  user_last_name text;
  agency_name_text text;
begin
  -- 1. Fetch the request details and lock the row
  select * into req from public.admin_signup_requests where id = request_id for update;

  -- 2. Check if the request is still pending
  if req.status <> 'pending' then
    raise exception 'La demande n''est plus en attente.';
  end if;

  -- 3. Get request data
  user_email := req.email;
  user_first_name := req.first_name;
  user_last_name := req.last_name;
  agency_name_text := req.agency_name;

  -- 4. Create or find the agency
  select id into v_agency_id from public.agencies where name = agency_name_text;

  if v_agency_id is null then
    insert into public.agencies (name) values (agency_name_text) returning id into v_agency_id;
  end if;

  -- 5. Invite the user via email. This creates an auth user and sends an invitation.
  SELECT (auth.admin.invite_user_by_email(user_email) ->> 'id')::uuid INTO new_user_id;

  -- 6. Create the profile for the new user
  insert into public.profiles (id, first_name, last_name, role, agency_id)
  values (new_user_id, user_first_name, user_last_name, 'admin', v_agency_id);

  -- 7. Set the new user as the admin of the agency if no one is assigned
  update public.agencies set admin_id = new_user_id where id = v_agency_id and admin_id is null;

  -- 8. Update the request status
  update public.admin_signup_requests
  set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
  where id = request_id;

end;
$$;
