/// <reference types="deno" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log(`Function "send-email" up and running!`);

serve(async (req: Request): Promise<Response> => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: to, subject, and html are required'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // TODO: Implémenter l'envoi d'email via SendGrid, SMTP, ou autre service
    // Pour l'instant, on simule l'envoi
    console.log(`Simulating email send to: ${to}`);

    return new Response(JSON.stringify({
      message: 'Email sent successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in send-email function:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error instanceof Error ? 400 : 500
    });
  }
});
