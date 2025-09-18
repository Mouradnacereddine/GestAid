/// <reference types="deno" />
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

console.log(`Function "approve-volunteer-request" up and running!`);

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const reqClone = req.clone();
    const bodyText = await reqClone.text();
    console.log(`Received request. Method: ${req.method}, Body: ${bodyText}`);

    const env = {
      SUPABASE_URL: Deno.env.get('SUPABASE_URL') ?? '',
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    };

    // Vérifier que toutes les variables d'environnement sont définies
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({
        error: 'Missing required environment variables'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }

    const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const authHeader = req.headers.get('Authorization');
    const supabaseUserClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("User not found.");
    const adminId = user.id;

    const { request_id } = await JSON.parse(bodyText);
    if (!request_id) {
      return new Response(JSON.stringify({
        error: 'request_id is required'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
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
    const { data: adminProfile, error: adminProfileError } = await supabaseAdmin
      .from('profiles')
      .select('agency_id, role')
      .eq('id', adminId)
      .single();

    if (adminProfileError) throw adminProfileError;
    if (!adminProfile) throw new Error('Admin profile not trouvé.');

    // Seuls les administrateurs (de l'agence) peuvent approuver
    if (adminProfile.role !== 'admin') {
      throw new Error('Seul un admin peut approuver les demandes.');
    }
    if (agency_id !== adminProfile.agency_id) {
      throw new Error('Vous ne pouvez approuver que les demandes de votre agence.');
    }

    let userId;
    let isNewUser = false;

    try {
      const { data: existingUserId, error: rpcError } = await supabaseAdmin.rpc('get_user_id_by_email', {
        p_email: email
      });

      if (rpcError) {
        console.error('Error calling get_user_id_by_email RPC:', rpcError);
        throw rpcError;
      }

      if (existingUserId) {
        userId = existingUserId;
        console.log(`User with email ${email} already exists. Promoting to volunteer. User ID: ${userId}`);
      } else {
        isNewUser = true;
        console.log(`User with email ${email} does not exist. Inviting...`);

        try {
          const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
          if (inviteError) {
            console.error('Error inviting user:', inviteError);
            throw inviteError;
          }
          userId = inviteData.user.id;
          console.log(`Successfully invited new user. User ID: ${userId}`);
        } catch (inviteErr) {
          console.error('Detailed error in invite:', inviteErr);
          throw new Error('Failed to invite user: ' + inviteErr.message);
        }
      }
    } catch (err) {
      console.error('Detailed error in user check:', err);
      throw new Error('Failed to find or create user: ' + err.message);
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
        status: 'approved'
      }).eq('id', request_id);

      if (updateRequestError) throw updateRequestError;

      // Envoyer un email de bienvenue
      const emailTemplate = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue chez GestAid</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { margin-top: 20px; font-size: 0.9em; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Bienvenue dans l'équipe de bénévoles GestAid !</h2>
          <p>Bonjour ${first_name},</p>
          <p>Bonne nouvelle ! Votre demande pour devenir bénévole sur la plateforme GestAid a été approuvée.</p>
          <p>Pour finaliser la création de votre compte et accéder à votre tableau de bord, il vous suffit de créer votre mot de passe en cliquant sur le bouton ci-dessous :</p>
          <a href="{{ .ConfirmationURL }}" class="button">Créer mon mot de passe et me connecter</a>
          <p>Ce lien est unique, sécurisé, et n'est valable que pour une durée limitée.</p>
          <p>Nous sommes ravis de vous compter parmi nos bénévoles.</p>
          <div class="footer">
            <p>L'équipe GestAid</p>
            <p><a href="{{ .SiteURL }}">{{ .SiteURL }}</a></p>
          </div>
        </div>
      </body>
      </html>
      `;

      try {
        await supabaseAdmin.functions.invoke('send-email', {
          body: {
            to: email,
            subject: 'Bienvenue chez GestAid ! Votre compte bénévole est prêt',
            html: emailTemplate
          }
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }

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
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: error instanceof Error ? 400 : 500
    });
  }
});