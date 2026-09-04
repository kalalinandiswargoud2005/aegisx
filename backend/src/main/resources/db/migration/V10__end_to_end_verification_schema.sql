-- ==========================================
-- Migration V10: End-to-End Verification Schema
-- ==========================================

-- 1. Extend recovery.steps with verification metadata
ALTER TABLE recovery.steps ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'UNVERIFIED';
ALTER TABLE recovery.steps ADD COLUMN IF NOT EXISTS verification_message TEXT;
ALTER TABLE recovery.steps ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE recovery.steps ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE recovery.steps ADD COLUMN IF NOT EXISTS sequence_number INTEGER;

-- 2. Update device_commands table constraint to support VERIFIED and EXECUTING statuses
ALTER TABLE threats.device_commands DROP CONSTRAINT IF EXISTS device_commands_status_check;
ALTER TABLE threats.device_commands ADD CONSTRAINT device_commands_status_check 
    CHECK (status IN ('PENDING', 'DELIVERED', 'EXECUTING', 'VERIFIED', 'COMPLETED', 'EXECUTED', 'FAILED', 'EXPIRED'));

ALTER TABLE threats.device_commands ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE threats.device_commands ADD COLUMN IF NOT EXISTS requires_confirmation BOOLEAN DEFAULT FALSE;
ALTER TABLE threats.device_commands ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100);

-- 3. Extend registered_devices with detailed telemetry fields
ALTER TABLE devices.registered_devices ADD COLUMN IF NOT EXISTS cpu_usage NUMERIC(5,2);
ALTER TABLE devices.registered_devices ADD COLUMN IF NOT EXISTS ram_usage NUMERIC(5,2);
ALTER TABLE devices.registered_devices ADD COLUMN IF NOT EXISTS username VARCHAR(100);
ALTER TABLE devices.registered_devices ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP WITH TIME ZONE;
ALTER TABLE devices.registered_devices ADD COLUMN IF NOT EXISTS companion_status VARCHAR(50) DEFAULT 'UNKNOWN';
ALTER TABLE devices.registered_devices ADD COLUMN IF NOT EXISTS overlay_status VARCHAR(50) DEFAULT 'UNKNOWN';
