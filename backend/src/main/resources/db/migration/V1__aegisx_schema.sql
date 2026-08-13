-- ==========================================
-- ASTRA Enterprise - Initial Schema Setup
-- Database: PostgreSQL 17+ (Supabase)
-- ==========================================

-- 1. Create Schemas
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS devices;
CREATE SCHEMA IF NOT EXISTS threats;
CREATE SCHEMA IF NOT EXISTS recovery;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS reports;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS simulation;
CREATE SCHEMA IF NOT EXISTS assistant;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS system;

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- SCHEMA: auth (Managed largely by Supabase, but adding core tables)
-- ==========================================

CREATE TABLE IF NOT EXISTS core.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'ANALYST', 'VIEWER', 'DEVELOPER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS core.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES core.users(id) ON DELETE CASCADE,
    theme VARCHAR(50) DEFAULT 'DARK',
    language VARCHAR(50) DEFAULT 'EN',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SCHEMA: devices (Windows Agents, Raspberry Pi, ESP32)
-- ==========================================

CREATE TABLE IF NOT EXISTS devices.registered_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('WINDOWS_AGENT', 'RASPBERRY_PI')),
    ip_address INET,
    mac_address MACADDR,
    os_version VARCHAR(100),
    agent_version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'WARNING', 'CRITICAL')),
    health VARCHAR(50) DEFAULT 'UNKNOWN' CHECK (health IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'UNKNOWN')),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices.telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices.registered_devices(id) ON DELETE CASCADE,
    cpu_usage NUMERIC(5,2),
    ram_usage NUMERIC(5,2),
    storage_usage NUMERIC(5,2),
    temperature NUMERIC(5,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_telemetry_device_time ON devices.telemetry(device_id, timestamp DESC);

-- ==========================================
-- SCHEMA: threats
-- ==========================================

CREATE TABLE IF NOT EXISTS threats.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('ACTIVE', 'BLOCKED', 'MITIGATED', 'RESOLVED')),
    target_device_id UUID REFERENCES devices.registered_devices(id) ON DELETE SET NULL,
    target_ip INET,
    ai_confidence_score INTEGER CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 100),
    ai_explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_incidents_status ON threats.incidents(status);
CREATE INDEX idx_incidents_severity ON threats.incidents(severity);

CREATE TABLE IF NOT EXISTS threats.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES threats.incidents(id) ON DELETE CASCADE,
    event_description TEXT NOT NULL,
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SCHEMA: recovery
-- ==========================================

CREATE TABLE IF NOT EXISTS recovery.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES threats.incidents(id) ON DELETE CASCADE,
    overall_status VARCHAR(50) DEFAULT 'PENDING' CHECK (overall_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS recovery.steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES recovery.workflows(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
    execution_time_ms BIGINT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SCHEMA: ai (Assistant & Conversations)
-- ==========================================

CREATE TABLE IF NOT EXISTS assistant.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assistant.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES assistant.conversations(id) ON DELETE CASCADE,
    sender VARCHAR(50) NOT NULL CHECK (sender IN ('USER', 'AI', 'SYSTEM')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SCHEMA: analytics & reports
-- ==========================================

CREATE TABLE IF NOT EXISTS analytics.daily_summary (
    date DATE PRIMARY KEY,
    total_threats INTEGER DEFAULT 0,
    blocked_threats INTEGER DEFAULT 0,
    resolved_threats INTEGER DEFAULT 0,
    recovery_success_rate NUMERIC(5,2) DEFAULT 0.0,
    active_devices INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reports.generated_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generated_by UUID REFERENCES core.users(id) ON DELETE SET NULL,
    report_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SCHEMA: audit (Immutable Ledger)
-- ==========================================

CREATE TABLE IF NOT EXISTS audit.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL CHECK (category IN ('AUTH', 'API', 'THREAT', 'AGENT', 'AI', 'RECOVERY', 'SYSTEM')),
    action VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    source_ip INET,
    user_id UUID REFERENCES core.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_created_at ON audit.system_logs(created_at DESC);
CREATE INDEX idx_audit_logs_category ON audit.system_logs(category);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE threats.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices.registered_devices ENABLE ROW LEVEL SECURITY;

-- Policies for Threats (Assume JWT contains role)
-- VIEWER can only read
CREATE POLICY select_incidents_policy ON threats.incidents FOR SELECT USING (true);
-- ADMIN, ANALYST, DEVELOPER can insert/update
CREATE POLICY modify_incidents_policy ON threats.incidents FOR ALL USING (
  current_setting('request.jwt.claims', true)::json->>'role' IN ('ADMIN', 'ANALYST', 'DEVELOPER')
);

-- Policies for Devices
CREATE POLICY select_devices_policy ON devices.registered_devices FOR SELECT USING (true);
CREATE POLICY modify_devices_policy ON devices.registered_devices FOR ALL USING (
  current_setting('request.jwt.claims', true)::json->>'role' IN ('ADMIN', 'DEVELOPER')
);

-- ==========================================
-- VIEWS AND FUNCTIONS
-- ==========================================

CREATE OR REPLACE VIEW analytics.vw_threat_summary AS
SELECT 
    severity,
    status,
    COUNT(*) as total_count
FROM threats.incidents
GROUP BY severity, status;

CREATE OR REPLACE FUNCTION analytics.fn_update_daily_summary()
RETURNS trigger AS $$
BEGIN
    INSERT INTO analytics.daily_summary (date, total_threats)
    VALUES (CURRENT_DATE, 1)
    ON CONFLICT (date) DO UPDATE 
    SET total_threats = analytics.daily_summary.total_threats + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_daily_threats
AFTER INSERT ON threats.incidents
FOR EACH ROW
EXECUTE FUNCTION analytics.fn_update_daily_summary();
