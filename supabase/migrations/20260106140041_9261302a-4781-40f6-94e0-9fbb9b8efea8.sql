-- Create halls table for managing hall of residence data
CREATE TABLE public.halls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  alias TEXT,
  motto TEXT,
  description TEXT,
  history TEXT,
  lore TEXT,
  color TEXT DEFAULT '#6d28d9',
  established_year INTEGER,
  capacity INTEGER,
  hall_type TEXT CHECK (hall_type IN ('Male', 'Female', 'Mixed')),
  image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;

-- Everyone can view halls
CREATE POLICY "Halls are viewable by everyone"
  ON public.halls FOR SELECT
  USING (true);

-- Staff can manage halls
CREATE POLICY "Staff can create halls"
  ON public.halls FOR INSERT
  WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update halls"
  ON public.halls FOR UPDATE
  USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete halls"
  ON public.halls FOR DELETE
  USING (is_moderator_or_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_halls_updated_at
  BEFORE UPDATE ON public.halls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create GPA records table for storing student GPA data
CREATE TABLE public.gpa_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  semester TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  courses JSONB NOT NULL DEFAULT '[]',
  gpa NUMERIC(3,2),
  total_units INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gpa_records ENABLE ROW LEVEL SECURITY;

-- Users can only see their own GPA records
CREATE POLICY "Users can view own GPA records"
  ON public.gpa_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own GPA records"
  ON public.gpa_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own GPA records"
  ON public.gpa_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own GPA records"
  ON public.gpa_records FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_gpa_records_updated_at
  BEFORE UPDATE ON public.gpa_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create resources table for academic materials
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('academic-bank', 'career-hub', 'scholarship-finder', 'mental-wellness', 'study-tools')),
  file_url TEXT,
  external_url TEXT,
  faculty TEXT,
  department TEXT,
  course_code TEXT,
  level TEXT,
  tags TEXT[] DEFAULT '{}',
  is_folder BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  uploaded_by UUID,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Everyone can view public resources
CREATE POLICY "Public resources are viewable by everyone"
  ON public.resources FOR SELECT
  USING (is_public = true);

-- Authenticated users can view all resources
CREATE POLICY "Authenticated users can view all resources"
  ON public.resources FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Staff can manage resources
