-- Create a storage bucket for tour images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tour-images',
  'tour-images',
  true, -- Make it public so images can be accessed via URL
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the tour-images bucket
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload tour images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'tour-images');

-- Allow anyone to view tour images (since they're public)
CREATE POLICY "Anyone can view tour images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'tour-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own tour images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'tour-images' AND auth.uid()::text = owner)
WITH CHECK (bucket_id = 'tour-images' AND auth.uid()::text = owner);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own tour images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'tour-images' AND auth.uid()::text = owner);
