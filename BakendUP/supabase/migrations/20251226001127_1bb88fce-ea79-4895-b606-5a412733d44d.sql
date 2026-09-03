-- Drop the conflicting policy first
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;

-- Create with a different name
CREATE POLICY "Auth users can upload to documents bucket" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'documents');