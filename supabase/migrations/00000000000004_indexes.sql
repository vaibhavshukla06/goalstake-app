-- Indexes for GoalStake App
-- This migration adds performance-optimizing indexes based on common query patterns

-- 1. Profile Indexes
-- For faster user lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
-- For searching profiles by name
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles (full_name);
-- Hash index for exact user_id matches
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_hash ON public.profiles USING hash (id);

-- 2. Challenge Indexes
-- For challenge filtering by status
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges (status);
-- For sorting challenges by date
CREATE INDEX IF NOT EXISTS idx_challenges_start_date ON public.challenges (start_date);
CREATE INDEX IF NOT EXISTS idx_challenges_end_date ON public.challenges (end_date);
-- For searching challenges by title (using GIN for full-text search)
CREATE INDEX IF NOT EXISTS idx_challenges_title_gin ON public.challenges USING gin (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_challenges_description_gin ON public.challenges USING gin (to_tsvector('english', description));
-- For challenge filtering by category
CREATE INDEX IF NOT EXISTS idx_challenges_category ON public.challenges (category);
-- For finding challenges by creator
CREATE INDEX IF NOT EXISTS idx_challenges_created_by ON public.challenges (created_by);
-- Compound index for common challenge list query
CREATE INDEX IF NOT EXISTS idx_challenges_status_category ON public.challenges (status, category);
-- Compound index for date filtering
CREATE INDEX IF NOT EXISTS idx_challenges_status_dates ON public.challenges (status, start_date, end_date);

-- 3. Participants Indexes
-- For looking up participants in a challenge
CREATE INDEX IF NOT EXISTS idx_participants_challenge_id ON public.participants (challenge_id);
-- For finding all challenges a user participates in
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON public.participants (user_id);
-- For finding active participants
CREATE INDEX IF NOT EXISTS idx_participants_status ON public.participants (status);
-- Compound index for challenge participants with status
CREATE INDEX IF NOT EXISTS idx_participants_challenge_status ON public.participants (challenge_id, status);
-- Compound index for user's active challenges
CREATE INDEX IF NOT EXISTS idx_participants_user_status ON public.participants (user_id, status);
-- For progress tracking
CREATE INDEX IF NOT EXISTS idx_participants_progress ON public.participants (progress);

-- 4. Verification Indexes
-- For finding all verifications for a participant
CREATE INDEX IF NOT EXISTS idx_verifications_participant_id ON public.verifications (participant_id);
-- For finding verifications by challenge
CREATE INDEX IF NOT EXISTS idx_verifications_challenge_id ON public.verifications (challenge_id);
-- For filtering verifications by status
CREATE INDEX IF NOT EXISTS idx_verifications_status ON public.verifications (status);
-- For finding recent verifications
CREATE INDEX IF NOT EXISTS idx_verifications_created_at ON public.verifications (created_at);
-- Compound index for common verification queries
CREATE INDEX IF NOT EXISTS idx_verifications_challenge_status ON public.verifications (challenge_id, status);
-- Compound index for verification timeline
CREATE INDEX IF NOT EXISTS idx_verifications_participant_date ON public.verifications (participant_id, created_at);

-- 5. Transaction Indexes
-- For finding transactions by user
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions (user_id);
-- For filtering transactions by type
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions (type);
-- For filtering transactions by status
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions (status);
-- For transaction history by date
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions (created_at);
-- Compound index for common transaction list query
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions (user_id, type);
-- Compound index for transaction reporting
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions (user_id, created_at);
-- Compound index for transaction status tracking
CREATE INDEX IF NOT EXISTS idx_transactions_user_status ON public.transactions (user_id, status);

-- 6. Stakes Indexes
-- For finding stakes by challenge
CREATE INDEX IF NOT EXISTS idx_stakes_challenge_id ON public.stakes (challenge_id);
-- For finding user stakes
CREATE INDEX IF NOT EXISTS idx_stakes_user_id ON public.stakes (user_id);
-- For finding stakes by status
CREATE INDEX IF NOT EXISTS idx_stakes_status ON public.stakes (status);
-- Compound index for user stake history
CREATE INDEX IF NOT EXISTS idx_stakes_user_challenge ON public.stakes (user_id, challenge_id);

-- 7. Notification Indexes
-- For finding user notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
-- For filtering by notification type
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications (type);
-- For finding unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications (is_read);
-- For notification timeline
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at);
-- Compound index for unread user notifications (very common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, is_read) 
WHERE is_read = FALSE;
-- Compound index for user notification timeline
CREATE INDEX IF NOT EXISTS idx_notifications_user_date ON public.notifications (user_id, created_at);

-- 8. Comments Indexes (if applicable)
-- This assumes you have or plan to have a comments table
CREATE INDEX IF NOT EXISTS idx_comments_challenge_id ON public.comments (challenge_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments (created_at);
-- Compound index for challenge comments timeline
CREATE INDEX IF NOT EXISTS idx_comments_challenge_date ON public.comments (challenge_id, created_at);

-- 9. Partial Indexes for Common Filtered Queries
-- Active challenges only (reduces index size and improves common queries)
CREATE INDEX IF NOT EXISTS idx_active_challenges ON public.challenges (id, created_at)
WHERE status = 'active';
-- Public challenges only (for discovery features)
CREATE INDEX IF NOT EXISTS idx_public_challenges ON public.challenges (id, category, start_date)
WHERE visibility = 'public';
-- Unread notifications (for notification badge counts)
CREATE INDEX IF NOT EXISTS idx_unread_notifications_count ON public.notifications (user_id)
WHERE is_read = FALSE;
-- Pending verifications (for verification dashboard)
CREATE INDEX IF NOT EXISTS idx_pending_verifications ON public.verifications (challenge_id, created_at)
WHERE status = 'pending';
-- Completed transactions (for financial reports)
CREATE INDEX IF NOT EXISTS idx_completed_transactions ON public.transactions (user_id, amount, created_at)
WHERE status = 'completed';

-- 10. Add database statistics collection for query optimization
-- This helps the PostgreSQL query planner make better decisions
ALTER TABLE public.challenges ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE public.challenges ALTER COLUMN category SET STATISTICS 1000;
ALTER TABLE public.participants ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE public.verifications ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE public.transactions ALTER COLUMN type SET STATISTICS 1000;
ALTER TABLE public.transactions ALTER COLUMN status SET STATISTICS 1000;

-- 11. Comment on indexes to document their purpose
COMMENT ON INDEX idx_profiles_username IS 'Speeds up user searches by username';
COMMENT ON INDEX idx_challenges_status_category IS 'Optimizes filtered challenge list views';
COMMENT ON INDEX idx_participants_user_status IS 'Improves performance of user dashboard with active challenges';
COMMENT ON INDEX idx_verifications_challenge_status IS 'Speeds up challenge verification dashboards';
COMMENT ON INDEX idx_transactions_user_date IS 'Optimizes user transaction history views';
COMMENT ON INDEX idx_notifications_user_unread IS 'Critical for quick notification badge counts';
COMMENT ON INDEX idx_active_challenges IS 'Reduces index size by only indexing active challenges';
COMMENT ON INDEX idx_pending_verifications IS 'Improves verification queue performance'; 