-- ==========================================
-- Migration V7: Device Commands Schema
-- ==========================================

CREATE TABLE IF NOT EXISTS threats.device_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices.registered_devices(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES threats.incidents(id) ON DELETE CASCADE,
    command_type VARCHAR(100) NOT NULL,
    parameters JSONB,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'EXECUTED', 'FAILED')),
    result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP WITH TIME ZONE
);
