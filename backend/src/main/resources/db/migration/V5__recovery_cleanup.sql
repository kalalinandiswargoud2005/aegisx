-- V5: Ensure recovery.steps is fully compatible with the Java entity
-- Make workflow_id nullable (safe to run multiple times)
ALTER TABLE recovery.steps ALTER COLUMN workflow_id DROP NOT NULL;

-- Add index on incident_id for fast lookups (IF NOT EXISTS is idempotent)
CREATE INDEX IF NOT EXISTS idx_recovery_steps_incident_id ON recovery.steps(incident_id);
