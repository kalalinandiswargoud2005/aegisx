-- ==========================================
-- Migration V11: Multi-Device Token & Hardware Identity
-- ==========================================

ALTER TABLE devices.registered_devices ADD COLUMN IF NOT EXISTS hardware_id VARCHAR(255);
ALTER TABLE devices.registered_devices ADD COLUMN IF NOT EXISTS device_token VARCHAR(255);
ALTER TABLE devices.registered_devices ADD COLUMN IF NOT EXISTS hostname VARCHAR(255);
ALTER TABLE devices.registered_devices ADD COLUMN IF NOT EXISTS mac_address VARCHAR(100);

-- Populate default device_token for existing devices if null
UPDATE devices.registered_devices 
SET device_token = 'ast_' || replace(cast(id as varchar), '-', '') 
WHERE device_token IS NULL;
