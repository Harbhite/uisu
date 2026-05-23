-- Add image_url column to quizlets table
ALTER TABLE public.quizlets ADD COLUMN IF NOT EXISTS image_url text;

-- Create storage bucket for quizlet images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('quizlet-images', 'quizlet-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to quizlet images
CREATE POLICY "Quizlet images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'quizlet-images');

-- Allow authenticated users to upload quizlet images
CREATE POLICY "Authenticated users can upload quizlet images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quizlet-images' AND auth.uid() IS NOT NULL);

-- Allow users to update their own quizlet images
CREATE POLICY "Users can update own quizlet images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'quizlet-images' AND auth.uid() IS NOT NULL);

-- Allow users to delete their own quizlet images
CREATE POLICY "Users can delete own quizlet images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'quizlet-images' AND auth.uid() IS NOT NULL);
