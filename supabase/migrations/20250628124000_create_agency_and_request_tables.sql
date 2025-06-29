-- Function to get a claim from the JWT.
-- This is used in RLS policies to check the user's role.
CREATE OR REPLACE FUNCTION public.get_my_claim(claim TEXT)
RETURNS JSONB
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(current_setting('request.jwt.claims', true)::jsonb ->> claim, null)::jsonb;
$$;

-- Create agencies table
-- This table stores information about the different agencies or branches.
CREATE TABLE IF NOT EXISTS public.agencies (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    admin_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT agencies_pkey PRIMARY KEY (id),
    CONSTRAINT agencies_name_key UNIQUE (name),
    CONSTRAINT agencies_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Create admin_signup_requests table
-- This table stores requests from users who want to become admins.
CREATE TABLE IF NOT EXISTS public.admin_signup_requests (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    agency_name text NOT NULL,
    status text NOT NULL DEFAULT 'pending', -- can be 'pending', 'approved', 'rejected'
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    CONSTRAINT admin_signup_requests_pkey PRIMARY KEY (id),
    CONSTRAINT admin_signup_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)
);

-- Add RLS policies for the new tables
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_signup_requests ENABLE ROW LEVEL SECURITY;

-- Policies for 'agencies'
CREATE POLICY "Superadmins can manage agencies" ON public.agencies
FOR ALL
TO authenticated
USING (
  (get_my_claim('user_role'::text)) = '"superadmin"'::jsonb
)
WITH CHECK (
  (get_my_claim('user_role'::text)) = '"superadmin"'::jsonb
);

CREATE POLICY "Authenticated users can view agencies" ON public.agencies
FOR SELECT
TO authenticated
USING (true);

-- Policies for 'admin_signup_requests'
CREATE POLICY "Superadmins can manage admin signup requests" ON public.admin_signup_requests
FOR ALL
TO authenticated
USING (
  (get_my_claim('user_role'::text)) = '"superadmin"'::jsonb
)
WITH CHECK (
  (get_my_claim('user_role'::text)) = '"superadmin"'::jsonb
);

-- Allow users to create their own signup requests
CREATE POLICY "Users can create their own signup request" ON public.admin_signup_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
