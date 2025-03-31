# GoalStake Database Schema Documentation

This document provides a comprehensive overview of the GoalStake database schema, covering all tables, relationships, and key functionalities.

## Table Structure

The database is structured around the following core entities:

### Users and Profiles

- **profiles**: Extends the Supabase Auth user system with application-specific user data.
  - Primary Key: `id` (references `auth.users.id`)
  - Key Fields: `username`, `full_name`, `avatar_url`, `balance`
  - Description: Stores user profile information and preferences.

- **user_settings**: Stores user-specific settings and preferences.
  - Primary Key: `id`
  - Foreign Key: `user_id` references `profiles.id`
  - Key Fields: `dark_mode`, `language`, `currency`
  - Description: Allows for detailed user preferences management.

### Challenges

- **challenges**: The central entity for challenge information.
  - Primary Key: `id`
  - Foreign Key: `creator_id` references `profiles.id`
  - Key Fields: `title`, `description`, `category`, `type`, `min_stake`, `start_date`, `end_date`
  - Description: Stores all challenge details including goals, durations, and rules.

- **participants**: Many-to-many relationship between users and challenges.
  - Primary Key: `id`
  - Foreign Keys: `user_id` references `profiles.id`, `challenge_id` references `challenges.id`
  - Key Fields: `progress`, `status`, `streak_count`, `is_winner`
  - Description: Tracks user participation in challenges.

### Progress Tracking

- **progress_records**: Records individual progress updates.
  - Primary Key: `id`
  - Foreign Key: `participant_id` references `participants.id`
  - Key Fields: `value`, `recorded_at`, `note`
  - Description: Stores timestamped progress updates for challenge participants.

- **verifications**: Stores evidence and verification information.
  - Primary Key: `id`
  - Foreign Keys: `participant_id` references `participants.id`, `progress_record_id` references `progress_records.id`
  - Key Fields: `status`, `proof_url`, `proof_type`, `verified_by`
  - Description: Manages proof submissions and their verification status.

### Financial System

- **stakes**: Financial commitments for challenges.
  - Primary Key: `id`
  - Foreign Key: `participant_id` references `participants.id`
  - Key Fields: `amount`, `status`, `paid_at`, `refunded_at`
  - Description: Tracks the financial stakes placed on challenges.

- **transactions**: Complete financial history.
  - Primary Key: `id`
  - Foreign Keys: `user_id` references `profiles.id`, `stake_id` references `stakes.id`, `challenge_id` references `challenges.id`
  - Key Fields: `type`, `amount`, `status`, `description`
  - Description: Records all financial transactions in the system (deposits, withdrawals, stakes, rewards).

### Engagement and Gamification

- **achievements**: System achievements and badges.
  - Primary Key: `id`
  - Key Fields: `title`, `description`, `badge_url`, `criteria`
  - Description: Defines achievements that users can earn.

- **user_achievements**: Many-to-many relationship between users and achievements.
  - Primary Key: `id`
  - Foreign Keys: `user_id` references `profiles.id`, `achievement_id` references `achievements.id`
  - Key Fields: `unlocked_at`
  - Description: Tracks which achievements users have earned.

- **notifications**: User notifications.
  - Primary Key: `id`
  - Foreign Key: `user_id` references `profiles.id`
  - Key Fields: `title`, `message`, `type`, `read`, `data`
  - Description: Stores notifications for users with various types and metadata.

- **challenge_invites**: Invitation system for challenges.
  - Primary Key: `id`
  - Foreign Keys: `challenge_id` references `challenges.id`, `inviter_id` and `invitee_id` both reference `profiles.id`
  - Key Fields: `status`, `created_at`
  - Description: Manages the invitation process for private challenges.

## Custom Types (Enums)

- **challenge_type**: `accumulative`, `streak`, `completion`
  - Defines the type of progress tracking for a challenge.

- **challenge_category**: `fitness`, `learning`, `productivity`, `finance`, `health`, `other`
  - Categorizes challenges for discovery and filtering.

