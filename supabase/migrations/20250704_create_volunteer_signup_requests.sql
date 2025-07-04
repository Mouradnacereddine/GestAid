CREATE TABLE IF NOT EXISTS public.volunteer_signup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    agency_id UUID NULL,
    agency_name TEXT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    reviewed_at TIMESTAMP WITH TIME ZONE NULL,
    reviewed_by UUID NULL,
    CONSTRAINT volunteer_signup_requests_agency_id_fkey 
        FOREIGN KEY (agency_id) REFERENCES agencies (id),
    CONSTRAINT volunteer_signup_requests_reviewed_by_fkey 
        FOREIGN KEY (reviewed_by) REFERENCES auth.users (id)
);

CREATE OR REPLACE FUNCTION public.update_agency_name()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.agency_id IS NOT NULL THEN
        SELECT name INTO NEW.agency_name
        FROM agencies
        WHERE id = NEW.agency_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_agency_name 
    BEFORE INSERT OR UPDATE ON volunteer_signup_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_agency_name();

-- RLS Policies
ALTER TABLE volunteer_signup_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can view all requests"
    ON volunteer_signup_requests FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view requests for their agency"
    ON volunteer_signup_requests FOR ALL
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND
            p.agency_id = volunteer_signup_requests.agency_id
        )
    );
