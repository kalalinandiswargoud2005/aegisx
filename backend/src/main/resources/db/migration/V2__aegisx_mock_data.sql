-- ==========================================
-- AEGISX Enterprise - Mock Data Injection
-- ==========================================

-- NOTE: In PostgreSQL, when inserting into specific schemas, prefix the table.

-- Insert 4 Default Users
INSERT INTO core.users (id, email, name, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@aegisx.com', 'System Admin', 'ADMIN'),
('00000000-0000-0000-0000-000000000002', 'analyst@aegisx.com', 'Security Analyst', 'ANALYST'),
('00000000-0000-0000-0000-000000000003', 'viewer@aegisx.com', 'Executive Viewer', 'VIEWER'),
('00000000-0000-0000-0000-000000000004', 'dev@aegisx.com', 'Lead Developer', 'DEVELOPER')
ON CONFLICT (id) DO NOTHING;

-- Insert Devices (Agents, Hardware)
INSERT INTO devices.registered_devices (id, name, type, ip_address, status, health, os_version, agent_version) VALUES 
('10000000-0000-0000-0000-000000000001', 'DESKTOP-7G8K2P', 'WINDOWS_AGENT', '192.168.1.101', 'ONLINE', 'EXCELLENT', 'Windows 11 Pro', 'v1.0.3'),
('10000000-0000-0000-0000-000000000002', 'DESKTOP-M9X2Z1', 'WINDOWS_AGENT', '192.168.1.102', 'OFFLINE', 'UNKNOWN', 'Windows 10 Enterprise', 'v1.0.2'),
('10000000-0000-0000-0000-000000000004', 'AEGISX-PI-MASTER', 'RASPBERRY_PI', '192.168.1.200', 'ONLINE', 'GOOD', 'Debian 12', 'pi-core-1.5')
ON CONFLICT (id) DO NOTHING;

-- Insert Mock Threats
INSERT INTO threats.incidents (id, name, type, severity, status, target_device_id, target_ip, ai_confidence_score, ai_explanation) VALUES
('20000000-0000-0000-0000-000000000001', 'Unauthorized USB Device', 'Data Exfiltration', 'HIGH', 'ACTIVE', '10000000-0000-0000-0000-000000000001', '192.168.1.101', 96, 'A Kingston USB Drive was connected and attempted to copy restricted directories.'),
('20000000-0000-0000-0000-000000000002', 'Firewall Disabled', 'Configuration Change', 'HIGH', 'ACTIVE', '10000000-0000-0000-0000-000000000001', '192.168.1.101', 94, 'Windows Defender Firewall was turned off by a background process.'),
('20000000-0000-0000-0000-000000000003', 'Multiple Failed Logins', 'Brute Force', 'MEDIUM', 'MITIGATED', '10000000-0000-0000-0000-000000000002', '192.168.1.102', 88, '15 failed RDP login attempts in 2 minutes.'),
('20000000-0000-0000-0000-000000000004', 'Suspicious Registry Change', 'Persistence', 'LOW', 'RESOLVED', '10000000-0000-0000-0000-000000000001', '192.168.1.101', 82, 'A run key was added to HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run.')
ON CONFLICT (id) DO NOTHING;

-- Insert Mock Recovery Workflows
INSERT INTO recovery.workflows (id, incident_id, overall_status, started_at) VALUES 
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'IN_PROGRESS', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO recovery.steps (workflow_id, step_order, title, description, status) VALUES 
('30000000-0000-0000-0000-000000000001', 1, 'Enable Windows Firewall', 'Sending command to agent to re-enable domain/private/public profiles', 'COMPLETED'),
('30000000-0000-0000-0000-000000000001', 2, 'Run Security Scan', 'Executing quick Defender scan on endpoint', 'IN_PROGRESS'),
('30000000-0000-0000-0000-000000000001', 3, 'Verify System Integrity', 'Checking system files using sfc /scannow', 'PENDING')
ON CONFLICT (id) DO NOTHING;

-- Insert Mock Audit Logs
INSERT INTO audit.system_logs (category, action, message, user_id) VALUES 
('AUTH', 'LOGIN_SUCCESS', 'User authenticated successfully.', '00000000-0000-0000-0000-000000000001'),
('THREAT', 'INCIDENT_CREATED', 'New HIGH severity incident detected: Firewall Disabled.', NULL);
