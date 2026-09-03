
-- 1. editorial_board table (must be first for the function)
CREATE TABLE public.editorial_board (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'contributor',
  display_name text NOT NULL,
  bio text,
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.editorial_board ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Editorial board viewable by everyone" ON public.editorial_board FOR SELECT USING (true);
CREATE POLICY "Staff can manage editorial board" ON public.editorial_board FOR ALL USING (is_moderator_or_admin(auth.uid()));

-- 2. Security definer function
CREATE OR REPLACE FUNCTION public.is_gazette_editor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.editorial_board
    WHERE user_id = _user_id
      AND is_active = true
  )
$$;

-- 3. gazette_issues table
CREATE TABLE public.gazette_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_number integer NOT NULL,
  issue_number integer NOT NULL,
  title text NOT NULL,
  description text,
  cover_image text,
  published_at timestamptz,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(volume_number, issue_number)
);
ALTER TABLE public.gazette_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published issues viewable by everyone" ON public.gazette_issues FOR SELECT USING (status = 'published');
CREATE POLICY "Staff and editors can view all issues" ON public.gazette_issues FOR SELECT USING (is_moderator_or_admin(auth.uid()) OR is_gazette_editor(auth.uid()));
CREATE POLICY "Staff can manage issues" ON public.gazette_issues FOR ALL USING (is_moderator_or_admin(auth.uid()));
CREATE POLICY "Editors can create issues" ON public.gazette_issues FOR INSERT WITH CHECK (is_gazette_editor(auth.uid()));
CREATE POLICY "Editors can update issues" ON public.gazette_issues FOR UPDATE USING (is_gazette_editor(auth.uid()));

-- 4. gazette_articles table
CREATE TABLE public.gazette_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid REFERENCES public.gazette_issues(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text,
  cover_image text,
  category text NOT NULL DEFAULT 'News',
  article_type text NOT NULL DEFAULT 'editorial',
  author_id uuid,
  author_name text NOT NULL,
  is_published boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  reading_time integer DEFAULT 1,
  tags text[] DEFAULT '{}'::text[],
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.gazette_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles viewable by everyone" ON public.gazette_articles FOR SELECT USING (is_published = true);
CREATE POLICY "Authors can view own articles" ON public.gazette_articles FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Staff can view all articles" ON public.gazette_articles FOR SELECT USING (is_moderator_or_admin(auth.uid()));
CREATE POLICY "Editors can create articles" ON public.gazette_articles FOR INSERT WITH CHECK (is_gazette_editor(auth.uid()) OR is_moderator_or_admin(auth.uid()));
CREATE POLICY "Authors can update own articles" ON public.gazette_articles FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Staff can update any article" ON public.gazette_articles FOR UPDATE USING (is_moderator_or_admin(auth.uid()));
CREATE POLICY "Staff can delete articles" ON public.gazette_articles FOR DELETE USING (is_moderator_or_admin(auth.uid()));

-- 5. gazette_comments table
CREATE TABLE public.gazette_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.gazette_articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.gazette_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments on published articles viewable" ON public.gazette_comments FOR SELECT USING (EXISTS (SELECT 1 FROM public.gazette_articles WHERE id = gazette_comments.article_id AND is_published = true));
CREATE POLICY "Auth users can create gazette comments" ON public.gazette_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gazette comments" ON public.gazette_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users or staff can delete gazette comments" ON public.gazette_comments FOR DELETE USING (auth.uid() = user_id OR is_moderator_or_admin(auth.uid()));

-- 6. gazette_reactions table
CREATE TABLE public.gazette_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.gazette_articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_id, user_id, reaction_type)
);
ALTER TABLE public.gazette_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reactions viewable by everyone" ON public.gazette_reactions FOR SELECT USING (true);
CREATE POLICY "Auth users can react" ON public.gazette_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON public.gazette_reactions FOR DELETE USING (auth.uid() = user_id);

-- 7. gazette_bookmarks table
CREATE TABLE public.gazette_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.gazette_articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_id, user_id)
);
ALTER TABLE public.gazette_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON public.gazette_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookmarks" ON public.gazette_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.gazette_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.gazette_articles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gazette_comments;
