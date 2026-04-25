-- 1. Ensure views column exists on faculty_profiles
ALTER TABLE public.faculty_profiles ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 2. Create the increment_views RPC function
-- This function increments the views count for a specific profile
-- We use SECURITY DEFINER to allow public users to increment the count even if they don't have update permissions on the table
CREATE OR REPLACE FUNCTION public.increment_views(profile_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.faculty_profiles
  SET views = COALESCE(views, 0) + 1
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO authenticated;
