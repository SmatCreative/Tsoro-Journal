-- Tsoro: feature images and document attachments on News posts
-- Run once in Supabase → SQL Editor.

-- 1. Post fields
ALTER TABLE public.pulse_posts ADD COLUMN IF NOT EXISTS image_url   text;
ALTER TABLE public.pulse_posts ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2. Storage for post files. News is readable by everyone, so the files are too.
--    10 MB per file; images (no SVG) and common document types only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('news-media', 'news-media', true, 10485760, ARRAY[
  'image/jpeg','image/png','image/webp','image/gif',
  'application/pdf',
  'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv','text/plain'
])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Each user may only add, replace or remove files inside their own folder: news-media/<their user id>/...
DROP POLICY IF EXISTS "News media: anyone can read" ON storage.objects;
CREATE POLICY "News media: anyone can read" ON storage.objects
  FOR SELECT USING (bucket_id = 'news-media');

DROP POLICY IF EXISTS "News media: upload to own folder" ON storage.objects;
CREATE POLICY "News media: upload to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'news-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "News media: update own files" ON storage.objects;
CREATE POLICY "News media: update own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'news-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "News media: delete own files" ON storage.objects;
CREATE POLICY "News media: delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'news-media' AND (storage.foldername(name))[1] = auth.uid()::text);
