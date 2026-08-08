-- Fix recovery schema: add incident_id column for Java entity mapping
TRUNCATE TABLE recovery.steps;
ALTER TABLE recovery.steps DROP CONSTRAINT IF EXISTS steps_workflow_id_fkey;
ALTER TABLE recovery.steps ADD COLUMN IF NOT EXISTS incident_id VARCHAR(255);
