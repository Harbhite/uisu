-- Add INSERT and UPDATE policies for clubs table
CREATE POLICY "Authenticated users can create clubs"
ON public.clubs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update clubs"
ON public.clubs
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete clubs"
ON public.clubs
FOR DELETE
TO authenticated
USING (true);

-- Add INSERT and UPDATE policies for administrations table
CREATE POLICY "Authenticated users can create administrations"
ON public.administrations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update administrations"
ON public.administrations
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete administrations"
ON public.administrations
FOR DELETE
TO authenticated
USING (true);