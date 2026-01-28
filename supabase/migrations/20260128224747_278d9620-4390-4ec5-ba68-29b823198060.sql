-- Create enum for tutor tiers
CREATE TYPE public.tutor_tier AS ENUM ('Official', 'Verified', 'Community');

-- Create enum for tutorial formats
CREATE TYPE public.tutorial_format AS ENUM ('Video', 'Audio', 'Text', 'Essay');

-- Create enum for tutorial levels
CREATE TYPE public.tutorial_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');

-- Create tutors table
CREATE TABLE public.tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  tier tutor_tier NOT NULL DEFAULT 'Community',
  bio TEXT,
  avatar TEXT,
  courses_count INTEGER DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0.0,
  is_verified BOOLEAN DEFAULT false,
  verification_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tutorials table
CREATE TABLE public.tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE NOT NULL,
  format tutorial_format NOT NULL DEFAULT 'Video',
  level tutorial_level NOT NULL DEFAULT 'Beginner',
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0.0,
  ratings_count INTEGER DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tutorial modules table
CREATE TABLE public.tutorial_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_id UUID REFERENCES public.tutorials(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type tutorial_format NOT NULL DEFAULT 'Video',
  content TEXT,
  duration TEXT,
  sort_order INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tutorial enrollments table
CREATE TABLE public.tutorial_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tutorial_id UUID REFERENCES public.tutorials(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, tutorial_id)
);

-- Create tutorial progress table
CREATE TABLE public.tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID REFERENCES public.tutorial_modules(id) ON DELETE CASCADE NOT NULL,
  tutorial_id UUID REFERENCES public.tutorials(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Create tutorial reviews table
CREATE TABLE public.tutorial_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tutorial_id UUID REFERENCES public.tutorials(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tutorial_id)
);

-- Create tutorial bookmarks table
CREATE TABLE public.tutorial_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tutorial_id UUID REFERENCES public.tutorials(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tutorial_id)
);

-- Create tutor applications table
CREATE TABLE public.tutor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  bio TEXT NOT NULL,
  expertise TEXT[] NOT NULL,
  portfolio_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_applications ENABLE ROW LEVEL SECURITY;

-- Tutors policies
CREATE POLICY "Tutors are viewable by everyone" ON public.tutors FOR SELECT USING (true);
CREATE POLICY "Users can create their own tutor profile" ON public.tutors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Tutors can update their own profile" ON public.tutors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Staff can manage tutors" ON public.tutors FOR ALL USING (is_moderator_or_admin(auth.uid()));

-- Tutorials policies
CREATE POLICY "Published tutorials are viewable by everyone" ON public.tutorials FOR SELECT USING (is_published = true AND is_approved = true);
CREATE POLICY "Tutors can view their own tutorials" ON public.tutorials FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tutors WHERE tutors.id = tutorials.tutor_id AND tutors.user_id = auth.uid())
);
CREATE POLICY "Tutors can create tutorials" ON public.tutorials FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.tutors WHERE tutors.id = tutor_id AND tutors.user_id = auth.uid())
);
CREATE POLICY "Tutors can update their own tutorials" ON public.tutorials FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.tutors WHERE tutors.id = tutorials.tutor_id AND tutors.user_id = auth.uid())
);
CREATE POLICY "Staff can manage all tutorials" ON public.tutorials FOR ALL USING (is_moderator_or_admin(auth.uid()));

-- Tutorial modules policies
CREATE POLICY "Modules of published tutorials are viewable" ON public.tutorial_modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tutorials WHERE tutorials.id = tutorial_modules.tutorial_id AND tutorials.is_published = true AND tutorials.is_approved = true)
);
CREATE POLICY "Tutors can manage their tutorial modules" ON public.tutorial_modules FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.tutorials t 
    JOIN public.tutors tu ON t.tutor_id = tu.id 
    WHERE t.id = tutorial_modules.tutorial_id AND tu.user_id = auth.uid()
  )
);
CREATE POLICY "Staff can manage all modules" ON public.tutorial_modules FOR ALL USING (is_moderator_or_admin(auth.uid()));

