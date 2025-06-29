DO $$
BEGIN
    -- Add 'gestionnaire' to the user_role enum if it doesn't already exist.
    -- This ensures that the handle_new_user trigger, which assigns this role by default,
    -- does not fail on new user creation.
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.user_role'::regtype AND enumlabel = 'gestionnaire') THEN
        ALTER TYPE public.user_role ADD VALUE 'gestionnaire';
    END IF;
END$$;
