-- Create audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE SET NULL,
  actor TEXT NOT NULL, -- 'admin' or 'faculty'
  action TEXT NOT NULL, -- 'submit', 'approve', 'revision', 'message', 'login', 'reject', etc.
  detail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Admins can read all audit logs (Simplified: allow all authenticated users for now)
DROP POLICY IF EXISTS "Admins can read all audit logs" ON public.audit_log;
CREATE POLICY "Admins can read all audit logs"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (true);

-- 2. Anyone authenticated can insert (to allow faculty and admin actions to be logged)
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_log;
CREATE POLICY "Anyone can insert audit logs"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_faculty_id ON public.audit_log(faculty_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
