CREATE OR REPLACE FUNCTION public.get_conversation_recipients(p_conversation_id UUID)
RETURNS TABLE(
  id UUID,
  first_name TEXT,
  last_name TEXT,
  role TEXT -- Ajout de la colonne 'role' pour correspondre à la définition du type Profile
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.role -- Sélectionner la colonne 'role'
  FROM
    public.profiles p
  WHERE
    p.id IN (
      SELECT DISTINCT m.recipient_id
      FROM public.messages m
      WHERE m.conversation_id = p_conversation_id
    );
END;
$$;
