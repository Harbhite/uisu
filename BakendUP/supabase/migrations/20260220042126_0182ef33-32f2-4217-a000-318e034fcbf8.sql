
-- Create storage bucket for form file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('form-uploads', 'form-uploads', true);

-- Allow anyone to upload files to form-uploads bucket
CREATE POLICY "Anyone can upload form files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'form-uploads');

-- Allow public read access to form uploads
CREATE POLICY "Form uploads are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'form-uploads');

-- Allow uploaders to delete their own files
CREATE POLICY "Users can delete own form uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'form-uploads');
