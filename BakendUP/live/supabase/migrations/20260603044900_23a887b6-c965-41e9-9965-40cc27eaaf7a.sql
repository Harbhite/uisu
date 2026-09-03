-- Allow owners to update their own sessions (needed to set share_token, is_shared, shared_at)
CREATE POLICY "Users can update own sessions"
ON public.study_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Public view counter bump via SECURITY DEFINER (anon-safe; only increments view_count by 1 on shared rows)
CREATE OR REPLACE FUNCTION public.bump_shared_session_view(_token text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.study_sessions
  SET view_count = view_count + 1
  WHERE share_token = _token AND is_shared = true;
$$;

GRANT EXECUTE ON FUNCTION public.bump_shared_session_view(text) TO anon, authenticated;