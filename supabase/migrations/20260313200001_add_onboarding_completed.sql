-- Add onboarding_completed column to users table
-- New users default to false; existing users are marked as completed so they skip onboarding.

ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- All current users should skip onboarding
UPDATE users SET onboarding_completed = true WHERE created_at < NOW();
