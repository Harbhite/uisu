
-- ========== ACADEMIC PLANNER ==========
CREATE TABLE public.timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_name TEXT NOT NULL,
  course_code TEXT,
  lecturer TEXT,
  location TEXT,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  color TEXT DEFAULT '#003366',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own timetable" ON public.timetable_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own timetable entries" ON public.timetable_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own timetable entries" ON public.timetable_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own timetable entries" ON public.timetable_entries FOR DELETE USING (auth.uid() = user_id);

-- ========== ANONYMOUS CONFESSIONS ==========
CREATE TABLE public.confessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.confessions(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved confessions viewable by all" ON public.confessions FOR SELECT USING (is_approved = true);
CREATE POLICY "Staff can view all confessions" ON public.confessions FOR SELECT USING (is_moderator_or_admin(auth.uid()));
CREATE POLICY "Anyone can submit confessions" ON public.confessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can update confessions" ON public.confessions FOR UPDATE USING (is_moderator_or_admin(auth.uid()));
CREATE POLICY "Staff can delete confessions" ON public.confessions FOR DELETE USING (is_moderator_or_admin(auth.uid()));

CREATE TABLE public.confession_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id UUID NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(confession_id, user_id, reaction_type)
);

ALTER TABLE public.confession_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions viewable by all" ON public.confession_reactions FOR SELECT USING (true);
CREATE POLICY "Auth users can react" ON public.confession_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON public.confession_reactions FOR DELETE USING (auth.uid() = user_id);

-- ========== STUDENT ELECTIONS ==========
CREATE TABLE public.elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Elections viewable by all" ON public.elections FOR SELECT USING (true);
CREATE POLICY "Staff can manage elections" ON public.elections FOR ALL USING (is_moderator_or_admin(auth.uid()));

CREATE TABLE public.election_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  manifesto TEXT,
  photo_url TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.election_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates viewable by all" ON public.election_candidates FOR SELECT USING (true);
CREATE POLICY "Staff can manage candidates" ON public.election_candidates FOR ALL USING (is_moderator_or_admin(auth.uid()));

CREATE TABLE public.election_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.election_candidates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  position TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(election_id, user_id, position)
);

ALTER TABLE public.election_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can vote" ON public.election_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own votes" ON public.election_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all votes" ON public.election_votes FOR SELECT USING (is_moderator_or_admin(auth.uid()));
