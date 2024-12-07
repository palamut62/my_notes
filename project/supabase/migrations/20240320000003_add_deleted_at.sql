-- Add deleted_at column to notes table
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
