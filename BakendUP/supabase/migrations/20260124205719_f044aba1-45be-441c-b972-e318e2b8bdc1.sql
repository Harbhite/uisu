-- Create newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    source TEXT DEFAULT 'website'
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public can subscribe (insert their email)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Only staff can view/manage subscribers
CREATE POLICY "Staff can view subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
TO authenticated
USING (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update subscribers" 
ON public.newsletter_subscribers 
FOR UPDATE 
TO authenticated
USING (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete subscribers" 
ON public.newsletter_subscribers 
FOR DELETE 
TO authenticated
USING (public.is_moderator_or_admin(auth.uid()));

-- Create contact messages table for the contact form
CREATE TABLE public.contact_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_read BOOLEAN NOT NULL DEFAULT false,
    responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact message
CREATE POLICY "Anyone can submit contact message" 
ON public.contact_messages 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Only staff can view/manage messages
CREATE POLICY "Staff can view contact messages" 
ON public.contact_messages 
FOR SELECT 
TO authenticated
USING (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
TO authenticated
USING (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete contact messages" 
ON public.contact_messages 
FOR DELETE 
TO authenticated
USING (public.is_moderator_or_admin(auth.uid()));