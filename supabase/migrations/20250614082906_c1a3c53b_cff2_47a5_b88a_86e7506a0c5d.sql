
-- Vérifier les politiques RLS existantes sur la table articles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'articles';

-- Créer une politique pour permettre la suppression des articles
CREATE POLICY "Supprimer les articles" 
  ON public.articles
  FOR DELETE
  TO authenticated
  USING (true);
