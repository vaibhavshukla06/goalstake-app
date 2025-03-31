-- Real-time subscriptions setup for GoalStake App
-- This migration configures Supabase's real-time functionality

-- Enable the realtime extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create a publication for tables that need real-time functionality
-- A publication is a set of changes generated from a table or group of tables
DROP PUBLICATION IF EXISTS goalstake_realtime;
CREATE PUBLICATION goalstake_realtime FOR TABLE
  public.challenges,
  public.participants,
  public.verifications,
  public.notifications,
  public.profiles,
  public.stakes,
  public.transactions;

-- Create specific publications for different app features
-- Challenge discovery publication
DROP PUBLICATION IF EXISTS goalstake_challenges;
CREATE PUBLICATION goalstake_challenges FOR TABLE
  public.challenges 
  WITH (publish = 'insert, update');

-- User progress publication
DROP PUBLICATION IF EXISTS goalstake_progress;
CREATE PUBLICATION goalstake_progress FOR TABLE
  public.participants,
  public.verifications
  WITH (publish = 'insert, update');

-- Notification publication
DROP PUBLICATION IF EXISTS goalstake_notifications;
CREATE PUBLICATION goalstake_notifications FOR TABLE
  public.notifications
  WITH (publish = 'insert, update');

-- Financial tracking publication
DROP PUBLICATION IF EXISTS goalstake_finances;
CREATE PUBLICATION goalstake_finances FOR TABLE
  public.stakes,
  public.transactions
  WITH (publish = 'insert, update');

-- Create webhook functions for real-time events
-- This function is triggered when a verification is submitted
CREATE OR REPLACE FUNCTION public.handle_verification_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Call webhook URL with verification data
  -- This would typically use pg_net extension to make HTTP calls
  -- pg_net is not included in this example as it requires additional setup
  
  -- For now, we'll just log the event
  RAISE NOTICE 'Verification submitted: %', NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for verification webhook
DROP TRIGGER IF EXISTS verification_webhook_trigger ON public.verifications;
CREATE TRIGGER verification_webhook_trigger
  AFTER INSERT ON public.verifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_verification_webhook();

-- This function is triggered when a challenge status changes
CREATE OR REPLACE FUNCTION public.handle_challenge_status_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Only react to status changes
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Call webhook URL with challenge status data
  -- For now, we'll just log the event
  RAISE NOTICE 'Challenge status changed: % from % to %', NEW.id, OLD.status, NEW.status;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for challenge status webhook
DROP TRIGGER IF EXISTS challenge_status_webhook_trigger ON public.challenges;
CREATE TRIGGER challenge_status_webhook_trigger
  AFTER UPDATE OF status ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.handle_challenge_status_webhook();

-- Configure channel settings
COMMENT ON PUBLICATION goalstake_realtime IS 'Main publication for all GoalStake real-time events';
COMMENT ON PUBLICATION goalstake_challenges IS 'Publication for challenge discovery and updates';
COMMENT ON PUBLICATION goalstake_progress IS 'Publication for tracking user progress in challenges';
COMMENT ON PUBLICATION goalstake_notifications IS 'Publication for user notification delivery';
COMMENT ON PUBLICATION goalstake_finances IS 'Publication for financial transaction tracking';

-- Sample subscription query to use in client code:
/*
  // Subscribe to challenge updates
  const challengeSubscription = supabase
    .channel('public:challenges')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'challenges',
      },
      (payload) => {
        console.log('Change received!', payload)
        // Update UI with new challenge data
      }
    )
    .subscribe()

  // Subscribe to notifications
  const notificationSubscription = supabase
    .channel('public:notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('New notification!', payload)
        // Show notification to user
      }
    )
    .subscribe()

  // Subscribe to participant progress updates
  const progressSubscription = supabase
    .channel('public:participants')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'participants',
        filter: `challenge_id=eq.${challengeId}`,
      },
      (payload) => {
        console.log('Progress update!', payload)
        // Update progress UI
      }
    )
    .subscribe()
*/ 