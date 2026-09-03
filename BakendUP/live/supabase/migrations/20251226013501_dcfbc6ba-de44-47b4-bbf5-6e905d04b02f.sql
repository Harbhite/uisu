-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Update trigger to copy email on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  RETURN new;
END;
$$;

-- Update existing profiles with emails from auth.users (one-time sync)
-- This requires a security definer function since we can't query auth.users directly
CREATE OR REPLACE FUNCTION public.sync_profile_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id AND p.email IS NULL;
END;
$$;

-- Run the sync
SELECT public.sync_profile_emails();

-- Function to check if user is moderator or admin
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'moderator')
  )
$$;

-- Function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') THEN 'admin'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'moderator') THEN 'moderator'
    ELSE 'user'
  END
$$;

-- RLS: Moderators can view admin users list (but not manage)
CREATE POLICY "Moderators can view roles"
ON public.user_roles
FOR SELECT
USING (public.is_moderator_or_admin(auth.uid()));

-- Update documents policy: Moderators can also delete any document
DROP POLICY IF EXISTS "Users can delete own documents or admins can delete any" ON public.documents;
CREATE POLICY "Users can delete own documents or staff can delete any"
ON public.documents
FOR DELETE
USING (
    auth.uid() = uploaded_by 
    OR public.is_moderator_or_admin(auth.uid())
);

-- Update events policies for moderators
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
CREATE POLICY "Users can update own events or staff can update any"
ON public.events
FOR UPDATE
USING (auth.uid() = created_by OR public.is_moderator_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can delete own events" ON public.events;
CREATE POLICY "Users can delete own events or staff can delete any"
ON public.events
FOR DELETE
USING (auth.uid() = created_by OR public.is_moderator_or_admin(auth.uid()));

-- Update announcements policies for moderators
DROP POLICY IF EXISTS "Users can update own announcements" ON public.announcements;
CREATE POLICY "Users can update own announcements or staff can update any"
ON public.announcements
FOR UPDATE
USING (auth.uid() = created_by OR public.is_moderator_or_admin(auth.uid()));

-- Add delete policy for announcements
CREATE POLICY "Staff can delete announcements"
ON public.announcements
FOR DELETE
USING (public.is_moderator_or_admin(auth.uid()));