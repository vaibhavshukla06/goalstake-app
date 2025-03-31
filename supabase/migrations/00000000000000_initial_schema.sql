-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for additional cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up custom types
DO $$
BEGIN
    -- Challenge types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'challenge_type') THEN
        CREATE TYPE challenge_type AS ENUM ('accumulative', 'streak', 'completion');
    END IF;
    
    -- Challenge categories
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'challenge_category') THEN
        CREATE TYPE challenge_category AS ENUM ('fitness', 'learning', 'productivity', 'finance', 'health', 'other');
    END IF;
    
    -- Stake status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stake_status') THEN
        CREATE TYPE stake_status AS ENUM ('pending', 'active', 'completed', 'failed', 'refunded', 'canceled');
    END IF;
    
    -- Transaction types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'stake', 'reward', 'refund', 'fee');
    END IF;
    
    -- Transaction status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'canceled');
    END IF;
    
    -- Verification status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'disputed');
    END IF;
END$$;

-- Create users table
-- Note: We'll use Supabase Auth's users table as the base and extend it with a profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL CHECK (length(username) >= 3 AND length(username) <= 30),
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    balance DECIMAL(18, 2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}'::jsonb,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_active TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Add constraints
    CONSTRAINT username_format CHECK (username ~* '^[a-zA-Z0-9_]+$')
);

-- User settings table for detailed user preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    dark_mode BOOLEAN DEFAULT false,
    language TEXT DEFAULT 'en',
    currency TEXT DEFAULT 'USD',
    privacy_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Each user should have only one settings record
    CONSTRAINT user_settings_unique UNIQUE (user_id)
);

-- Challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(title) >= 3 AND length(title) <= 100),
    description TEXT,
    category challenge_category NOT NULL DEFAULT 'other',
    type challenge_type NOT NULL,
    min_stake DECIMAL(18, 2) NOT NULL CHECK (min_stake >= 0),
    suggested_stake DECIMAL(18, 2) CHECK (suggested_stake >= min_stake),
    max_participants INTEGER CHECK (max_participants > 0),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_public BOOLEAN DEFAULT true,
    target_value DECIMAL(18, 2),
    target_unit TEXT,
    verification_frequency TEXT, -- daily, weekly, custom
    verification_requirements TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Add constraints
    CONSTRAINT dates_check CHECK (end_date > start_date),
    CONSTRAINT valid_stake CHECK (min_stake >= 0)
);

-- Create an index for challenge search
CREATE INDEX IF NOT EXISTS challenges_search_idx ON public.challenges USING GIN (to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS challenges_category_idx ON public.challenges (category);
CREATE INDEX IF NOT EXISTS challenges_start_date_idx ON public.challenges (start_date);
CREATE INDEX IF NOT EXISTS challenges_creator_idx ON public.challenges (creator_id);

-- Participants table (many-to-many relationship between users and challenges)
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    progress DECIMAL(18, 2) DEFAULT 0 CHECK (progress >= 0),
    last_updated TIMESTAMPTZ DEFAULT now(),
    streak_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'withdrawn')),
    is_winner BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Each user can participate in a challenge only once
    CONSTRAINT participant_unique UNIQUE (user_id, challenge_id)
);

-- Create indexes for participants
CREATE INDEX IF NOT EXISTS participants_user_idx ON public.participants (user_id);
CREATE INDEX IF NOT EXISTS participants_challenge_idx ON public.participants (challenge_id);
CREATE INDEX IF NOT EXISTS participants_status_idx ON public.participants (status);

-- Stakes table
CREATE TABLE IF NOT EXISTS public.stakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    amount DECIMAL(18, 2) NOT NULL CHECK (amount > 0),
    status stake_status NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for stakes
CREATE INDEX IF NOT EXISTS stakes_participant_idx ON public.stakes (participant_id);
CREATE INDEX IF NOT EXISTS stakes_status_idx ON public.stakes (status);

-- Progress records table
CREATE TABLE IF NOT EXISTS public.progress_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    value DECIMAL(18, 2) NOT NULL CHECK (value >= 0),
    note TEXT,
    recorded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for progress records
CREATE INDEX IF NOT EXISTS progress_records_participant_idx ON public.progress_records (participant_id);
CREATE INDEX IF NOT EXISTS progress_records_recorded_at_idx ON public.progress_records (recorded_at);

-- Verifications table
CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    progress_record_id UUID REFERENCES public.progress_records(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    status verification_status NOT NULL DEFAULT 'pending',
    proof_url TEXT,
    proof_type TEXT CHECK (proof_type IN ('image', 'video', 'location', 'link', 'text')),
    metadata JSONB DEFAULT '{}'::jsonb,
    verified_by UUID REFERENCES public.profiles(id),
    verification_note TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for verifications
CREATE INDEX IF NOT EXISTS verifications_participant_idx ON public.verifications (participant_id);
CREATE INDEX IF NOT EXISTS verifications_status_idx ON public.verifications (status);
CREATE INDEX IF NOT EXISTS verifications_progress_record_idx ON public.verifications (progress_record_id);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    stake_id UUID REFERENCES public.stakes(id) ON DELETE SET NULL,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
    reference_id TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for transactions
CREATE INDEX IF NOT EXISTS transactions_user_idx ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON public.transactions (type);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON public.transactions (status);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON public.transactions (created_at);

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    badge_url TEXT,
    criteria JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User achievements table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Each user can earn a specific achievement only once
    CONSTRAINT user_achievement_unique UNIQUE (user_id, achievement_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('challenge', 'achievement', 'system', 'transaction')),
    read BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index for notifications
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON public.notifications (type);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications (read);

-- Challenge invites table
CREATE TABLE IF NOT EXISTS public.challenge_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Each invitee can be invited to a challenge by the same inviter only once
    CONSTRAINT challenge_invite_unique UNIQUE (challenge_id, inviter_id, invitee_id)
);

-- Migration versioning table
CREATE TABLE IF NOT EXISTS public._migrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert initial migration record
INSERT INTO public._migrations (name) VALUES ('00000000000000_initial_schema');

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at column
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
        ', t);
    END LOOP;
END;
$$; 