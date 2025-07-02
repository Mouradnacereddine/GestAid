// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log(`Function "approve-admin-request" up and running!`)
console.log('Initializing approve-admin-request function');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Clone the request to log the body without consuming it
    const reqClone = req.clone();
    const bodyText = await reqClone.text();
    console.log(`Received request. Method: ${req.method}, Body: ${bodyText}`);

    // Create a Supabase client with the service_role key to perform admin actions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create a client with the user's auth token to get their ID
    const authHeader = req.headers.get('Authorization')!
    const supabaseUserClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser()
    if (userError) throw userError
    if (!user) throw new Error("User not found. Could not verify the identity of the requester.")
    const superAdminId = user.id

    // Get request_id from the request body
    const { request_id } = await req.json()
    if (!request_id) {
      console.error('Error: request_id is missing from the request body.');
      return new Response(JSON.stringify({ error: 'request_id is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Fetch the request details
    const { data: request, error: requestError } = await supabaseAdmin
      .from('admin_signup_requests')
      .select('*')
      .eq('id', request_id)
      .single()

    if (requestError) throw requestError
    if (!request) throw new Error('Request not found.')
    if (request.status !== 'pending') throw new Error('Request is no longer pending.')

    const { email, first_name, last_name, agency_name } = request

    let userId;
    let isNewUser = false;

    // 1. Check if user already exists using our RPC function
    const { data: existingUserId, error: rpcError } = await supabaseAdmin.rpc('get_user_id_by_email', { p_email: email });

    if (rpcError) {
        console.error('Error checking for existing user via RPC:', rpcError);
        throw new Error('Failed to check for existing user.');
    }

    if (existingUserId) {
        // 2a. User exists, so we'll promote them.
        userId = existingUserId;
        console.log(`User with email ${email} already exists. Promoting to admin. User ID: ${userId}`);
    } else {
        // 2b. User does not exist, so we invite them.
        isNewUser = true;
        console.log(`User with email ${email} does not exist. Inviting...`);
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
console.log('Résultat inviteUserByEmail:', { inviteData, inviteError });
if (inviteError) throw inviteError;
userId = inviteData.user.id;
        console.log(`Successfully invited new user. User ID: ${userId}`);
    }

    // 3. Perform database operations within a transaction-like block
    try {
        // Create or find the agency
        let agencyId;
        const { data: existingAgency } = await supabaseAdmin
            .from('agencies')
            .select('id')
            .eq('name', agency_name)
            .single();

        if (existingAgency) {
            agencyId = existingAgency.id;
        } else {
            const { data: newAgency, error: newAgencyError } = await supabaseAdmin
                .from('agencies')
                .insert({ name: agency_name })
                .select('id')
                .single();
            if (newAgencyError) throw newAgencyError;
            agencyId = newAgency.id;
        }

        // Upsert the user's profile to handle cases where the profile might not exist
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId, // This is the conflict column
                first_name: request.first_name,
                last_name: request.last_name,
                email: request.email, // Ajout de l'email
                role: 'admin',
                agency_id: agencyId
            }, {
                onConflict: 'id' // Specify the column to check for conflicts
            });

        if (profileError) throw profileError;

        // Set the new user as the admin of the agency if no one is assigned
        const { error: updateAgencyError } = await supabaseAdmin
            .from('agencies')
            .update({ admin_id: userId })
            .eq('id', agencyId)
            .is('admin_id', null);
        if (updateAgencyError) throw updateAgencyError;

        // Update the request status to 'approved' et renseigne agency_id
        const { error: updateRequestError } = await supabaseAdmin
            .from('admin_signup_requests')
            .update({
                status: 'approved',
                reviewed_by: superAdminId,
                reviewed_at: new Date().toISOString(),
                agency_id: agencyId, // Ajout de l'agency_id lors de l'approbation
            })
            .eq('id', request_id);
        if (updateRequestError) throw updateRequestError;

        console.log(`Successfully processed approval for request_id: ${request_id}`);

    } catch (dbError) {
        // 4. If any DB operations fail, clean up ONLY if we created a new user.
        if (isNewUser) {
            console.error("Database operation failed after new user invitation. Attempting to clean up.", dbError);
            await supabaseAdmin.auth.admin.deleteUser(userId);
            console.log(`Cleanup successful: deleted user ${userId}`);
        } else {
            console.error("Database operation failed while promoting existing user. No auth user cleanup needed.", dbError);
        }
        // Re-throw the original error to inform the client
        throw dbError;
    }

    return new Response(JSON.stringify({ message: `Admin request for ${email} approved.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Unhandled error in function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/approve-admin-request' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"request_id":"your_request_id"}'

*/
