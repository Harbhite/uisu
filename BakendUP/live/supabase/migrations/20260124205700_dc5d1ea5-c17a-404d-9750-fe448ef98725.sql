-- Drop the overly permissive RLS policies on clubs table
DROP POLICY IF EXISTS "Authenticated users can create clubs" ON public.clubs;
DROP POLICY IF EXISTS "Authenticated users can update clubs" ON public.clubs;
DROP POLICY IF EXISTS "Authenticated users can delete clubs" ON public.clubs;

-- Create secure policies that require admin or moderator role
CREATE POLICY "Staff can create clubs" 
ON public.clubs 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update clubs" 
ON public.clubs 
FOR UPDATE 
TO authenticated
USING (public.is_moderator_or_admin(auth.uid()))
WITH CHECK (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete clubs" 
ON public.clubs 
FOR DELETE 
TO authenticated
USING (public.is_moderator_or_admin(auth.uid()));