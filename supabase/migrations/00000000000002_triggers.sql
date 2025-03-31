-- Database triggers for automated calculations and notifications

-- 1. Update participant progress when a new progress record is added
CREATE OR REPLACE FUNCTION update_participant_progress()
RETURNS TRIGGER AS $$
DECLARE
    challenge_type_val challenge_type;
    challenge_id_val UUID;
BEGIN
    -- Get the challenge type
    SELECT c.type, c.id INTO challenge_type_val, challenge_id_val
    FROM public.participants p
    JOIN public.challenges c ON p.challenge_id = c.id
    WHERE p.id = NEW.participant_id;
    
    -- Update participant progress based on challenge type
    IF challenge_type_val = 'accumulative' THEN
        -- For accumulative challenges, sum all progress values
        UPDATE public.participants
        SET 
            progress = (
                SELECT COALESCE(SUM(value), 0)
                FROM public.progress_records
                WHERE participant_id = NEW.participant_id
            ),
            last_updated = NOW()
        WHERE id = NEW.participant_id;
    ELSIF challenge_type_val = 'streak' THEN
        -- For streak challenges, increment streak count for consecutive days
        -- This is a simplified version; a more complex implementation would check consecutive days
        UPDATE public.participants
        SET 
            streak_count = streak_count + 1,
            progress = progress + 1,
            last_updated = NOW()
        WHERE id = NEW.participant_id;
    ELSIF challenge_type_val = 'completion' THEN
        -- For completion challenges, use the latest progress value
        UPDATE public.participants
        SET 
            progress = NEW.value,
            last_updated = NOW()
        WHERE id = NEW.participant_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on progress_records
DROP TRIGGER IF EXISTS trigger_update_participant_progress ON public.progress_records;
CREATE TRIGGER trigger_update_participant_progress
AFTER INSERT ON public.progress_records
FOR EACH ROW
EXECUTE FUNCTION update_participant_progress();

-- 2. Create a user profile automatically when a user signs up
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email_notifications, push_notifications)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        TRUE,
        TRUE
    );
    
    -- Also create default user settings
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS trigger_create_profile_for_new_user ON auth.users;
CREATE TRIGGER trigger_create_profile_for_new_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_new_user();

-- 3. Send notification when user joins a challenge
CREATE OR REPLACE FUNCTION notify_challenge_join()
RETURNS TRIGGER AS $$
DECLARE
    challenge_title TEXT;
    creator_id UUID;
