-- Add categories column to targets table
ALTER TABLE targets 
ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';

-- Create an index for faster filtering if needed
CREATE INDEX IF NOT EXISTS targets_categories_idx ON targets USING GIN (categories);
