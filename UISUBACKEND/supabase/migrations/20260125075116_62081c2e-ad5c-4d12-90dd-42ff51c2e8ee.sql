-- Create newsletter_campaigns table for tracking sent newsletters
CREATE TABLE public.newsletter_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  html_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_by UUID REFERENCES auth.users(id),
  recipients_count INTEGER DEFAULT 0,
  successful_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for staff-only access
CREATE POLICY "Staff can view newsletter campaigns" 
ON public.newsletter_campaigns 
FOR SELECT 
USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can create newsletter campaigns" 
ON public.newsletter_campaigns 
FOR INSERT 
WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update newsletter campaigns" 
ON public.newsletter_campaigns 
FOR UPDATE 
USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete newsletter campaigns" 
ON public.newsletter_campaigns 
FOR DELETE 
USING (is_moderator_or_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_newsletter_campaigns_updated_at
BEFORE UPDATE ON public.newsletter_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();