BEGIN
    -- Get challenge info
    SELECT title, creator_id INTO challenge_title, creator_id
    FROM public.challenges
    WHERE id = NEW.challenge_id;
    
    -- Create notification for the user who joined
    INSERT INTO public.notifications (user_id, title, message, type, data)
    VALUES (
        NEW.user_id,
        'Challenge Joined',
        'You have joined the challenge: ' || challenge_title,
        'challenge',
        jsonb_build_object(
            'challenge_id', NEW.challenge_id,
            'action', 'joined'
        )
    );
    
    -- Create notification for the challenge creator
    IF creator_id != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, title, message, type, data)
        VALUES (
            creator_id,
            'New Participant',
            'A new user has joined your challenge: ' || challenge_title,
            'challenge',
            jsonb_build_object(
                'challenge_id', NEW.challenge_id,
                'participant_id', NEW.user_id,
                'action', 'new_participant'
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on participants
DROP TRIGGER IF EXISTS trigger_notify_challenge_join ON public.participants;
CREATE TRIGGER trigger_notify_challenge_join
AFTER INSERT ON public.participants
FOR EACH ROW
EXECUTE FUNCTION notify_challenge_join();

-- 4. Update participant status when a challenge ends
CREATE OR REPLACE FUNCTION update_challenge_completion()
RETURNS TRIGGER AS $$
DECLARE
    target_val DECIMAL;
    participant_record RECORD;
BEGIN
    -- Only proceed if the challenge is ending (status change to completed)
    IF NEW.end_date <= NOW() AND OLD.end_date > NOW() THEN
        -- Get the challenge target value
        target_val := NEW.target_value;
        
        -- Update all participants for this challenge
        FOR participant_record IN 
            SELECT p.id, p.user_id, p.progress, p.challenge_id
            FROM public.participants p
            WHERE p.challenge_id = NEW.id
        LOOP
            -- Set winner status based on progress
            IF participant_record.progress >= target_val THEN
                -- Mark as winner
                UPDATE public.participants
                SET 
                    status = 'completed',
                    is_winner = TRUE
                WHERE id = participant_record.id;
                
                -- Create success notification
                INSERT INTO public.notifications (user_id, title, message, type, data)
                VALUES (
                    participant_record.user_id,
                    'Challenge Completed',
                    'Congratulations! You have successfully completed the challenge: ' || NEW.title,
                    'challenge',
                    jsonb_build_object(
                        'challenge_id', NEW.id,
                        'action', 'completed',
                        'success', TRUE
                    )
                );
            ELSE
                -- Mark as failed
                UPDATE public.participants
                SET 
                    status = 'failed',
                    is_winner = FALSE
                WHERE id = participant_record.id;
                
                -- Create failure notification
                INSERT INTO public.notifications (user_id, title, message, type, data)
                VALUES (
                    participant_record.user_id,
                    'Challenge Ended',
                    'The challenge "' || NEW.title || '" has ended. You did not reach the target.',
                    'challenge',
                    jsonb_build_object(
                        'challenge_id', NEW.id,
                        'action', 'completed',
                        'success', FALSE
                    )
                );
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on challenges
DROP TRIGGER IF EXISTS trigger_update_challenge_completion ON public.challenges;
CREATE TRIGGER trigger_update_challenge_completion
AFTER UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION update_challenge_completion();

-- 5. Process stakes when participant status changes
CREATE OR REPLACE FUNCTION process_stake_on_completion()
RETURNS TRIGGER AS $$
DECLARE
    stake_record RECORD;
    challenge_record RECORD;
BEGIN
    -- Only run when status changes to completed or failed
    IF (NEW.status = 'completed' OR NEW.status = 'failed') AND OLD.status = 'active' THEN
        -- Get challenge info
        SELECT * INTO challenge_record
        FROM public.challenges
        WHERE id = NEW.challenge_id;
        
        -- Get stake info
        SELECT * INTO stake_record
        FROM public.stakes
        WHERE participant_id = NEW.id;
        
        IF stake_record IS NOT NULL THEN
            IF NEW.status = 'completed' AND NEW.is_winner = TRUE THEN
                -- Update stake status to completed
                UPDATE public.stakes
                SET status = 'completed'
                WHERE id = stake_record.id;
                
                -- Create reward transaction
                INSERT INTO public.transactions (
                    user_id,
                    type,
                    amount,
                    status,
                    stake_id,
                    challenge_id,
                    description
                )
                VALUES (
                    NEW.user_id,
                    'reward',
                    stake_record.amount,
                    'completed',
                    stake_record.id,
                    NEW.challenge_id,
                    'Reward for completing challenge: ' || challenge_record.title
                );
                
                -- Update user balance
                UPDATE public.profiles
                SET balance = balance + stake_record.amount
                WHERE id = NEW.user_id;
            ELSE
                -- Update stake status to failed
                UPDATE public.stakes
                SET status = 'failed'
                WHERE id = stake_record.id;
                
                -- No refund for failed challenges
                
                -- Create informational transaction record
                INSERT INTO public.transactions (
                    user_id,
                    type,
                    amount,
                    status,
                    stake_id,
                    challenge_id,
                    description
                )
                VALUES (
                    NEW.user_id,
                    'fee',
                    stake_record.amount,
                    'completed',
                    stake_record.id,
                    NEW.challenge_id,
                    'Stake lost for challenge: ' || challenge_record.title
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on participants
DROP TRIGGER IF EXISTS trigger_process_stake_on_completion ON public.participants;
CREATE TRIGGER trigger_process_stake_on_completion
AFTER UPDATE ON public.participants
FOR EACH ROW
EXECUTE FUNCTION process_stake_on_completion();

-- 6. Update user balance when a transaction is completed
CREATE OR REPLACE FUNCTION update_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process when status changes to completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- For deposits, add to balance
        IF NEW.type = 'deposit' OR NEW.type = 'reward' THEN
            UPDATE public.profiles
            SET balance = balance + NEW.amount
            WHERE id = NEW.user_id;
        -- For withdrawals, stakes, and fees, subtract from balance
        ELSIF NEW.type IN ('withdrawal', 'stake', 'fee') THEN
            -- Check if user has enough balance
            IF (SELECT balance FROM public.profiles WHERE id = NEW.user_id) >= NEW.amount THEN
                UPDATE public.profiles
                SET balance = balance - NEW.amount
                WHERE id = NEW.user_id;
            ELSE
                -- If not enough balance, mark transaction as failed
                NEW.status := 'failed';
                -- Add a notification
                INSERT INTO public.notifications (user_id, title, message, type, data)
                VALUES (
                    NEW.user_id,
                    'Transaction Failed',
                    'Insufficient balance for transaction of ' || NEW.amount || ' units.',
                    'transaction',
                    jsonb_build_object(
                        'transaction_id', NEW.id,
                        'action', 'failed',
                        'reason', 'insufficient_balance'
                    )
                );
            END IF;
        -- For refunds, add to balance
        ELSIF NEW.type = 'refund' THEN
            UPDATE public.profiles
            SET balance = balance + NEW.amount
            WHERE id = NEW.user_id;
        END IF;
        
        -- Create notification for completed transaction
        IF NEW.status = 'completed' THEN
            INSERT INTO public.notifications (user_id, title, message, type, data)
            VALUES (
                NEW.user_id,
                CASE 
                    WHEN NEW.type = 'deposit' THEN 'Deposit Completed'
                    WHEN NEW.type = 'withdrawal' THEN 'Withdrawal Completed'
                    WHEN NEW.type = 'stake' THEN 'Stake Placed'
                    WHEN NEW.type = 'reward' THEN 'Reward Received'
                    WHEN NEW.type = 'refund' THEN 'Refund Processed'
                    WHEN NEW.type = 'fee' THEN 'Fee Charged'
                    ELSE 'Transaction Completed'
                END,
                CASE 
                    WHEN NEW.type = 'deposit' THEN 'Your deposit of ' || NEW.amount || ' units has been processed.'
                    WHEN NEW.type = 'withdrawal' THEN 'Your withdrawal of ' || NEW.amount || ' units has been processed.'
                    WHEN NEW.type = 'stake' THEN 'Your stake of ' || NEW.amount || ' units has been placed.'
                    WHEN NEW.type = 'reward' THEN 'You received a reward of ' || NEW.amount || ' units.'
                    WHEN NEW.type = 'refund' THEN 'You received a refund of ' || NEW.amount || ' units.'
                    WHEN NEW.type = 'fee' THEN 'A fee of ' || NEW.amount || ' units has been charged.'
                    ELSE 'Transaction of ' || NEW.amount || ' units has been completed.'
                END,
                'transaction',
                jsonb_build_object(
                    'transaction_id', NEW.id,
                    'action', 'completed',
                    'amount', NEW.amount,
                    'type', NEW.type
                )
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on transactions
DROP TRIGGER IF EXISTS trigger_update_balance_on_transaction ON public.transactions;
CREATE TRIGGER trigger_update_balance_on_transaction
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_balance_on_transaction();

-- Insert into migration tracking table
INSERT INTO public._migrations (name) VALUES ('00000000000002_triggers'); 