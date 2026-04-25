-- Add missing columns to faculty_profiles
ALTER TABLE public.faculty_profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.faculty_profiles ADD COLUMN IF NOT EXISTS profile_status TEXT DEFAULT 'pending_review';
ALTER TABLE public.faculty_profiles ADD COLUMN IF NOT EXISTS admin_feedback TEXT;
ALTER TABLE public.faculty_profiles ADD COLUMN IF NOT EXISTS note_to_admin TEXT;
