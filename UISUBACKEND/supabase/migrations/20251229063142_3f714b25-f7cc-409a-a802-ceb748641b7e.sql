-- Create ink_pieces table for storing all written content
CREATE TABLE public.ink_pieces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL CHECK (type IN ('Article', 'Blog', 'Report', 'Essay', 'Poetry', 'Opinion', 'Interview', 'Fiction')),
    title text NOT NULL,
    author_name text NOT NULL,
    author_role text,
    summary text,
    content jsonb NOT NULL DEFAULT '{}',
    cover_image text,
    tags text[] DEFAULT '{}',
    is_published boolean DEFAULT false,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ink_pieces ENABLE ROW LEVEL SECURITY;

-- Everyone can view published pieces
CREATE POLICY "Published pieces are viewable by everyone"
ON public.ink_pieces FOR SELECT
USING (is_published = true);

-- Authors can view their own drafts
CREATE POLICY "Authors can view own pieces"
ON public.ink_pieces FOR SELECT
USING (auth.uid() = user_id);

-- Authenticated users can create non-report pieces
CREATE POLICY "Users can create non-report pieces"
ON public.ink_pieces FOR INSERT
WITH CHECK (
    auth.uid() = user_id AND 
    type != 'Report'
);

-- Mods can create any type including reports
CREATE POLICY "Mods can create any piece type"
ON public.ink_pieces FOR INSERT
WITH CHECK (is_moderator_or_admin(auth.uid()));

-- Authors can update their own pieces
CREATE POLICY "Authors can update own pieces"
ON public.ink_pieces FOR UPDATE
USING (auth.uid() = user_id);

-- Mods can update any piece
CREATE POLICY "Mods can update any piece"
ON public.ink_pieces FOR UPDATE
USING (is_moderator_or_admin(auth.uid()));

-- Authors can delete their own unpublished pieces
CREATE POLICY "Authors can delete own unpublished pieces"
ON public.ink_pieces FOR DELETE
USING (auth.uid() = user_id AND is_published = false);

-- Mods can delete any piece
CREATE POLICY "Mods can delete any piece"
ON public.ink_pieces FOR DELETE
USING (is_moderator_or_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_ink_pieces_updated_at
BEFORE UPDATE ON public.ink_pieces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();