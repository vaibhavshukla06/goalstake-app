-- Database Schema Version Control for GoalStake
-- This migration sets up version tracking for database migrations

-- Create a schema_versions table to track migrations
CREATE TABLE IF NOT EXISTS public.schema_versions (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    applied_at TIMESTAMPTZ DEFAULT now(),
    applied_by TEXT,
    success BOOLEAN DEFAULT TRUE
);

-- Add comments to the table for documentation
COMMENT ON TABLE public.schema_versions IS 'Tracks database schema migrations and their application status';
COMMENT ON COLUMN public.schema_versions.version IS 'Version number or identifier (e.g., 1.0.0, 00000000000001)';
COMMENT ON COLUMN public.schema_versions.description IS 'Description of what the migration does';
COMMENT ON COLUMN public.schema_versions.applied_at IS 'Timestamp when the migration was applied';
COMMENT ON COLUMN public.schema_versions.applied_by IS 'User or system that applied the migration';
COMMENT ON COLUMN public.schema_versions.success IS 'Whether the migration was successfully applied';

-- Enable RLS on the schema_versions table
ALTER TABLE public.schema_versions ENABLE ROW LEVEL SECURITY;

-- Only allow admin users to modify schema versions
CREATE POLICY "Allow admins to manage schema versions" ON public.schema_versions
    USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'))
    WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'));

-- Function to record a new migration
CREATE OR REPLACE FUNCTION public.record_migration(
    p_version VARCHAR,
    p_description TEXT,
    p_applied_by TEXT DEFAULT current_user,
    p_success BOOLEAN DEFAULT TRUE
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.schema_versions (version, description, applied_by, success)
    VALUES (p_version, p_description, p_applied_by, p_success)
    ON CONFLICT (version) 
    DO UPDATE SET 
        description = p_description,
        applied_at = now(),
        applied_by = p_applied_by,
        success = p_success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial migrations
SELECT public.record_migration('00000000000000', 'Initial schema version tracking', 'system', TRUE);
SELECT public.record_migration('00000000000001', 'Security policies', 'system', TRUE);
SELECT public.record_migration('00000000000003', 'Database triggers', 'system', TRUE);
SELECT public.record_migration('00000000000004', 'Database indexes', 'system', TRUE);
SELECT public.record_migration('00000000000005', 'Real-time subscriptions', 'system', TRUE);

-- Function to check if a migration has been applied
CREATE OR REPLACE FUNCTION public.migration_exists(p_version VARCHAR) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.schema_versions 
        WHERE version = p_version AND success = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 