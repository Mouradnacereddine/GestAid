
-- Autoriser l'insertion d'articles (INSERT) uniquement avec WITH CHECK
CREATE POLICY "Ajouter des articles" 
  ON public.articles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- La politique SELECT était correcte dans la version précédente,
-- mais je rappelle la commande pour référence, à appliquer si absente :
CREATE POLICY "Consulter les articles"
  ON public.articles
  FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
