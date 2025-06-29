-- This is a targeted migration to fix the claims for the main superadmin user.
DO $$
DECLARE
  superadmin_id uuid;
BEGIN
  -- Find the user ID for the superadmin email
  SELECT id INTO superadmin_id FROM auth.users WHERE email = 'nacereddinemourad09@gmail.com';

  -- If the user is found, update their claims
  IF superadmin_id IS NOT NULL THEN
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('user_role', 'superadmin')
    WHERE id = superadmin_id;
    RAISE NOTICE 'Successfully updated claims for superadmin %', superadmin_id;
  ELSE
    RAISE WARNING 'Superadmin with email nacereddinemourad09@gmail.com not found.';
  END IF;
END $$;
