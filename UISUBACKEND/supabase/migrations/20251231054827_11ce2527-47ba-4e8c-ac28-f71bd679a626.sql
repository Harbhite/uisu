-- Add view_count column to ink_pieces table for tracking views
ALTER TABLE public.ink_pieces ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

-- Create an index for sorting by view_count
CREATE INDEX IF NOT EXISTS idx_ink_pieces_view_count ON public.ink_pieces(view_count DESC);