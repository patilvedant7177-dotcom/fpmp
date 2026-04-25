-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on row level security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active announcements
CREATE POLICY "Allow public read access to active announcements"
  ON public.announcements FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to view all
CREATE POLICY "Allow authenticated read"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated admins to insert/update/delete (Simplified for now to allow all authenticated)
CREATE POLICY "Allow authenticated modifications"
  ON public.announcements FOR ALL
  TO authenticated
  USING (true);
