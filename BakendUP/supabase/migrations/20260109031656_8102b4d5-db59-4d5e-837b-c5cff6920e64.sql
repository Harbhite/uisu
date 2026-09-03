-- Create audit log trigger for academic_resources table
CREATE OR REPLACE FUNCTION public.log_academic_resources_changes()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'INSERT', 'academic_resources', NEW.id, row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', 'academic_resources', NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', 'academic_resources', OLD.id, row_to_json(OLD));
    RETURN OLD;
  END IF;
END;
$$;

-- Create trigger on academic_resources
DROP TRIGGER IF EXISTS audit_academic_resources ON public.academic_resources;
CREATE TRIGGER audit_academic_resources
  AFTER INSERT OR UPDATE OR DELETE ON public.academic_resources
  FOR EACH ROW EXECUTE FUNCTION public.log_academic_resources_changes();