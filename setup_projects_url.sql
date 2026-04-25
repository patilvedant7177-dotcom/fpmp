-- 1. Add URL column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS url TEXT;

-- 2. Convert year to TEXT to support ranges (e.g. 2021-2024) and descriptive statuses
-- This allows you to write "2023" or "2021-2023" or "Completed"
ALTER TABLE public.projects ALTER COLUMN year TYPE TEXT USING year::TEXT;