-- Enrollments policies
CREATE POLICY "Users can view their own enrollments" ON public.tutorial_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll themselves" ON public.tutorial_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unenroll themselves" ON public.tutorial_enrollments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Tutors can view enrollments for their tutorials" ON public.tutorial_enrollments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tutorials t 
    JOIN public.tutors tu ON t.tutor_id = tu.id 
    WHERE t.id = tutorial_enrollments.tutorial_id AND tu.user_id = auth.uid()
  )
);

-- Progress policies
CREATE POLICY "Users can view their own progress" ON public.tutorial_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.tutorial_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own progress" ON public.tutorial_progress FOR DELETE USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.tutorial_reviews FOR SELECT USING (true);
CREATE POLICY "Enrolled users can create reviews" ON public.tutorial_reviews FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM public.tutorial_enrollments WHERE user_id = auth.uid() AND tutorial_id = tutorial_reviews.tutorial_id)
);
CREATE POLICY "Users can update their own reviews" ON public.tutorial_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.tutorial_reviews FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks" ON public.tutorial_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookmarks" ON public.tutorial_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON public.tutorial_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Tutor applications policies
CREATE POLICY "Users can view their own applications" ON public.tutor_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can apply" ON public.tutor_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can view all applications" ON public.tutor_applications FOR SELECT USING (is_moderator_or_admin(auth.uid()));
CREATE POLICY "Staff can update applications" ON public.tutor_applications FOR UPDATE USING (is_moderator_or_admin(auth.uid()));

-- Create function to update tutorial rating
CREATE OR REPLACE FUNCTION public.update_tutorial_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tutorials
  SET 
    rating = (SELECT COALESCE(AVG(rating), 0) FROM public.tutorial_reviews WHERE tutorial_id = COALESCE(NEW.tutorial_id, OLD.tutorial_id)),
    ratings_count = (SELECT COUNT(*) FROM public.tutorial_reviews WHERE tutorial_id = COALESCE(NEW.tutorial_id, OLD.tutorial_id)),
    updated_at = now()
  WHERE id = COALESCE(NEW.tutorial_id, OLD.tutorial_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for rating updates
CREATE TRIGGER update_tutorial_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.tutorial_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_tutorial_rating();

-- Create function to update enrollment counts
CREATE OR REPLACE FUNCTION public.update_tutorial_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tutorials
  SET 
    students_count = (SELECT COUNT(*) FROM public.tutorial_enrollments WHERE tutorial_id = COALESCE(NEW.tutorial_id, OLD.tutorial_id)),
    updated_at = now()
  WHERE id = COALESCE(NEW.tutorial_id, OLD.tutorial_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for enrollment count updates
CREATE TRIGGER update_enrollment_count_trigger
AFTER INSERT OR DELETE ON public.tutorial_enrollments
FOR EACH ROW EXECUTE FUNCTION public.update_tutorial_enrollment_count();

-- Create indexes for better query performance
CREATE INDEX idx_tutorials_tutor_id ON public.tutorials(tutor_id);
CREATE INDEX idx_tutorials_format ON public.tutorials(format);
CREATE INDEX idx_tutorials_level ON public.tutorials(level);
CREATE INDEX idx_tutorials_published ON public.tutorials(is_published, is_approved);
CREATE INDEX idx_tutorial_modules_tutorial_id ON public.tutorial_modules(tutorial_id);
CREATE INDEX idx_tutorial_enrollments_user_id ON public.tutorial_enrollments(user_id);
CREATE INDEX idx_tutorial_enrollments_tutorial_id ON public.tutorial_enrollments(tutorial_id);
CREATE INDEX idx_tutorial_progress_user_id ON public.tutorial_progress(user_id);
CREATE INDEX idx_tutorial_bookmarks_user_id ON public.tutorial_bookmarks(user_id);
CREATE INDEX idx_tutor_applications_status ON public.tutor_applications(status);