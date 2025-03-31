-- Triggers for GoalStake
-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create notification table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create notification policies
CREATE POLICY "Users can read their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Trigger for user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email), NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Trigger for challenge progress updates
CREATE OR REPLACE FUNCTION public.update_challenge_progress() 
RETURNS TRIGGER AS $$
DECLARE
  challenge_record RECORD;
  total_days INTEGER;
  completed_days INTEGER;
  progress DECIMAL;
BEGIN
  -- Get challenge information
  SELECT * INTO challenge_record FROM public.challenges WHERE id = NEW.challenge_id;
  
  -- Calculate days between start and end date
  total_days := EXTRACT(DAY FROM (challenge_record.end_date - challenge_record.start_date));
  
  -- Count completed verifications for this participant
  SELECT COUNT(*) INTO completed_days 
  FROM public.verifications 
  WHERE participant_id = NEW.participant_id AND status = 'approved';
  
  -- Calculate progress percentage
  progress := LEAST(100, (completed_days::DECIMAL / GREATEST(1, total_days)) * 100);
  
  -- Update participant progress
  UPDATE public.participants 
  SET progress = progress,
      last_updated = NOW()
  WHERE id = NEW.participant_id;
  
  -- Create notification if verification is approved
  IF NEW.status = 'approved' THEN
    PERFORM create_notification(
      (SELECT user_id FROM public.participants WHERE id = NEW.participant_id),
      'verification_approved',
      'Verification Approved',
      'Your verification has been approved!',
      jsonb_build_object('verification_id', NEW.id, 'challenge_id', challenge_record.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_verification_update ON public.verifications;
CREATE TRIGGER on_verification_update
  AFTER INSERT OR UPDATE ON public.verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_challenge_progress();

-- 3. Trigger for challenge completion
CREATE OR REPLACE FUNCTION public.check_challenge_completion() 
RETURNS TRIGGER AS $$
DECLARE
  challenge_record RECORD;
  total_participants INTEGER;
  completed_participants INTEGER;
BEGIN
  -- Only proceed if progress has been updated to 100%
  IF NEW.progress = 100 AND OLD.progress < 100 THEN
    -- Get challenge information
    SELECT * INTO challenge_record FROM public.challenges WHERE id = NEW.challenge_id;
    
    -- Create notification for challenge completion
    PERFORM create_notification(
      NEW.user_id,
      'challenge_completed',
      'Challenge Completed!',
      'Congratulations! You''ve completed the challenge: ' || challenge_record.title,
      jsonb_build_object('challenge_id', challenge_record.id)
    );
    
    -- Update user balance if stake model requires it
    IF challenge_record.stake_model IN ('winner_takes_all', 'proportional') THEN
      -- Process will be handled by a separate trigger or function
      -- This is a placeholder for stake distribution logic
      NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_participant_progress_update ON public.participants;
CREATE TRIGGER on_participant_progress_update
  AFTER UPDATE ON public.participants
  FOR EACH ROW EXECUTE FUNCTION public.check_challenge_completion();

-- 4. Trigger for deadline notifications
CREATE OR REPLACE FUNCTION public.check_verification_deadlines() 
RETURNS TRIGGER AS $$
DECLARE
  upcoming_deadline RECORD;
BEGIN
  FOR upcoming_deadline IN (
    SELECT 
      p.user_id,
      c.id as challenge_id,
      c.title as challenge_title,
      p.id as participant_id,
      c.verification_frequency,
      (NOW() + INTERVAL '1 day')::DATE as deadline_date
    FROM 
      public.participants p
      JOIN public.challenges c ON p.challenge_id = c.id
    WHERE 
      c.status = 'active'
      AND CASE 
        WHEN c.verification_frequency = 'daily' THEN TRUE
        WHEN c.verification_frequency = 'weekly' AND EXTRACT(DOW FROM NOW()) = 6 THEN TRUE
        WHEN c.verification_frequency = 'monthly' AND EXTRACT(DAY FROM NOW()) = EXTRACT(DAY FROM c.start_date) THEN TRUE
        ELSE FALSE
      END
      AND NOT EXISTS (
        SELECT 1 FROM public.verifications v 
        WHERE v.participant_id = p.id 
        AND DATE(v.created_at) = CURRENT_DATE
      )
  ) LOOP
    -- Create notification reminding of upcoming verification deadline
    PERFORM create_notification(
      upcoming_deadline.user_id,
      'verification_reminder',
      'Verification Due Soon',
      'Don''t forget to submit your verification for: ' || upcoming_deadline.challenge_title,
      jsonb_build_object('challenge_id', upcoming_deadline.challenge_id)
    );
  END LOOP;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule job to run daily for verification reminders
SELECT cron.schedule(
  'verification-reminders',
  '0 20 * * *',  -- Run at 8 PM daily
  $$SELECT public.check_verification_deadlines()$$
);

-- 5. Trigger for balance updates on transaction changes
CREATE OR REPLACE FUNCTION public.update_user_balance() 
RETURNS TRIGGER AS $$
BEGIN
  -- For new transactions
  IF TG_OP = 'INSERT' THEN
    -- Update user balance based on transaction type
    IF NEW.status = 'completed' THEN
      IF NEW.type = 'deposit' THEN
        UPDATE public.profiles SET balance = balance + NEW.amount WHERE id = NEW.user_id;
      ELSIF NEW.type = 'withdrawal' OR NEW.type = 'stake' THEN
        UPDATE public.profiles SET balance = balance - NEW.amount WHERE id = NEW.user_id;
      ELSIF NEW.type = 'reward' THEN
        UPDATE public.profiles SET balance = balance + NEW.amount WHERE id = NEW.user_id;
      END IF;
    END IF;
  -- For updated transactions (status changes)
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed' THEN
    IF NEW.type = 'deposit' THEN
      UPDATE public.profiles SET balance = balance + NEW.amount WHERE id = NEW.user_id;
    ELSIF NEW.type = 'withdrawal' OR NEW.type = 'stake' THEN
      UPDATE public.profiles SET balance = balance - NEW.amount WHERE id = NEW.user_id;
    ELSIF NEW.type = 'reward' THEN
      UPDATE public.profiles SET balance = balance + NEW.amount WHERE id = NEW.user_id;
    END IF;
  -- For failed or refunded transactions
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status IN ('failed', 'refunded') THEN
    IF OLD.type = 'deposit' THEN
      UPDATE public.profiles SET balance = balance - OLD.amount WHERE id = OLD.user_id;
    ELSIF OLD.type = 'withdrawal' OR OLD.type = 'stake' THEN
      UPDATE public.profiles SET balance = balance + OLD.amount WHERE id = OLD.user_id;
    ELSIF OLD.type = 'reward' THEN
      UPDATE public.profiles SET balance = balance - OLD.amount WHERE id = OLD.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_transaction_change ON public.transactions;
CREATE TRIGGER on_transaction_change
  AFTER INSERT OR UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_balance(); 