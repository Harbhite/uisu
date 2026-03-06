-- Enable realtime for announcements table
ALTER TABLE public.announcements REPLICA IDENTITY FULL;