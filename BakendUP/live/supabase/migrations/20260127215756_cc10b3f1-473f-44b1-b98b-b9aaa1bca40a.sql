-- Add poetry_layout column to ink_pieces table for poetry format selection
ALTER TABLE public.ink_pieces ADD COLUMN IF NOT EXISTS poetry_layout TEXT DEFAULT 'classic';