- **stake_status**: `pending`, `active`, `completed`, `failed`, `refunded`, `canceled`
  - Tracks the lifecycle status of a stake.

- **transaction_type**: `deposit`, `withdrawal`, `stake`, `reward`, `refund`, `fee`
  - Defines the type of financial transaction.

- **transaction_status**: `pending`, `completed`, `failed`, `canceled`
  - Tracks the processing status of a transaction.

- **verification_status**: `pending`, `approved`, `rejected`, `disputed`
  - Tracks the verification status of submitted evidence.

## Database Relationships

```
profiles
  ↑↓ 1:1 user_settings
  ↑↓ 1:n challenges (as creator)
  ↑↓ 1:n participants
  ↑↓ 1:n transactions
  ↑↓ 1:n notifications
  ↑↓ 1:n user_achievements
  ↑↓ 1:n challenge_invites (as inviter)
  ↑↓ 1:n challenge_invites (as invitee)
  ↑↓ 1:n verifications (as verifier)

challenges
  ↑↓ n:1 profiles (creator)
  ↑↓ 1:n participants
  ↑↓ 1:n transactions (related to challenge)
  ↑↓ 1:n challenge_invites

participants
  ↑↓ n:1 profiles (user)
  ↑↓ n:1 challenges
  ↑↓ 1:n stakes
  ↑↓ 1:n progress_records
  ↑↓ 1:n verifications

progress_records
  ↑↓ n:1 participants
  ↑↓ 1:n verifications

stakes
  ↑↓ n:1 participants
  ↑↓ 1:n transactions

achievements
  ↑↓ 1:n user_achievements

notifications
  ↑↓ n:1 profiles (user)
```

## Database Triggers

The database includes several triggers to automate common operations:

1. **update_participant_progress**: Updates participant progress when new progress records are added.
2. **create_profile_for_new_user**: Automatically creates a profile when a new user signs up through Supabase Auth.
3. **notify_challenge_join**: Sends notifications when users join challenges.
4. **update_challenge_completion**: Updates participant status when challenges end.
5. **process_stake_on_completion**: Handles stakes when participants complete or fail challenges.
6. **update_balance_on_transaction**: Updates user balance when transactions are completed.

## Row-Level Security (RLS) Policies

The database implements comprehensive Row-Level Security policies to ensure that:

- Users can only read and update their own profile data.
- Challenge creators can manage their own challenges.
- Users can only see participants and progress for challenges they are part of.
- Financial data is properly secured with appropriate access controls.
- Achievements and notifications are properly scoped to relevant users.

## Real-time Subscriptions

Real-time updates are enabled for the following tables:

- `challenges`: For real-time updates on challenge data.
- `participants`: For tracking participant status changes.
- `progress_records`: For real-time leaderboards and progress updates.
- `verifications`: For verification status updates.
- `notifications`: For real-time notification delivery.
- `challenge_invites`: For real-time invitation management.

Financial tables (transactions, stakes) are excluded from real-time for security reasons.

## Migration Management

Database migrations are tracked in the `_migrations` table, allowing for version control and easy updates. Migrations follow a sequential numbering system with timestamps.

## Indexing Strategy

Key indexes are created for:

- Challenge search (full-text search on title and description)
- Status fields for efficient filtering
- All foreign key relationships
- Date fields for time-based queries
- User ID fields for fast user-specific queries

## Extending the Schema

When extending the schema:

1. Create a new migration file using `npm run db:migration:new name_of_migration`
2. Add your SQL changes in the new migration file
3. Apply the changes with `npm run db:push:dev|staging|prod`
4. Update the TypeScript types with `npm run generate:types`

## Best Practices

- Always use the RLS policies for data access (don't bypass them with service role).
- Use transactions for operations that modify multiple tables.
- Let database triggers handle calculated fields rather than implementing them in application code.
- When adding tables, remember to handle migrations, add RLS policies, and create indexes. 