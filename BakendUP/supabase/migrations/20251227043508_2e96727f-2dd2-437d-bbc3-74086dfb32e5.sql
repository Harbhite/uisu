-- Create a storage bucket for club images (logos, headers)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('club-images', 'club-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to club images
CREATE POLICY "Club images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'club-images');

-- Allow authenticated users (staff) to upload club images
CREATE POLICY "Staff can upload club images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'club-images' AND auth.uid() IS NOT NULL);

-- Allow authenticated users (staff) to update club images
CREATE POLICY "Staff can update club images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'club-images' AND auth.uid() IS NOT NULL);

-- Allow authenticated users (staff) to delete club images
CREATE POLICY "Staff can delete club images"
ON storage.objects FOR DELETE
USING (bucket_id = 'club-images' AND auth.uid() IS NOT NULL);

-- Add header_image_url column to clubs table if not exists
ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS header_image_url TEXT;