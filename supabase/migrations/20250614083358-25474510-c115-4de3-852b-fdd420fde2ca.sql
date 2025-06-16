
-- Créer une politique pour permettre la modification des articles
CREATE POLICY "Modifier les articles" 
  ON public.articles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
