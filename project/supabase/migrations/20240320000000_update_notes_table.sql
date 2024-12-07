-- Extend notes table with new columns
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS subtitle text,
ADD COLUMN IF NOT EXISTS background_color text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'JetBrains Mono',
ADD COLUMN IF NOT EXISTS font_size text DEFAULT '16px';
