
-- Create complaint_comments table
CREATE TABLE public.complaint_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;

-- Everyone can view comments on non-anonymous complaints
CREATE POLICY "Comments viewable on non-anonymous complaints"
  ON public.complaint_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = complaint_comments.complaint_id
        AND complaints.is_anonymous = false
    )
    OR is_moderator_or_admin(auth.uid())
    OR auth.uid() = (SELECT user_id FROM public.complaints WHERE id = complaint_comments.complaint_id)
  );

-- Authenticated users can create comments
CREATE POLICY "Auth users can create comments"
  ON public.complaint_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete own comments, staff can delete any
CREATE POLICY "Users can delete own or staff delete any"
  ON public.complaint_comments FOR DELETE
  USING (auth.uid() = user_id OR is_moderator_or_admin(auth.uid()));

-- Users can update own comments
CREATE POLICY "Users can update own comments"
  ON public.complaint_comments FOR UPDATE
  USING (auth.uid() = user_id);
