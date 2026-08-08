-- ==========================================
-- Migration V3: Threat Catalog Schema and Data
-- ==========================================

CREATE TABLE IF NOT EXISTS threats.threat_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    threat_id VARCHAR(50) UNIQUE NOT NULL,
    threat_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    description TEXT,
    how_attack_happens TEXT,
    detection_method TEXT,
    immediate_action TEXT,
    recovery_step_1 TEXT,
    recovery_step_2 TEXT,
    recovery_step_3 TEXT,
    recovery_step_4 TEXT,
    recovery_step_5 TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-001', 'SQL Injection', 'Web Security', 'CRITICAL', 'An attacker executes malicious SQL statements that control a web application''s database server.', 'Attacker injects SQL queries into input fields.', 'WAF signature detection', 
    'Block IP and block request.', 'Review Web Server Logs.', 'Identify vulnerable endpoints.', 'Patch SQL queries (use Prepared Statements).', 'Run vulnerability scan.', 'Restore database if data modified.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-002', 'Cross-Site Scripting (XSS)', 'Web Security', 'HIGH', 'An attacker injects malicious executable scripts into the code of a trusted application or website.', 'User input is not sanitized and rendered on page.', 'WAF or Endpoint Security detection.', 
    'Block request.', 'Clear user sessions.', 'Sanitize inputs on backend.', 'Implement Content Security Policy (CSP).', 'Review logs.', 'Test XSS vulnerabilities.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-003', 'Brute Force Login', 'Identity', 'MEDIUM', 'Repeated attempts to guess a password by systematically trying every possible combination.', 'Attacker uses automated scripts to guess passwords.', 'Failed login threshold exceeded.', 
    'Lock account temporarily.', 'Notify user.', 'Enforce strong password policy.', 'Implement rate limiting.', 'Enable MFA.', 'Review login logs.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-004', 'Credential Stuffing', 'Identity', 'HIGH', 'Using breached credentials to attempt unauthorized access to user accounts.', 'Attacker uses lists of compromised credentials.', 'Multiple logins across different accounts from same IP.', 
    'Block offending IP.', 'Force password reset for affected accounts.', 'Enable MFA.', 'Check against HaveIBeenPwned API.', 'Monitor logs.', 'Alert users.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-005', 'Password Spray', 'Identity', 'HIGH', 'Trying a few common passwords against many accounts to avoid lockout.', 'Attacker tries ''Password123'' across all users.', 'Multiple failed logins across different users.', 
    'Block IP.', 'Review authentication logs.', 'Enforce strong passwords.', 'Enable MFA.', 'Monitor for success.', 'Alert security team.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-006', 'Privilege Escalation', 'System Security', 'CRITICAL', 'Exploiting a bug or misconfiguration to gain elevated access to resources.', 'Attacker leverages vulnerability to gain root/admin.', 'EDR detects unauthorized root access.', 
    'Kill suspicious process.', 'Isolate host.', 'Identify exploited vulnerability.', 'Patch system.', 'Audit permissions.', 'Restore from clean backup.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-007', 'Malware Infection', 'Endpoint', 'CRITICAL', 'Malicious software executed on an endpoint.', 'User clicks phishing link or opens malicious attachment.', 'Antivirus detects known signature.', 
    'Quarantine file.', 'Isolate endpoint from network.', 'Run full system scan.', 'Identify infection source.', 'Reimage machine if necessary.', 'Update AV signatures.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-008', 'Ransomware', 'Endpoint', 'CRITICAL', 'Malware that encrypts files and demands payment.', 'User runs ransomware payload.', 'EDR detects mass file encryption.', 
    'Isolate host immediately.', 'Disconnect from network.', 'Identify ransomware variant.', 'Restore from offline backup.', 'Do not pay ransom.', 'Notify authorities.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-009', 'Command & Control Communication', 'Network', 'CRITICAL', 'Compromised host communicating with attacker infrastructure.', 'Malware beacons to external C2 server.', 'Network IDS detects known C2 traffic.', 
    'Block outbound traffic to C2 IP.', 'Isolate host.', 'Run malware scan.', 'Identify compromised process.', 'Reimage host.', 'Update firewall rules.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-010', 'DNS Tunneling', 'Network', 'HIGH', 'Encoding data of other programs or protocols in DNS queries and responses.', 'Attacker uses DNS to bypass firewall.', 'IDS detects anomalous DNS queries.', 
    'Block malicious domain.', 'Investigate source endpoint.', 'Restrict DNS to authorized resolvers.', 'Implement DNS filtering.', 'Analyze exfiltrated data.', 'Update threat intelligence.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-011', 'Port Scan', 'Network', 'LOW', 'Probing a server or host for open ports.', 'Attacker scans network to find vulnerabilities.', 'Firewall detects rapid connection attempts.', 
    'Block source IP temporarily.', 'Review firewall rules.', 'Ensure unnecessary ports are closed.', 'Monitor for follow-up attacks.', 'Update IDS signatures.', 'No further action needed.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-012', 'Internal Network Scan', 'Network', 'MEDIUM', 'Compromised internal host scanning for other targets.', 'Malware or insider probes internal subnet.', 'IDS detects internal port scanning.', 
    'Isolate source host.', 'Investigate host for compromise.', 'Review network segmentation.', 'Run malware scan.', 'Reimage if compromised.', 'Monitor network.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-013', 'Data Exfiltration', 'Data Security', 'CRITICAL', 'Unauthorized transfer of data from a computer.', 'Attacker transfers sensitive data to external server.', 'DLP detects large outbound transfer.', 
    'Block outbound transfer.', 'Isolate host.', 'Identify exfiltrated data.', 'Assess regulatory impact.', 'Investigate breach vector.', 'Notify stakeholders.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-014', 'Insider Threat', 'Identity', 'HIGH', 'Malicious act committed by an employee or contractor.', 'User accesses data outside normal behavior.', 'UBA detects anomalous access patterns.', 
    'Suspend user account.', 'Review audit logs.', 'Interview employee/manager.', 'Revoke unauthorized access.', 'Implement principle of least privilege.', 'Update security policies.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-015', 'Unauthorized USB Device', 'Endpoint', 'MEDIUM', 'Connection of an unapproved USB mass storage device.', 'User plugs in personal USB drive.', 'Agent detects USB insertion.', 
    'Block USB access.', 'Alert user of policy violation.', 'Investigate files copied.', 'Run malware scan.', 'Enforce USB whitelisting.', 'Update endpoint policies.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-016', 'Firewall Disabled', 'Endpoint', 'HIGH', 'Host-based firewall has been turned off.', 'Malware or user disables Windows Firewall.', 'Agent detects firewall status change.', 
    'Re-enable firewall via policy.', 'Investigate who/what disabled it.', 'Run malware scan.', 'Ensure GPO enforcement.', 'Review endpoint logs.', 'Monitor host.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-017', 'Antivirus Disabled', 'Endpoint', 'CRITICAL', 'Endpoint protection software has been disabled.', 'Malware stops AV service to evade detection.', 'Agent detects AV service stopped.', 
    'Restart AV service immediately.', 'Isolate host from network.', 'Investigate cause of termination.', 'Run full offline scan.', 'Reimage if malware found.', 'Ensure tamper protection is on.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-018', 'VPN Disconnected', 'Network', 'MEDIUM', 'Secure VPN connection terminated unexpectedly.', 'Network issue or user disconnected VPN.', 'Agent detects VPN interface down.', 
    'Attempt automatic reconnection.', 'Check network connectivity.', 'Verify user intent.', 'Monitor for unencrypted traffic.', 'Update VPN client.', 'Review VPN server logs.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-019', 'High CPU Anomaly', 'Performance', 'LOW', 'CPU usage exceeds normal thresholds for extended period.', 'Cryptominer or runaway process consuming resources.', 'Agent detects 100% CPU.', 
    'Identify high CPU process.', 'Kill process if suspicious.', 'Investigate process origin.', 'Run malware scan if needed.', 'Monitor host.', 'Optimize application if benign.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-020', 'Memory Exhaustion', 'Performance', 'LOW', 'System memory is fully utilized.', 'Memory leak or heavy application load.', 'Agent detects 99% RAM usage.', 
    'Identify memory hog process.', 'Restart application.', 'Investigate for memory leaks.', 'Increase system resources.', 'Monitor performance.', 'No further action needed.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-021', 'Critical Service Failure', 'System Security', 'HIGH', 'A required system service has stopped running.', 'Software crash or targeted attack.', 'Agent detects service stopped.', 
    'Restart critical service.', 'Review system event logs.', 'Investigate root cause.', 'Apply software patches.', 'Monitor service stability.', 'Update alert thresholds.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-022', 'File Integrity Violation', 'Endpoint', 'HIGH', 'Unauthorized modification of a protected system file.', 'Malware replaces system binaries.', 'FIM detects file hash change.', 
    'Restore file from backup.', 'Isolate host.', 'Investigate modifying process.', 'Run full malware scan.', 'Reimage if system compromised.', 'Update FIM baselines.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-023', 'Unauthorized Administrator Account', 'Identity', 'CRITICAL', 'A new local administrator account was created.', 'Attacker creates backdoor account for persistence.', 'Agent detects local group modification.', 
    'Disable new account immediately.', 'Investigate account creator.', 'Isolate host.', 'Run malware scan.', 'Review audit logs.', 'Remove unauthorized account.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-024', 'Rogue Scheduled Task / Persistence', 'Endpoint', 'HIGH', 'A suspicious scheduled task was created.', 'Malware creates task to run on reboot.', 'Agent detects new scheduled task.', 
    'Disable scheduled task.', 'Analyze task action/executable.', 'Run malware scan on executable.', 'Delete task.', 'Isolate host if malicious.', 'Monitor for reinfection.'
) ON CONFLICT (threat_id) DO NOTHING;
INSERT INTO threats.threat_catalog (
    threat_id, threat_name, category, severity, description, how_attack_happens, detection_method, 
    immediate_action, recovery_step_1, recovery_step_2, recovery_step_3, recovery_step_4, recovery_step_5
) VALUES (
    'THREAT-025', 'Remote Desktop Configuration Change', 'Endpoint', 'HIGH', 'RDP was enabled on a host where it should be disabled.', 'Attacker enables RDP for lateral movement.', 'Agent detects RDP enabled.', 
    'Disable RDP immediately.', 'Investigate who enabled it.', 'Isolate host.', 'Review login attempts.', 'Ensure GPO enforcement.', 'Run malware scan.'
) ON CONFLICT (threat_id) DO NOTHING;
