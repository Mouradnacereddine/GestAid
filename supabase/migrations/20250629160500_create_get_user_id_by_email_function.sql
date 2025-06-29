-- Function to safely get a user's ID from their email address.
-- This function is SECURITY DEFINER, allowing it to query the auth.users table
-- which is normally restricted.
create or replace function get_user_id_by_email(p_email text)
returns uuid
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = p_email limit 1;
  return v_user_id;
end;
$$;

-- Grant execute permission to the service_role, so our Edge Function can call it.
grant execute on function get_user_id_by_email(text) to service_role;
