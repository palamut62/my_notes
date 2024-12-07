-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.passwords CASCADE;
DROP TABLE IF EXISTS public.files CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;

-- Create passwords table
CREATE TABLE public.passwords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    url TEXT,
    notes TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create files table
CREATE TABLE public.files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    notes TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create notes table
CREATE TABLE public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    background_color TEXT,
    font_family TEXT,
    font_size TEXT
);

-- Enable RLS
ALTER TABLE public.passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own passwords" ON public.passwords;
DROP POLICY IF EXISTS "Users can insert their own passwords" ON public.passwords;
DROP POLICY IF EXISTS "Users can update their own passwords" ON public.passwords;
DROP POLICY IF EXISTS "Users can delete their own passwords" ON public.passwords;

CREATE POLICY "Users can view their own passwords"
    ON public.passwords FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own passwords"
    ON public.passwords FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passwords"
    ON public.passwords FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passwords"
    ON public.passwords FOR DELETE
    USING (auth.uid() = user_id);

-- Files policies
DROP POLICY IF EXISTS "Users can view their own files" ON public.files;
DROP POLICY IF EXISTS "Users can insert their own files" ON public.files;
DROP POLICY IF EXISTS "Users can update their own files" ON public.files;
DROP POLICY IF EXISTS "Users can delete their own files" ON public.files;

CREATE POLICY "Users can view their own files"
    ON public.files FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files"
    ON public.files FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files"
    ON public.files FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
    ON public.files FOR DELETE
    USING (auth.uid() = user_id);

-- Notes policies
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

CREATE POLICY "Users can view their own notes"
    ON public.notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
    ON public.notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
    ON public.notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
    ON public.notes FOR DELETE
    USING (auth.uid() = user_id);

-- Create storage bucket for files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('secure-files', 'secure-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;

CREATE POLICY "Users can upload their own files"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'secure-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'secure-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON public.passwords(user_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_archived_at ON public.notes(archived_at);
CREATE INDEX IF NOT EXISTS idx_notes_deleted_at ON public.notes(deleted_at);
