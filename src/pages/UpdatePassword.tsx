import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function getTokenFromUrl() {
  // Cherche access_token et refresh_token dans le hash ou les query params
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash || window.location.search);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  return { access_token, refresh_token };
}

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  // 1. À l'arrivée sur la page, tente de récupérer le token dans l'URL et de set la session si besoin
  useEffect(() => {
    const checkSession = async () => {
      const { access_token, refresh_token } = getTokenFromUrl();
      if (access_token && refresh_token) {
        // Tentative de mise à jour de la session
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        // Nettoie le hash de l'URL APRES avoir tenté de restaurer la session
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        if (error) {
          setMessage("Lien de réinitialisation invalide ou expiré. Veuillez refaire la demande.");
          setSessionChecked(true);
          setSessionValid(false);
          return;
        }
      }
      // Vérifie la session courante
      const { data, error } = await supabase.auth.getSession();
      if (data.session && data.session.user) {
        setSessionValid(true);
      } else {
        setMessage("Session invalide ou expirée. Veuillez refaire la demande de réinitialisation.");
        setSessionValid(false);
      }
      setSessionChecked(true);
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionValid) {
      setMessage("Session invalide ou expirée. Veuillez refaire la demande de réinitialisation.");
      return;
    }
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(`Erreur : ${error.message}`);
    } else {
      setRedirecting(true);
      navigate('/');
      // Si tu veux afficher un message de succès très bref, tu peux ajouter un mini-loader ici
    }

    setLoading(false);
  };

  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Redirection...</CardTitle>
            <CardDescription>Vous allez être redirigé vers l'application.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!sessionChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Chargement...</CardTitle>
            <CardDescription>Vérification de la session...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!sessionValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erreur de session</CardTitle>
            <CardDescription>{message || "Lien invalide ou expiré."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')}>Retour à la connexion</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Créez votre mot de passe</CardTitle>
          <CardDescription>Veuillez choisir un nouveau mot de passe pour accéder à votre compte.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={!sessionValid || loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !sessionValid}>
                {loading ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
              </Button>
              {message && <p className="text-sm text-center text-gray-600 mt-4">{message}</p>}
              {!sessionValid && (
                <p className="text-sm text-center text-red-600 mt-2">
                  Session absente ou expirée. Veuillez recommencer depuis le lien reçu par email.
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
