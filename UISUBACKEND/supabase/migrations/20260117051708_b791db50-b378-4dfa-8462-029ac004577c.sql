-- =====================================================
-- SECURITY FIXES: Fix overly permissive RLS policies
-- =====================================================

-- 1. Fix administrations table RLS policies
DROP POLICY IF EXISTS "Authenticated users can create administrations" ON public.administrations;
DROP POLICY IF EXISTS "Authenticated users can update administrations" ON public.administrations;
DROP POLICY IF EXISTS "Authenticated users can delete administrations" ON public.administrations;

CREATE POLICY "Staff can create administrations" 
ON public.administrations 
FOR INSERT 
WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update administrations" 
ON public.administrations 
FOR UPDATE 
USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete administrations" 
ON public.administrations 
FOR DELETE 
USING (is_moderator_or_admin(auth.uid()));

-- =====================================================
-- NEW FEATURE: Inks Vault Like System
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ink_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  piece_id uuid NOT NULL REFERENCES public.ink_pieces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(piece_id, user_id)
);

ALTER TABLE public.ink_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" 
ON public.ink_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can like pieces" 
ON public.ink_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" 
ON public.ink_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- =====================================================
-- NEW FEATURE: Event RSVP System
-- =====================================================

CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view RSVPs" 
ON public.event_rsvps 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can RSVP" 
ON public.event_rsvps 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own RSVP" 
ON public.event_rsvps 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own RSVP" 
ON public.event_rsvps 
FOR DELETE 
USING (auth.uid() = user_id);

-- =====================================================
-- NEW FEATURE: Job Listings (Career Hub Backend)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.job_listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  job_type text NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'remote', 'internship')),
  industry text NOT NULL,
  description text,
  requirements text[] DEFAULT '{}',
  salary text,
  application_url text,
  deadline date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active job listings" 
ON public.job_listings 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Staff can create job listings" 
ON public.job_listings 
FOR INSERT 
WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update job listings" 
ON public.job_listings 
FOR UPDATE 
USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete job listings" 
ON public.job_listings 
FOR DELETE 
USING (is_moderator_or_admin(auth.uid()));

-- =====================================================
-- STORAGE: Create avatars bucket for profile pictures
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);