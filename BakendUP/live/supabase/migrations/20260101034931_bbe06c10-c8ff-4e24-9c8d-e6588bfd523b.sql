-- Create comments table for Ink Vault pieces
CREATE TABLE public.ink_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    piece_id UUID NOT NULL REFERENCES public.ink_pieces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_ink_comments_piece_id ON public.ink_comments(piece_id);
CREATE INDEX idx_ink_comments_user_id ON public.ink_comments(user_id);

-- Enable RLS
ALTER TABLE public.ink_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments on published pieces
CREATE POLICY "Comments on published pieces are viewable by everyone"
ON public.ink_comments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.ink_pieces 
        WHERE id = piece_id AND is_published = true
    )
);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON public.ink_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
ON public.ink_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments, mods can delete any
CREATE POLICY "Users can delete own comments or mods can delete any"
ON public.ink_comments
FOR DELETE
USING (auth.uid() = user_id OR is_moderator_or_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_ink_comments_updated_at
BEFORE UPDATE ON public.ink_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();