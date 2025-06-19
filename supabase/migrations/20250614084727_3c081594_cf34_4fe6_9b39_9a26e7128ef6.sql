
-- Supprimer les anciennes politiques pour les catégories
DROP POLICY IF EXISTS "Everyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins and managers can manage categories" ON public.categories;

-- Créer de nouvelles politiques plus permissives pour les catégories
CREATE POLICY "Everyone can view categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage categories" ON public.categories FOR ALL TO authenticated USING (true);

-- Également mettre à jour les politiques pour les articles pour être cohérent
DROP POLICY IF EXISTS "Everyone can view articles" ON public.articles;
DROP POLICY IF EXISTS "Admins and managers can manage articles" ON public.articles;

CREATE POLICY "Everyone can view articles" ON public.articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage articles" ON public.articles FOR ALL TO authenticated USING (true);
