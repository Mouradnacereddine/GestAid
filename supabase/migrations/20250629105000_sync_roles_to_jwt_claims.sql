-- This migration ensures that the user's role from the 'profiles' table
-- is automatically included in their authentication token (JWT).
-- This is crucial for Row Level Security (RLS) policies to work correctly.

-- 1. Create a function that copies the role from 'profiles' to 'auth.users.raw_user_meta_data'.
-- Anything in 'raw_user_meta_data' is automatically added to the JWT.
CREATE OR REPLACE FUNCTION public.update_user_claims()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('user_role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- 2. Create a trigger that calls the function whenever a profile is created or the 'role' is updated.
DROP TRIGGER IF EXISTS on_profile_change ON public.profiles;
CREATE TRIGGER on_profile_change
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_user_claims();

-- 3. One-time backfill for existing users.
-- This ensures that users created *before* this migration also get their roles updated in the JWT.
DO $$
DECLARE
    profile_record RECORD;
BEGIN
    FOR profile_record IN SELECT id, role FROM public.profiles WHERE role IS NOT NULL LOOP
        UPDATE auth.users
        SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('user_role', profile_record.role)
        WHERE id = profile_record.id;
    END LOOP;
END $$;
