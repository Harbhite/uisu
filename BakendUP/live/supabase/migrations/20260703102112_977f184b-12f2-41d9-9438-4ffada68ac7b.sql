
-- Allow any authenticated user to create their own forms (Google Forms style)
CREATE POLICY "Users can create their own forms" ON public.forms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own forms" ON public.forms FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own forms" ON public.forms FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own forms" ON public.forms FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Form fields: owners can manage fields of their own forms
CREATE POLICY "Owners can manage fields of own forms" ON public.form_fields FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = form_fields.form_id AND f.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = form_fields.form_id AND f.created_by = auth.uid()));

-- Form responses: owners can view/delete responses to their own forms
CREATE POLICY "Owners can view responses to own forms" ON public.form_responses FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = form_responses.form_id AND f.created_by = auth.uid()));

CREATE POLICY "Owners can delete responses to own forms" ON public.form_responses FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = form_responses.form_id AND f.created_by = auth.uid()));
