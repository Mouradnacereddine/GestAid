DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'superadmin' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE public.user_role ADD VALUE 'superadmin';
    END IF;
END$$;
