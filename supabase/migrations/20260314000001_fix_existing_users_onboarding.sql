-- Fix: re-mark all existing users as onboarding completed.
-- The previous upsert in auth/callback may have reset onboarding_completed
-- to false via PostgREST default column behavior.
UPDATE users SET onboarding_completed = true;
