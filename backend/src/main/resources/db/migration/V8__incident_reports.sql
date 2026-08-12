-- ==========================================
-- Migration V8: Incident Reports Schema
-- ==========================================

CREATE TABLE IF NOT EXISTS reports.incident_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES threats.incidents(id) ON DELETE CASCADE,
    report_content JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
