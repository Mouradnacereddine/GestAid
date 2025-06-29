-- This migration removes the functions and triggers used for debugging the JWT claims issue.
-- They are no longer needed now that the RLS policies directly check the profiles table.

DROP FUNCTION IF EXISTS public.get_my_claims();

DROP TRIGGER IF EXISTS on_profile_change ON public.profiles;

DROP FUNCTION IF EXISTS public.update_user_claims();
