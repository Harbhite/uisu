-- Drop the existing strict INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON public.documents;

-- Create a more permissive policy for authenticated users
CREATE POLICY "Authenticated users can insert documents" 
ON public.documents 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Add share_token column for shareable links
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS share_token text UNIQUE;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Create index for faster lookups on share_token
CREATE INDEX IF NOT EXISTS idx_documents_share_token ON public.documents(share_token);

-- Allow public access to documents with share token
DROP POLICY IF EXISTS "Public documents viewable via share token" ON public.documents;
CREATE POLICY "Public documents viewable via share token" 
ON public.documents 
FOR SELECT 
USING (is_public = true OR share_token IS NOT NULL);