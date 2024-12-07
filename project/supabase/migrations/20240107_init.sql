-- Enable Row Level Security
ALTER TABLE public.passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create passwords table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.passwords (
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

-- Create files table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.files (
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

-- Create notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notes (
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

-- Create RLS policies for passwords
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

-- Create RLS policies for files
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

-- Create RLS policies for notes
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON public.passwords(user_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_archived_at ON public.notes(archived_at);
CREATE INDEX IF NOT EXISTS idx_notes_deleted_at ON public.notes(deleted_at);

-- Enable Storage bucket for files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('secure-files', 'secure-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create Storage policy
CREATE POLICY "Users can upload their own files"
    ON storage.objects FOR INSERT
    WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files"
    ON storage.objects FOR SELECT
    USING (auth.uid()::text = (storage.foldername(name))[1]);
