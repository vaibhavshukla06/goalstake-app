-- Set up Supabase real-time subscriptions for collaborative features

-- First, enable the realtime features on the Supabase database
-- This alters the internal configuration to enable real-time subscriptions
BEGIN;

-- Enable replication for all tables that need real-time updates
-- Note: This is a simplification. In production, you'd be more selective
-- about which tables get real-time enabled for performance reasons.

-- Enable publication for all changes (insert, update, delete)
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

-- Add tables to the publication for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.progress_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.verifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_invites;

-- Don't enable real-time for tables with sensitive data (financial data)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.stakes;

-- Enable webhook trigger for new notifications
CREATE OR REPLACE FUNCTION notify_new_notification()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'new_notification', 
        json_build_object(
            'id', NEW.id,
            'user_id', NEW.user_id,
            'title', NEW.title,
            'type', NEW.type
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
DROP TRIGGER IF EXISTS realtime_notification_trigger ON public.notifications;
CREATE TRIGGER realtime_notification_trigger
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION notify_new_notification();

-- Enable webhook trigger for challenge updates
CREATE OR REPLACE FUNCTION notify_challenge_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'challenge_update',
        json_build_object(
            'id', NEW.id,
            'title', NEW.title,
            'operation', TG_OP
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for challenge updates
DROP TRIGGER IF EXISTS realtime_challenge_trigger ON public.challenges;
CREATE TRIGGER realtime_challenge_trigger
AFTER INSERT OR UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION notify_challenge_update();

-- Enable webhook trigger for participant progress updates
CREATE OR REPLACE FUNCTION notify_progress_update()
RETURNS TRIGGER AS $$
DECLARE
    challenge_id_val UUID;
BEGIN
    -- Get the challenge ID for this participant
    SELECT challenge_id INTO challenge_id_val
    FROM public.participants
    WHERE id = NEW.participant_id;
    
    PERFORM pg_notify(
        'progress_update',
        json_build_object(
            'participant_id', NEW.participant_id,
            'challenge_id', challenge_id_val,
            'value', NEW.value,
            'recorded_at', NEW.recorded_at
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for progress updates
DROP TRIGGER IF EXISTS realtime_progress_trigger ON public.progress_records;
CREATE TRIGGER realtime_progress_trigger
AFTER INSERT ON public.progress_records
FOR EACH ROW
EXECUTE FUNCTION notify_progress_update();

-- Insert into migration tracking table
INSERT INTO public._migrations (name) VALUES ('00000000000003_realtime');

COMMIT; 