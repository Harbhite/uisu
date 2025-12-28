-- Create leaders table for storing current leaders
CREATE TABLE public.leaders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    role text NOT NULL,
    category text NOT NULL CHECK (category IN ('executive', 'principal_officer', 'hall_leader', 'legislator')),
    image text,
    bio text,
    email text,
    socials jsonb DEFAULT '{}'::jsonb,
    constituency text,
    level text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Leaders are viewable by everyone"
ON public.leaders
FOR SELECT
USING (true);

CREATE POLICY "Staff can create leaders"
ON public.leaders
FOR INSERT
WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update leaders"
ON public.leaders
FOR UPDATE
USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete leaders"
ON public.leaders
FOR DELETE
USING (is_moderator_or_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_leaders_updated_at
BEFORE UPDATE ON public.leaders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial data from the static data
INSERT INTO public.leaders (name, role, category, image, bio, email, socials, sort_order) VALUES
('Samuel Samson', 'President', 'executive', '/placeholder.svg', 'Samuel is a final year student of Law, dedicated to student welfare and academic excellence. His vision is to build a union that works for everyone.', 'president@uisu.org', '{"twitter": "#", "linkedin": "#"}', 1),
('Bolaji Ahmed', 'Vice President', 'executive', '/placeholder.svg', 'Bolaji is passionate about creating a supportive environment for all students. She oversees the Academic and Welfare committee.', 'vp@uisu.org', '{"instagram": "#", "linkedin": "#"}', 2),
('Chukwuma David', 'General Secretary', 'executive', '/placeholder.svg', 'David ensures the smooth running of the secretariat. He is known for his attention to detail and organizational skills.', 'gensec@uisu.org', '{"twitter": "#"}', 3),
('Adebayo Tolu', 'Public Relations Officer', 'executive', '/placeholder.svg', 'Tolu manages the image of the union. He is the bridge between the union and the public.', 'pro@uisu.org', '{"twitter": "#", "instagram": "#"}', 4),
('Emmanuel Nwachukwu', 'Treasurer', 'executive', '/placeholder.svg', 'The custodian of the union''s funds, ensuring transparency and accountability in all financial matters.', 'treasurer@uisu.org', '{"linkedin": "#"}', 5),
('Grace Oladipo', 'House Secretary', 'executive', '/placeholder.svg', 'Responsible for the maintenance of the Union building and the general welfare of students in halls.', 'housesecretary@uisu.org', '{"twitter": "#"}', 6),
('Tobi Adewale', 'Sport Secretary', 'executive', '/placeholder.svg', 'Promotes physical fitness and organizes sporting activities to foster unity among students.', 'sports@uisu.org', '{"instagram": "#"}', 7),
('Zainab Ali', 'Assistant General Secretary', 'executive', '/placeholder.svg', 'Assists the General Secretary and manages the union''s correspondence and records.', 'ags@uisu.org', '{"twitter": "#"}', 8);

INSERT INTO public.leaders (name, role, category, image, bio, email, socials, sort_order) VALUES
('Hon. Michael Okpara', 'The Speaker', 'principal_officer', '/placeholder.svg', 'Presiding officer of the SRC. Dedicated to legislative integrity.', 'speaker@uisu.org', '{"linkedin": "#"}', 1),
('Hon. Sarah Johnson', 'Deputy Speaker', 'principal_officer', '/placeholder.svg', 'Assists the speaker in all legislative duties.', 'deputy.speaker@uisu.org', '{}', 2),
('Hon. Ibrahim Musa', 'Clerk', 'principal_officer', '/placeholder.svg', 'Head of the legislative administration.', 'clerk@uisu.org', '{}', 3),
('Hon. Chisom Okafor', 'Deputy Clerk', 'principal_officer', '/placeholder.svg', 'Assists the Clerk in administrative duties and record keeping.', 'deputyclerk@uisu.org', '{}', 4),
('Hon. Bello Yusuf', 'Chief Whip', 'principal_officer', '/placeholder.svg', 'Maintains order and discipline within the house.', 'chiefwhip@uisu.org', '{"twitter": "#"}', 5);

INSERT INTO public.leaders (name, role, category, image, bio, email, socials, sort_order) VALUES
('Hon. John Doe', 'Majority Leader (Mellamby)', 'hall_leader', '/placeholder.svg', 'Leading the Mellamby Hall caucus in the SRC.', 'mellamby.leader@uisu.org', '{}', 1),
('Hon. Jane Smith', 'Majority Leader (Queens)', 'hall_leader', '/placeholder.svg', 'Representing the interests of Queen Elizabeth II Hall.', 'queens.leader@uisu.org', '{}', 2),
('Hon. David Lee', 'Majority Leader (Tedder)', 'hall_leader', '/placeholder.svg', 'Voice of the Tedderites in the house.', 'tedder.leader@uisu.org', '{}', 3),
('Hon. Amina Bello', 'Majority Leader (Idia)', 'hall_leader', '/placeholder.svg', 'Championing the cause of Queen Idia Hall residents.', 'idia.leader@uisu.org', '{}', 4);

INSERT INTO public.leaders (name, role, category, constituency, level, sort_order) VALUES
('Hon. Adekunle Gold', 'Legislator', 'legislator', 'Kenneth Mellamby Hall', '400', 1),
('Hon. Simi Kosoko', 'Legislator', 'legislator', 'Kenneth Mellamby Hall', '300', 2),
('Hon. Burna Boy', 'Legislator', 'legislator', 'Lord Tedder Hall', '500', 3),
('Hon. Davido Adeleke', 'Legislator', 'legislator', 'Lord Tedder Hall', '200', 4),
('Hon. Fela Anikulapo', 'Legislator', 'legislator', 'Kuti Hall', '400', 5),
('Hon. Ahmadu Bello', 'Legislator', 'legislator', 'Sultan Bello Hall', '500', 6),
('Hon. Tiwa Savage', 'Legislator', 'legislator', 'Queen Elizabeth II Hall', '300', 7),
('Hon. Yemi Alade', 'Legislator', 'legislator', 'Queen Idia Hall', '400', 8),
('Hon. Femi Kuti', 'Legislator', 'legislator', 'Independence Hall', '500', 9),
('Hon. Phyno Fino', 'Legislator', 'legislator', 'Nnamdi Azikiwe Hall', '400', 10),
('Hon. Tems Openiyi', 'Legislator', 'legislator', 'Obafemi Awolowo Hall', '300', 11),
('Hon. Wole Soyinka', 'Legislator', 'legislator', 'Faculty of Arts', '500', 12),
('Hon. Chike Obi', 'Legislator', 'legislator', 'Faculty of Science', '400', 13),
('Hon. Philip Emeagwali', 'Legislator', 'legislator', 'Faculty of Technology', '500', 14),
('Hon. Gani Fawehinmi', 'Legislator', 'legislator', 'Faculty of Law', '500', 15);