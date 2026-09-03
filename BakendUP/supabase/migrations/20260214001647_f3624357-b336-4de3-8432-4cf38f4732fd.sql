
-- Forms table
CREATE TABLE public.forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',
  share_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_by uuid NOT NULL,
  settings jsonb DEFAULT '{"require_login": false, "one_response_per_user": false, "show_progress": true, "confirmation_message": "Thank you for your response!"}'::jsonb,
  cover_image text,
  accent_color text DEFAULT '#003366',
  response_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

-- Form fields table
CREATE TABLE public.form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  field_type text NOT NULL DEFAULT 'short_text',
  label text NOT NULL,
  description text,
  placeholder text,
  is_required boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  options jsonb DEFAULT '[]'::jsonb,
  validation jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Form responses table
CREATE TABLE public.form_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  respondent_id uuid,
  respondent_email text,
  respondent_name text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

-- Forms policies (staff-only creation/management)
CREATE POLICY "Staff can create forms" ON public.forms FOR INSERT
  WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update forms" ON public.forms FOR UPDATE
  USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete forms" ON public.forms FOR DELETE
  USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can view all forms" ON public.forms FOR SELECT
  USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Public can view published forms by token" ON public.forms FOR SELECT
  USING (status = 'published' AND share_token IS NOT NULL);

-- Form fields policies
CREATE POLICY "Staff can manage form fields" ON public.form_fields FOR ALL
  USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Public can view fields of published forms" ON public.form_fields FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.forms WHERE forms.id = form_fields.form_id AND forms.status = 'published'
  ));

-- Form responses policies
CREATE POLICY "Anyone can submit responses to published forms" ON public.form_responses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.forms WHERE forms.id = form_responses.form_id AND forms.status = 'published'
  ));

CREATE POLICY "Staff can view all responses" ON public.form_responses FOR SELECT
  USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete responses" ON public.form_responses FOR DELETE
  USING (is_moderator_or_admin(auth.uid()));

-- Trigger to update response count
CREATE OR REPLACE FUNCTION public.update_form_response_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forms SET response_count = response_count + 1 WHERE id = NEW.form_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forms SET response_count = response_count - 1 WHERE id = OLD.form_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_form_response_count_trigger
AFTER INSERT OR DELETE ON public.form_responses
FOR EACH ROW EXECUTE FUNCTION public.update_form_response_count();

-- Trigger for updated_at
CREATE TRIGGER update_forms_updated_at
BEFORE UPDATE ON public.forms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_form_fields_form_id ON public.form_fields(form_id);
CREATE INDEX idx_form_responses_form_id ON public.form_responses(form_id);
CREATE INDEX idx_forms_share_token ON public.forms(share_token);
CREATE INDEX idx_forms_created_by ON public.forms(created_by);
