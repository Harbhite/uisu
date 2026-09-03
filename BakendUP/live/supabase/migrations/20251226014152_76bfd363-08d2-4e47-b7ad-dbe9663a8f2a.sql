-- Create audit_logs table for tracking content changes
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins and moderators can view audit logs
CREATE POLICY "Staff can view audit logs"
ON public.audit_logs
FOR SELECT
USING (is_moderator_or_admin(auth.uid()));

-- Allow inserts from authenticated users (logging their own actions)
CREATE POLICY "Authenticated users can create audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add theharbystud@gmail.com as admin
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'::app_role
FROM public.profiles p
WHERE p.email = 'theharbystud@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;