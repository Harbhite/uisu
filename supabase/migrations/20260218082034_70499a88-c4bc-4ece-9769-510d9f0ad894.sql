
-- 1. Lost & Found Board
CREATE TABLE public.lost_found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'other',
  item_type text NOT NULL DEFAULT 'lost',
  location text,
  photos text[] DEFAULT '{}',
  contact_info text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lost found items viewable by everyone" ON public.lost_found_items FOR SELECT USING (true);
CREATE POLICY "Auth users can create lost found items" ON public.lost_found_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lost found items" ON public.lost_found_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users or staff can delete lost found items" ON public.lost_found_items FOR DELETE USING (auth.uid() = user_id OR is_moderator_or_admin(auth.uid()));

-- 2. Academic Calendar
CREATE TABLE public.academic_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  end_date date,
  event_type text NOT NULL DEFAULT 'general',
  is_important boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Calendar viewable by everyone" ON public.academic_calendar FOR SELECT USING (true);
CREATE POLICY "Staff can insert calendar events" ON public.academic_calendar FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));
CREATE POLICY "Staff can update calendar events" ON public.academic_calendar FOR UPDATE USING (is_moderator_or_admin(auth.uid()));
CREATE POLICY "Staff can delete calendar events" ON public.academic_calendar FOR DELETE USING (is_moderator_or_admin(auth.uid()));

-- 3. Complaints & Petitions
CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  priority text DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  resolution text,
  is_anonymous boolean DEFAULT false,
  upvotes integer DEFAULT 0,
  assigned_to text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own complaints" ON public.complaints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all complaints" ON public.complaints FOR SELECT USING (is_moderator_or_admin(auth.uid()));
CREATE POLICY "Public non-anonymous complaints viewable" ON public.complaints FOR SELECT USING (is_anonymous = false);
CREATE POLICY "Auth users can create complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pending complaints" ON public.complaints FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Staff can update any complaint" ON public.complaints FOR UPDATE USING (is_moderator_or_admin(auth.uid()));
CREATE POLICY "Staff can delete complaints" ON public.complaints FOR DELETE USING (is_moderator_or_admin(auth.uid()));

-- Complaint upvotes tracking
CREATE TABLE public.complaint_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(complaint_id, user_id)
);

ALTER TABLE public.complaint_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view upvotes" ON public.complaint_upvotes FOR SELECT USING (true);
CREATE POLICY "Auth users can upvote" ON public.complaint_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own upvote" ON public.complaint_upvotes FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update upvote count
CREATE OR REPLACE FUNCTION public.update_complaint_upvotes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.complaints SET upvotes = upvotes + 1 WHERE id = NEW.complaint_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.complaints SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.complaint_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_complaint_upvotes_trigger
AFTER INSERT OR DELETE ON public.complaint_upvotes
FOR EACH ROW EXECUTE FUNCTION public.update_complaint_upvotes();

-- 4. Hall Community Posts
CREATE TABLE public.hall_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id uuid NOT NULL REFERENCES public.halls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  post_type text DEFAULT 'discussion',
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.hall_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hall posts viewable by everyone" ON public.hall_posts FOR SELECT USING (true);
CREATE POLICY "Auth users can create hall posts" ON public.hall_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hall posts" ON public.hall_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users or staff can delete hall posts" ON public.hall_posts FOR DELETE USING (auth.uid() = user_id OR is_moderator_or_admin(auth.uid()));

-- 5. Budget Tracker
CREATE TABLE public.budget_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  entry_type text NOT NULL DEFAULT 'expense',
  category text NOT NULL DEFAULT 'other',
  description text,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.budget_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budget entries" ON public.budget_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own budget entries" ON public.budget_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budget entries" ON public.budget_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budget entries" ON public.budget_entries FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for lost-found photos
INSERT INTO storage.buckets (id, name, public) VALUES ('lost-found', 'lost-found', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view lost-found images" ON storage.objects FOR SELECT USING (bucket_id = 'lost-found');
CREATE POLICY "Auth users can upload lost-found images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lost-found' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own lost-found images" ON storage.objects FOR DELETE USING (bucket_id = 'lost-found' AND auth.uid() IS NOT NULL);
