-- V6: Drop status check constraint so any status string can be saved safely
ALTER TABLE recovery.steps DROP CONSTRAINT IF EXISTS steps_status_check;
