-- Create storage bucket for leader images
INSERT INTO storage.buckets (id, name, public) VALUES ('leader-images', 'leader-images', true);

-- Create policies for leader images bucket
CREATE POLICY "Leader images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'leader-images');

CREATE POLICY "Staff can upload leader images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'leader-images' AND is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update leader images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'leader-images' AND is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete leader images"
ON storage.objects FOR DELETE
USING (bucket_id = 'leader-images' AND is_moderator_or_admin(auth.uid()));