CREATE POLICY "Staff can create resources"
  ON public.resources FOR INSERT
  WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update resources"
  ON public.resources FOR UPDATE
  USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete resources"
  ON public.resources FOR DELETE
  USING (is_moderator_or_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial halls data
INSERT INTO public.halls (slug, name, alias, motto, description, history, lore, color, hall_type) VALUES
  ('mellamby', 'Kenneth Mellamby Hall', 'Premier Hall', 'Primus Inter Pares', 'The first hall of residence, named after the first Principal, Kenneth Mellamby. Known for its culture of gentility and excellence.', 'Founded in 1952, Kenneth Mellamby Hall stands as the oldest hall of residence in the University of Ibadan. It was named after the first principal of the University College, Ibadan, Dr. Kenneth Mellamby. The hall has maintained a reputation for excellence and gentility, often referred to as the ''Gentlemen''s Hall''.', 'Tradition holds that Mellambites are the epitome of gentlemanly conduct. The ''Aro'' culture, while present, is often more subtle here compared to other male halls.', '#C5A059', 'Male'),
  ('tedder', 'Lord Tedder Hall', 'Man O Man', 'God and Fatherland', 'Strategically located near the academic area. Tedderites are known for their political astuteness.', 'Named after Lord Tedder, a Marshal of the Royal Air Force and Chancellor of the University (1950-1967). It is known for its proximity to the academic areas and has produced numerous student union leaders.', 'Tedderites pride themselves on being politically savvy and intellectually sound. The ''Tedder Box'' is a famous spot for debates and public speaking.', '#8B4513', 'Male'),
  ('kuti', 'Kuti Hall', 'The Fortress', 'Dare to Struggle, Dare to Win', 'Named after Rev. I.O. Ransome-Kuti. Famous for its radicalism and intellectual contributions.', 'Dedicated to the memory of the late Rev. Israel Oludotun Ransome-Kuti, a distinguished Nigerian educationist. The hall is renowned for its activism and strong stance on student welfare.', 'Kuti Hall is known as the ''Fortress'' due to its unified front in times of struggle. The ''Ancestral Grove'' is a sacred ground for hall meetings.', '#15803d', 'Male'),
  ('bello', 'Sultan Bello Hall', 'The Sultanate', 'Nobility', 'Named after Sir Ahmadu Bello. The hall prides itself on leadership and annual state address.', 'Opened in 1962 by Sir Ahmadu Bello, the Sardauna of Sokoto. It is known for its ''State of the Nation'' address delivered by the Hall Mayor, a tradition that attracts dignitaries from across the country.', 'Bellites are referred to as ''Nobles'' and the hall is governed by a Mayor rather than a Chairman, emphasizing its unique administrative structure.', '#1e40af', 'Male'),
  ('queens', 'Queen Elizabeth II Hall', 'Queens', 'Laborare Est Orare', 'Opened by Queen Elizabeth II herself. A female hall known for serenity and elegance.', 'Inaugurated by Her Majesty Queen Elizabeth II in 1956. It was the first female hall of residence and has hosted numerous prominent Nigerian women during their university days.', 'The hall is known for its beautiful architecture and gardens. The ''Queens'' are seen as the matriarchs of the student body.', '#7e22ce', 'Female'),
  ('idia', 'Queen Idia Hall', 'Amazonia', 'Home of Amazons', 'Named after Queen Idia of Benin. Largest female hall, vibrant social atmosphere.', 'Named after the warrior Queen Idia of the Benin Kingdom. It is the largest female hall and a hub of social activities and sports within the university.', 'Idia Hall residents refer to themselves as ''Amazons'', reflecting strength and resilience. The hall''s gyration and social events are legendary.', '#be185d', 'Female'),
  ('indy', 'Independence Hall', 'Katanga Republic', 'Liberty and Service', 'The "Headquarters of Aluta". Established in 1961.', 'Built to commemorate Nigeria''s independence in 1960 and officially opened in 1961. It is often referred to as the ''Katanga Republic'', asserting a spirit of autonomy and resistance.', 'Indy Hall is the heartbeat of student activism (''Aluta''). The ''Katangese'' are known for their solidarity and the famous ''Aro'' culture which is deeply embedded here.', '#b91c1c', 'Male'),
  ('zik', 'Nnamdi Azikiwe Hall', 'Baluba Kingdom', 'Zikism', 'Named after Nigeria''s first President. Largest hall in UI. Famous for "Aroism".', 'Named after Dr. Nnamdi Azikiwe. It is the largest male hall and is located at a distance from the main academic area, giving it a unique, independent character.', 'Zik Hall is the capital of ''Baluba Kingdom''. Residents are ''Zikites''. The hall is famous for its distinct dialect of ''Aroism'' and vigorous gyration sessions.', '#d97706', 'Male'),
  ('awo', 'Obafemi Awolowo Hall', 'Awo', 'Discipline and Integrity', 'Largest student accommodation. A city within a city.', 'Named after Chief Obafemi Awolowo. It is a mixed hall (with separate blocks) and accommodates both undergraduate and postgraduate students. It is the largest hall in terms of population.', 'Awo Hall is often described as a ''City within a City'' due to its size and self-sufficiency. It has its own unique political ecosystem.', '#0f766e', 'Mixed');

-- Create storage bucket for resource files
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resources bucket
CREATE POLICY "Resource files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resources');

CREATE POLICY "Staff can upload resource files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resources' AND is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update resource files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'resources' AND is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete resource files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'resources' AND is_moderator_or_admin(auth.uid()));