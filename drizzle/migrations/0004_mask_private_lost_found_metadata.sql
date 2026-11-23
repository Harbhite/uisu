CREATE OR REPLACE FUNCTION public.get_public_lost_found_items()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  description text,
  category text,
  item_type text,
  location text,
  photos text[],
  contact_info text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  ai_tags text[],
  ai_attributes jsonb,
  ai_summary text,
  ai_rewritten_description text,
  contact_hidden boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    i.id,
    CASE
      WHEN i.user_id = auth.uid() OR public.is_moderator_or_admin(auth.uid())
      THEN i.user_id
      ELSE NULL::uuid
    END AS user_id,
    i.title,
    i.description,
    i.category,
    i.item_type,
    i.location,
    i.photos,
    CASE
      WHEN i.item_type = 'found'
        AND i.user_id IS DISTINCT FROM auth.uid()
        AND NOT public.is_moderator_or_admin(auth.uid())
      THEN NULL
      ELSE i.contact_info
    END AS contact_info,
    i.status,
    i.created_at,
    i.updated_at,
    i.ai_tags,
    NULL::jsonb AS ai_attributes,
    NULL::text AS ai_summary,
    i.ai_rewritten_description,
    (i.item_type = 'found'
      AND i.contact_info IS NOT NULL
      AND i.user_id IS DISTINCT FROM auth.uid()
      AND NOT public.is_moderator_or_admin(auth.uid())) AS contact_hidden
  FROM public.lost_found_items AS i
  WHERE i.status = 'active'
  ORDER BY i.created_at DESC;
$$;