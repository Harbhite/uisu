-- First, drop and recreate the hall_type check constraint to allow more types
ALTER TABLE public.halls DROP CONSTRAINT IF EXISTS halls_hall_type_check;

ALTER TABLE public.halls ADD CONSTRAINT halls_hall_type_check 
CHECK (hall_type IN ('Male', 'Female', 'Mixed', 'Postgraduate'));

-- Add postgraduate halls
INSERT INTO public.halls (name, alias, motto, description, hall_type, color, slug, history, lore) VALUES
('Abdulsalam Abubakar Hall', 'The Generals', 'Service Above Self', 'A postgraduate hall named after the former Head of State. Known for its mature and scholarly atmosphere.', 'Postgraduate', '#2563eb', 'abdulsalam', 'Established to accommodate the growing number of postgraduate students, the hall is named after General Abdulsalam Abubakar, a respected former Head of State.', 'The residents are referred to as "Generals" and pride themselves on discipline and academic excellence.'),
('Alexander Brown Hall', 'ABH', 'In Pursuit of Excellence', 'A distinguished postgraduate hall offering serene environment for advanced studies and research.', 'Postgraduate', '#7c3aed', 'alexander-brown', 'Named after a distinguished academic and benefactor of the university, Alexander Brown Hall has been home to many scholars who have gone on to make significant contributions in their fields.', 'The hall is known for hosting intellectual discussions and research symposiums. Residents are called "Brownies".'),
('Postgraduate Hall Complex', 'PG Complex', 'Knowledge is Power', 'The main postgraduate residential complex with modern facilities for research students.', 'Postgraduate', '#0891b2', 'pg-complex', 'Built to provide world-class accommodation for postgraduate students, the complex features modern amenities and quiet study environments conducive to research work.', 'The complex is a melting pot of diverse cultures and academic disciplines, fostering interdisciplinary collaboration.');