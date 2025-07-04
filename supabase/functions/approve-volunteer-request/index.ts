/// <reference types="deno" />
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log(`Function "approve-volunteer-request" up and running!`);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const reqClone = req.clone();
    const bodyText = await reqClone.text();
    console.log(`Received request. Method: ${req.method}, Body: ${bodyText}`);

    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    const supabaseUserClient = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_ANON_KEY ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("User not found.");
    const adminId = user.id;

    const { request_id } = await req.json();
    if (!request_id) {
      return new Response(JSON.stringify({ error: 'request_id is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const { data: request, error: requestError } = await supabaseAdmin
      .from('volunteer_signup_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (requestError) throw requestError;
    if (!request) throw new Error('Request not found.');
    if (request.status !== 'pending') throw new Error('Request is no longer pending.');

    const { email, first_name, last_name, agency_id } = request;

    // Vérifier que l'admin peut approuver la demande pour son agence
    const { data: adminAgency, error: adminAgencyError } = await supabaseAdmin
      .from('profiles')
      .select('agency_id')
      .eq('id', adminId)
      .single();

    if (adminAgencyError) throw adminAgencyError;
    if (!adminAgency) throw new Error('Admin profile not found.');
    
    if (agency_id !== adminAgency.agency_id) {
      throw new Error('You can only approve requests for your own agency.');
    }

    let userId;
    let isNewUser = false;

    const { data: existingUserId, error: rpcError } = await supabaseAdmin.rpc('get_user_id_by_email', {
      p_email: email
    });

    if (rpcError) throw rpcError;
    if (existingUserId) {
      userId = existingUserId;
      console.log(`User with email ${email} already exists. Promoting to volunteer. User ID: ${userId}`);
    } else {
      isNewUser = true;
      console.log(`User with email ${email} does not exist. Inviting...`);
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
      if (inviteError) throw inviteError;
      userId = inviteData.user.id;
      console.log(`Successfully invited new user. User ID: ${userId}`);
    }

    try {
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: userId,
        first_name,
        last_name,
        role: 'benevole',
        agency_id,
        currency: 'DZD'
      }, { onConflict: 'id' });

      if (profileError) throw profileError;

      const { error: updateRequestError } = await supabaseAdmin.from('volunteer_signup_requests').update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString()
      }).eq('id', request_id);

      if (updateRequestError) throw updateRequestError;

      console.log(`Successfully processed approval for request_id: ${request_id}`);
    } catch (dbError) {
      if (isNewUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.log(`Cleanup successful: deleted user ${userId}`);
      }
      throw dbError;
    }

    return new Response(JSON.stringify({
      message: `Volunteer request for ${email} approved.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
