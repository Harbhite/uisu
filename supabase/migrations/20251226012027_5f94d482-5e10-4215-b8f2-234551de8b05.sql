-- Allow users to delete their own documents
CREATE POLICY "Users can delete own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = uploaded_by);