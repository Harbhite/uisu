ALTER TABLE public.quizlets ADD COLUMN timing_format text NOT NULL DEFAULT 'free-living';
ALTER TABLE public.quizlets ADD COLUMN time_limit integer DEFAULT NULL;
