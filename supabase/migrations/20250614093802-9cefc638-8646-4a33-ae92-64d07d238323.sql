
-- Créer les politiques RLS manquantes pour la table beneficiaries
CREATE POLICY "Admins and managers can insert beneficiaries" 
  ON public.beneficiaries 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can update beneficiaries" 
  ON public.beneficiaries 
  FOR UPDATE 
  TO authenticated 
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can delete beneficiaries" 
  ON public.beneficiaries 
  FOR DELETE 
  TO authenticated 
  USING (public.is_admin_or_manager(auth.uid()));
