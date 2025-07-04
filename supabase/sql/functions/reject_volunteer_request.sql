CREATE OR REPLACE FUNCTION reject_volunteer_request(
    request_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the request status to rejected
    UPDATE volunteer_signup_requests
    SET 
        status = 'rejected',
        reviewed_at = NOW(),
        reviewed_by = auth.uid()
    WHERE id = request_id
    AND status = 'pending';
END;
$$;
