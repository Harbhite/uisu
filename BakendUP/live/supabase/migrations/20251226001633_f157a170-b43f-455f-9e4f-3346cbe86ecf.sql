-- Add tags column to documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Update existing documents with sample tags based on doc_type
UPDATE public.documents 
SET tags = CASE 
    WHEN doc_type = 'Constitution' THEN ARRAY['governance', 'official']
    WHEN doc_type = 'Bill' THEN ARRAY['legislation', 'official']
    WHEN doc_type = 'Manifesto' THEN ARRAY['political', 'historical']
    WHEN doc_type = 'Speech' THEN ARRAY['historical', 'archive']
    WHEN doc_type = 'Report' THEN ARRAY['official', 'archive']
    ELSE ARRAY['general']
END
WHERE tags IS NULL OR tags = '{}';