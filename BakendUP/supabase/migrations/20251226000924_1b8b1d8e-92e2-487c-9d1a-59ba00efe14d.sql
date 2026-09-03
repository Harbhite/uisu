-- Create storage policies for the documents bucket

-- Allow anyone to view/download documents (public bucket)
CREATE POLICY "Public can view documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents');

-- Allow anyone to upload documents (for now, can be restricted later)
CREATE POLICY "Anyone can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents');

-- Allow anyone to update documents
CREATE POLICY "Anyone can update documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents');

-- Allow anyone to delete documents
CREATE POLICY "Anyone can delete documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents');