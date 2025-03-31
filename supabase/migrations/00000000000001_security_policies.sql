-- Apply Row Level Security (RLS) to all tables
-- This ensures that users can only access data they are authorized to see

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_invites ENABLE ROW LEVEL SECURITY;

-- Create a function to check if user is authenticated
CREATE OR REPLACE FUNCTION auth.is_authenticated() RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.uid() IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if the user has admin role
CREATE OR REPLACE FUNCTION auth.is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a challenge is public
CREATE OR REPLACE FUNCTION public.is_challenge_public(challenge_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.challenges
    WHERE id = challenge_id AND is_public = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user is participating in a challenge
CREATE OR REPLACE FUNCTION public.is_challenge_participant(user_id UUID, challenge_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.participants
    WHERE user_id = user_id AND challenge_id = challenge_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
-- Users can read their own profile
CREATE POLICY profiles_read_own ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- Users can read profiles of other users who are in the same challenge
CREATE POLICY profiles_read_participants ON public.profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.participants p1
      JOIN public.participants p2 ON p1.challenge_id = p2.challenge_id
      WHERE p1.user_id = auth.uid() AND p2.user_id = profiles.id
    )
  );

-- Users can read profiles of public challenge creators
CREATE POLICY profiles_read_creators ON public.profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.challenges
      WHERE creator_id = profiles.id AND is_public = TRUE
    )
  );

-- Users can update only their own profile
CREATE POLICY profiles_update_own ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY profiles_admin_read ON public.profiles 
  FOR SELECT USING (auth.is_admin());

-- Admins can update all profiles
CREATE POLICY profiles_admin_update ON public.profiles 
  FOR UPDATE USING (auth.is_admin());

-- USER SETTINGS POLICIES
-- Users can only read their own settings
CREATE POLICY user_settings_read_own ON public.user_settings 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only update their own settings
CREATE POLICY user_settings_update_own ON public.user_settings 
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only insert their own settings
CREATE POLICY user_settings_insert_own ON public.user_settings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage all user settings
CREATE POLICY user_settings_admin ON public.user_settings 
  USING (auth.is_admin());

-- CHALLENGES POLICIES
-- Anyone can read public challenges
CREATE POLICY challenges_read_public ON public.challenges 
  FOR SELECT USING (is_public = TRUE);

-- Users can read challenges they are participating in
CREATE POLICY challenges_read_participant ON public.challenges 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE user_id = auth.uid() AND challenge_id = challenges.id
    )
  );

-- Users can read challenges they created
CREATE POLICY challenges_read_own ON public.challenges 
  FOR SELECT USING (creator_id = auth.uid());

-- Users can update challenges they created
CREATE POLICY challenges_update_own ON public.challenges 
  FOR UPDATE USING (creator_id = auth.uid());

-- Users can insert challenges
CREATE POLICY challenges_insert ON public.challenges 
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Admins can manage all challenges
CREATE POLICY challenges_admin ON public.challenges 
  USING (auth.is_admin());

-- PARTICIPANTS POLICIES
-- Users can read participants for challenges they are part of
CREATE POLICY participants_read_in_challenge ON public.participants 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.participants AS p
      WHERE p.user_id = auth.uid() AND p.challenge_id = participants.challenge_id
    )
  );

-- Users can read participants for public challenges
CREATE POLICY participants_read_public_challenge ON public.participants 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.challenges
      WHERE id = participants.challenge_id AND is_public = TRUE
    )
  );

-- Users can read their own participation records
CREATE POLICY participants_read_own ON public.participants 
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own participation records
CREATE POLICY participants_update_own ON public.participants 
  FOR UPDATE USING (user_id = auth.uid());

-- Users can join challenges (insert participation)
CREATE POLICY participants_insert ON public.participants 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage all participation records
CREATE POLICY participants_admin ON public.participants 
  USING (auth.is_admin());

-- STAKES POLICIES
-- Users can read stakes for their own participation
CREATE POLICY stakes_read_own ON public.stakes 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE id = stakes.participant_id AND user_id = auth.uid()
    )
  );

-- Users can read stakes for participants in the same challenge
CREATE POLICY stakes_read_in_challenge ON public.stakes 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.participants p1
      JOIN public.participants p2 ON p1.challenge_id = p2.challenge_id
      WHERE p1.user_id = auth.uid() AND p2.id = stakes.participant_id
    )
  );

-- Users can create their own stakes
CREATE POLICY stakes_insert_own ON public.stakes 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE id = participant_id AND user_id = auth.uid()
    )
  );

-- Admins can manage all stakes
CREATE POLICY stakes_admin ON public.stakes 
  USING (auth.is_admin());

-- PROGRESS RECORDS POLICIES
-- Users can read their own progress records
CREATE POLICY progress_records_read_own ON public.progress_records 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE id = progress_records.participant_id AND user_id = auth.uid()
    )
  );

-- Users can read progress records for participants in the same challenge
CREATE POLICY progress_records_read_in_challenge ON public.progress_records 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.participants p1
      JOIN public.participants p2 ON p1.challenge_id = p2.challenge_id
      WHERE p1.user_id = auth.uid() AND p2.id = progress_records.participant_id
    )
  );

-- Users can create their own progress records
CREATE POLICY progress_records_insert_own ON public.progress_records 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE id = participant_id AND user_id = auth.uid()
    )
  );

-- Admins can manage all progress records
CREATE POLICY progress_records_admin ON public.progress_records 
  USING (auth.is_admin());

-- VERIFICATIONS POLICIES
-- Users can read their own verification records
CREATE POLICY verifications_read_own ON public.verifications 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE id = verifications.participant_id AND user_id = auth.uid()
    )
  );

-- Challenge creators can read verification records for their challenges
CREATE POLICY verifications_read_challenge_creator ON public.verifications 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.participants p
      JOIN public.challenges c ON p.challenge_id = c.id
      WHERE p.id = verifications.participant_id AND c.creator_id = auth.uid()
    )
  );

-- Users can create verifications for their own progress
CREATE POLICY verifications_insert_own ON public.verifications 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE id = participant_id AND user_id = auth.uid()
    )
  );

-- Challenge creators can update verifications for their challenges (to verify)
CREATE POLICY verifications_update_challenge_creator ON public.verifications 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.participants p
      JOIN public.challenges c ON p.challenge_id = c.id
      WHERE p.id = verifications.participant_id AND c.creator_id = auth.uid()
    )
  );

-- Admins can manage all verifications
CREATE POLICY verifications_admin ON public.verifications 
  USING (auth.is_admin());

-- TRANSACTIONS POLICIES
-- Users can read their own transactions
CREATE POLICY transactions_read_own ON public.transactions 
  FOR SELECT USING (user_id = auth.uid());

-- Admins can manage all transactions
CREATE POLICY transactions_admin ON public.transactions 
  USING (auth.is_admin());

-- ACHIEVEMENTS POLICIES
-- Anyone can read achievements
CREATE POLICY achievements_read ON public.achievements 
  FOR SELECT USING (TRUE);

-- Only admins can manage achievements
CREATE POLICY achievements_admin ON public.achievements 
  USING (auth.is_admin());

-- USER ACHIEVEMENTS POLICIES
-- Users can read their own achievements
CREATE POLICY user_achievements_read_own ON public.user_achievements 
  FOR SELECT USING (user_id = auth.uid());

-- Users can read achievements of participants in the same challenge
CREATE POLICY user_achievements_read_participants ON public.user_achievements 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.participants p1
      JOIN public.participants p2 ON p1.challenge_id = p2.challenge_id
      WHERE p1.user_id = auth.uid() AND p2.user_id = user_achievements.user_id
    )
  );

-- Admins can manage all user achievements
CREATE POLICY user_achievements_admin ON public.user_achievements 
  USING (auth.is_admin());

-- NOTIFICATIONS POLICIES
-- Users can only read their own notifications
CREATE POLICY notifications_read_own ON public.notifications 
  FOR SELECT USING (user_id = auth.uid());

-- Users can update (mark as read) their own notifications
CREATE POLICY notifications_update_own ON public.notifications 
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can manage all notifications
CREATE POLICY notifications_admin ON public.notifications 
  USING (auth.is_admin());

-- CHALLENGE INVITES POLICIES
-- Users can read invites they've received
CREATE POLICY invites_read_invitee ON public.challenge_invites 
  FOR SELECT USING (invitee_id = auth.uid());

-- Users can read invites they've sent
CREATE POLICY invites_read_inviter ON public.challenge_invites 
  FOR SELECT USING (inviter_id = auth.uid());

-- Users can create invites for challenges they're in or created
CREATE POLICY invites_insert ON public.challenge_invites 
  FOR INSERT WITH CHECK (
    inviter_id = auth.uid() AND (
      EXISTS (
        SELECT 1 FROM public.participants
        WHERE user_id = auth.uid() AND challenge_id = challenge_invites.challenge_id
      ) OR
      EXISTS (
        SELECT 1 FROM public.challenges
        WHERE id = challenge_invites.challenge_id AND creator_id = auth.uid()
      )
    )
  );

-- Users can update (accept/decline) invites they've received
CREATE POLICY invites_update_invitee ON public.challenge_invites 
  FOR UPDATE USING (invitee_id = auth.uid());

-- Admins can manage all invites
CREATE POLICY invites_admin ON public.challenge_invites 
  USING (auth.is_admin());

-- Insert into migration tracking table
INSERT INTO public._migrations (name) VALUES ('00000000000001_security_policies'); 