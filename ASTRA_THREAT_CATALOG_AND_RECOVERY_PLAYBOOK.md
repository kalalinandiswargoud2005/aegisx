# ASTRA EDR & Threat Intelligence Platform: Complete Threat Vectors, Live Attacks & Recovery Playbooks

---

## 1. Executive Summary & Architecture Overview

**ASTRA** (*Autonomous Enterprise Threat Intelligence, Endpoint Security & Hardware Appliance*) combines deterministic hardware monitoring, real-time agent telemetry, and AI cognitive reasoning into a unified defense platform.

### Detection & Telemetry Flow:
1. **Endpoint Agent Layer (`windows-agent`):** Continuous real-time monitoring of Windows Event Logs, Active Processes, Registry Run Keys, File System Integrity, Network Sockets, USB/HID Buses, Local Security Accounts, and System Performance (CPU/RAM). Telemetry is gathered and dispatched over TLS-encrypted WebSockets in **<50ms**.
2. **Threat Catalog & Heuristic Correlation Layer (`backend`):** Cross-references live telemetry, process hashes, and signature anomalies against the enterprise Threat Catalog and MITRE ATT&CK mappings.
3. **AI Cognitive Analysis Layer (`AIService` with Google Gemini):** Performs intent analysis, calculates attack blast radius, validates false positives, and generates dynamic step-by-step remediation scripts.
4. **Autonomous Response & Remediation Engine (`RemediationExecutor` & `CommandDispatchService`):** Dispatches instantaneous containment commands (Host Isolation, Process Termination, Quarantine, Registry Restoration) and renders cinematic visual alerts and recovery overlays on target endpoints.

---

## 2. Threat Vectors Page (`/attacks`) Full Specification

The **Threat Vectors** interface in Astra is the centralized command hub for security operators. It features two primary operational modes: **[LIVE ATTACKS]** (real safe payload execution on target endpoints) and **[SCRIPTED SCENARIOS]** (50-threat simulation library).

### 2.1 Threat Vectors: Real-Time Immediate Action Mapping
Every threat arriving on the Threat Vectors live timeline triggers an instantaneous containment action:

| Threat Vector Type | Severity Level | Autonomous Immediate Action Executed |
| :--- | :--- | :--- |
| **`RANSOMWARE`** | `CRITICAL` | *Isolated endpoint & terminated malicious process* |
| **`SQL_INJECTION`** | `CRITICAL` | *Blocked attack IP & sanitised database inputs* |
| **`BRUTE_FORCE`** | `MEDIUM` | *Locked account & enforced MFA challenge* |
| **`DDoS`** | `HIGH` | *Rate-limiting applied & traffic scrubbing active* |
| **`MAN_IN_THE_MIDDLE`** | `HIGH` | *Terminated session & rotated TLS certificates* |
| **`ZERO_DAY`** | `CRITICAL` | *Applied virtual patch & alerted security team* |
| **`PHISHING`** | `HIGH` | *Quarantined email & revoked credential session* |
| **`INSIDER_THREAT`** | `HIGH` | *Suspended user account & alerted CISO* |
| **`DATA_EXFILTRATION`** | `CRITICAL` | *Blocked outbound channel & preserved memory dump* |
| **`PRIVILEGE_ESCALATION`** | `CRITICAL` | *Reverted privilege & locked compromised account* |
| **`MALWARE`** | `CRITICAL` | *Quarantined process & triggered AV deep scan* |
| **`PORT_SCAN`** | `LOW` | *Blocked scanning IP & tightened firewall rules* |
| **`DEFAULT`** | `MEDIUM` | *Isolated affected system & initiated recovery* |

---

## 3. Threat Vectors: Live Attacks Tab (Interactive Demonstration Suite)

These attacks are executed directly on target Windows machines via the agent daemon (`RemediationExecutor.java`). Each attack runs harmless but observable changes, pops up relevant GUI windows for demonstration, and provides instantaneous single-click or autonomous recovery.

```
+-----------------------------------------------------------------------------------------+
|                                LIVE ATTACK EXECUTION FLOW                                |
|  [Simulate Attack]  ==>  [Agent Triggers Payload]  ==>  [Telemetry Fired (<50ms)]       |
|                             ||                                    ||                    |
|                             \/                                    \/                    |
|  [Screen HUD Overlay] <== [Autonomous Recovery]  <==  [AI Triage & Step Dispatch]       |
+-----------------------------------------------------------------------------------------+
```

### Vector 1: Execute Ransomware (`SIMULATED_RANSOMWARE`)
* **Button:** `Execute Ransomware`
* **Category:** Ransomware / Data Destruction
* **Severity:** `CRITICAL`
* **Live Attack Injection Script:**
  ```powershell
  New-Item -ItemType Directory -Force -Path 'C:\Astra\ValuableData'; 
  Set-Content -Path 'C:\Astra\ValuableData\financials.pdf' -Value 'CONFIDENTIAL FINANCIAL REPORT 2026'; 
  Set-Content -Path 'C:\Astra\ValuableData\passwords.txt' -Value 'ADMIN_PASSWORDS_VAULT'; 
  Start-Process explorer.exe -ArgumentList 'C:\Astra\ValuableData'; 
  Start-Sleep -Seconds 1; 
  Rename-Item -Path 'C:\Astra\ValuableData\financials.pdf' -NewName 'financials.pdf.encrypted' -Force; 
  Rename-Item -Path 'C:\Astra\ValuableData\passwords.txt' -NewName 'passwords.txt.encrypted' -Force
  ```
* **Real-Time Detection:** `FileSystemMonitor` detects rapid batch file rename burst with `.encrypted` extensions.
* **Immediate Response:** Isolate Endpoint & trigger full-screen Red HUD Alert.
* **Exact Recovery Script:**
  ```powershell
  Rename-Item -Path 'C:\Astra\ValuableData\financials.pdf.encrypted' -NewName 'financials.pdf' -Force -ErrorAction SilentlyContinue; 
  Rename-Item -Path 'C:\Astra\ValuableData\passwords.txt.encrypted' -NewName 'passwords.txt' -Force -ErrorAction SilentlyContinue
  ```

---

### Vector 2: Registry Hijack (`REGISTRY_HIJACK`)
* **Button:** `Registry Hijack`
* **Category:** Persistence / Defense Evasion
* **Severity:** `HIGH`
* **Live Attack Injection Script:**
  ```cmd
  reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableTaskMgr /t REG_DWORD /d 1 /f && start taskmgr
  ```
* **Real-Time Detection:** Registry monitor intercepts policy write to `DisableTaskMgr`. Task Manager opens showing "Task Manager has been disabled by your administrator".
* **Immediate Response:** Automated policy rollback notification.
* **Exact Recovery Script:**
  ```cmd
  reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableTaskMgr /f
  ```

---

### Vector 3: Open Backdoor Port (`BACKDOOR_PORT`)
* **Button:** `Open Backdoor Port`
* **Category:** Command & Control (C2)
* **Severity:** `CRITICAL`
* **Live Attack Injection Script:**
  ```powershell
  Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Write-Host "[ASTRA DEMO] Listening Backdoor Port TCP 4444 Active"; $listener = [System.Net.Sockets.TcpListener]4444; $listener.Start(); netstat -ano | Select-String 4444'
  ```
* **Real-Time Detection:** Socket monitor flags unauthorized TCP listener bound to `0.0.0.0:4444`.
* **Immediate Response:** Quarantine socket & kill rogue listener PID.
* **Exact Recovery Script:**
  ```powershell
  Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*4444*' } | Stop-Process -Force -ErrorAction SilentlyContinue
  ```

---

### Vector 4: Lateral Movement (`LATERAL_MOVEMENT`)
* **Button:** `Lateral Movement`
* **Category:** Identity / Privilege Escalation
* **Severity:** `CRITICAL`
* **Live Attack Injection Script:**
  ```powershell
  Start-Process lusrmgr.msc; net user Guest /active:yes; net localgroup Administrators Guest /add
  ```
* **Real-Time Detection:** `AdministratorMonitor` intercepts Event 4728 (Member added to local Administrators security group) and opens Local Users & Groups console.
* **Immediate Response:** Account privilege revocation.
* **Exact Recovery Script:**
  ```cmd
  net localgroup Administrators Guest /delete
  net user Guest /active:no
  ```

---

### Vector 5: Data Exfiltration (`DATA_EXFILTRATION`)
* **Button:** `Data Exfiltration`
* **Category:** Exfiltration
* **Severity:** `HIGH`
* **Live Attack Injection Script:**
  ```powershell
  Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Write-Host "[ASTRA DEMO] High-Throughput Outbound Data Exfiltration Simulation"; ping -t 8.8.8.8 -l 65500'
  ```
* **Real-Time Detection:** Network traffic monitor detects abnormal high-throughput continuous outbound ICMP packets.
* **Immediate Response:** Network adapter throttled & exfiltration task terminated.
* **Exact Recovery Script:**
  ```cmd
  taskkill /F /IM ping.exe
  ```

---

## 4. Threat Vectors: Live "WOW" Demo Effects (Visual Demonstration)

These buttons on the Threat Vectors page allow instructors and evaluators to trigger non-destructive visual effects on connected target screens:

| Feature / Button | Trigger Payload | Visual / Auditory Effect | Recovery Command |
| :--- | :--- | :--- | :--- |
| **`Ghost Typer`** | `powershell "$w = New-Object -ComObject wscript.shell; $w.Run('notepad.exe'); Start-Sleep -Milliseconds 700; $w.AppActivate('Notepad'); $w.SendKeys('ASTRA EDR DEMO: SYSTEM UNDER ATTACK!{ENTER}')"` | Spawns Notepad and types attacker notice in real-time | `taskkill /F /IM notepad.exe` |
| **`Wallpaper Hijack`** | `reg add "HKCU\Control Panel\Colors" /v Background /t REG_SZ /d "255 0 0" /f & RUNDLL32.EXE user32.dll,UpdatePerUserSystemParameters` | Changes desktop background color to warning red | Restores default Windows theme |
| **`Matrix Overlay`** | `overlay.showMatrixOverlay()` | Renders animated transparent hacker matrix code stream over screen | `CLEAR_MATRIX` |
| **`Clear Matrix`** | `overlay.hideMatrixOverlay()` | Instantly clears matrix rain animation | N/A |
| **`Instant Screen Lock`** | `rundll32.exe user32.dll,LockWorkStation` | Instantly locks workstation screen | Windows Hello / User PIN |
| **`Alarm Beep`** | `powershell "[console]::beep(1000, 500)"` | Plays hardware alert tone from motherboard speaker | Automatic timeout |

---

## 5. Threat Vectors: Scripted Scenarios Tab (50 Attack Scenarios)

The **Threat Library** on the Threat Vectors page houses the complete matrix of **50 enterprise attack scenarios** (`scenarios.json`). Each card displays the Threat Name, Category, Severity, and provides a direct "Trigger Threat" button:

| ID | Scenario Threat Name | Category | Severity | Live Attack Script | Dynamic Single-Step Recovery |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `THREAT-2026-001` | Ransomware Document Encryption | Ransomware | `MEDIUM` | `mkdir C:\Astra\Financials && echo "Q3 Report" > C:\Astra\Financials\report.pdf && explorer C:\Astra\Financials && timeout 2 && ren C:\Astra\Financials\*.pdf *.encrypted` | `ren C:\Astra\Financials\*.encrypted *.pdf` |
| `THREAT-2026-002` | Ransomware Image Encryption | Ransomware | `HIGH` | `mkdir C:\Astra\Images && echo "Logo" > C:\Astra\Images\logo.png && explorer C:\Astra\Images && timeout 2 && ren C:\Astra\Images\*.png *.locked` | `ren C:\Astra\Images\*.locked *.png` |
| `THREAT-2026-003` | Mass File Deletion | Sabotage | `CRITICAL` | `mkdir C:\Astra\Critical && echo "Data" > C:\Astra\Critical\data.txt && explorer C:\Astra\Critical && timeout 2 && del /q C:\Astra\Critical\*.*` | `echo "Data (Recovered)" > C:\Astra\Critical\data.txt` |
| `THREAT-2026-004` | Hidden Folder Creation | Malware | `HIGH` | `mkdir C:\Astra\HiddenMalware && attrib +h C:\Astra\HiddenMalware && explorer C:\Astra` | `rmdir /S /Q C:\Astra\HiddenMalware` |
| `THREAT-2026-005` | Rogue Batch Script Drop | Malware | `MEDIUM` | `mkdir C:\Astra\Temp && echo timeout 10 > C:\Astra\Temp\malicious.bat && explorer C:\Astra\Temp` | `del C:\Astra\Temp\malicious.bat` |
| `THREAT-2026-011` | Task Manager Disabled | Persistence | `MEDIUM` | `reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableTaskMgr /t REG_DWORD /d 1 /f && start taskmgr` | `reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableTaskMgr /f` |
| `THREAT-2026-012` | Command Prompt Disabled | Persistence | `CRITICAL` | `reg add "HKCU\Software\Policies\Microsoft\Windows\System" /v DisableCMD /t REG_DWORD /d 1 /f && start cmd` | `reg delete "HKCU\Software\Policies\Microsoft\Windows\System" /v DisableCMD /f` |
| `THREAT-2026-013` | Registry Run Key Persistence | Persistence | `MEDIUM` | `reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v AstraRogue /t REG_SZ /d "calc.exe" /f && start regedit` | `reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v AstraRogue /f` |
| `THREAT-2026-014` | Defender Real-time Disabled | Evasion | `HIGH` | `powershell -Command "Set-MpPreference -DisableRealtimeMonitoring $true" && start windowsdefender:` | `powershell -Command "Set-MpPreference -DisableRealtimeMonitoring $false"` |
| `THREAT-2026-015` | Firewall Disabled | Evasion | `CRITICAL` | `netsh advfirewall set allprofiles state off && start firewall.cpl` | `netsh advfirewall set allprofiles state on` |
| `THREAT-2026-021` | Rogue Listening Port (4444) | C2 | `CRITICAL` | `start /b powershell -Command "$listener = [System.Net.Sockets.TcpListener]4444; $listener.Start(); while($true){ Start-Sleep -Seconds 1 }" && timeout 2 && cmd /c netstat -ano \| findstr 4444` | `powershell -Command "Get-Process \| Where-Object {$_.ProcessName -match 'powershell'} \| Stop-Process -Force"` |
| `THREAT-2026-022` | Data Exfiltration Flood | Exfiltration | `HIGH` | `start /b ping -t 8.8.8.8 -l 65500 && start taskmgr` | `taskkill /F /IM ping.exe` |
| `THREAT-2026-023` | Proxy Hijack | Network | `MEDIUM` | `reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f && reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyServer /t REG_SZ /d "127.0.0.1:8080" /f` | `reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f` |
| `THREAT-2026-024` | Hosts File Poisoning | Network | `CRITICAL` | `echo 1.1.1.1 google.com >> C:\Windows\System32\drivers\etc\hosts && notepad C:\Windows\System32\drivers\etc\hosts` | `powershell -Command "(Get-Content C:\Windows\System32\drivers\etc\hosts) -notmatch 'google.com' \| Set-Content C:\Windows\System32\drivers\etc\hosts"` |
| `THREAT-2026-025` | Disable Network Adapter | Network | `MEDIUM` | `start ncpa.cpl` | `powershell -Command "Get-NetAdapter \| Enable-NetAdapter -Confirm:$false"` |
| `THREAT-2026-031` | Guest Account Enabled | Identity | `MEDIUM` | `net user Guest /active:yes && start lusrmgr.msc` | `net user Guest /active:no` |
| `THREAT-2026-032` | Guest Promoted to Admin | Privilege Escalation | `HIGH` | `net user Guest /active:yes && net localgroup Administrators Guest /add && start lusrmgr.msc` | `net localgroup Administrators Guest /delete && net user Guest /active:no` |
| `THREAT-2026-033` | Rogue User Creation | Identity | `CRITICAL` | `net user Hacker Password123! /add && start lusrmgr.msc` | `net user Hacker /delete` |
| `THREAT-2026-034` | Password Policy Weakened | Identity | `HIGH` | `net accounts /minpwlen:0 /maxpwage:unlimited && start secpol.msc` | `net accounts /minpwlen:8 /maxpwage:90` |
| `THREAT-2026-035` | RDP Enabled | Identity | `MEDIUM` | `reg add "HKLM\System\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f && start sysdm.cpl` | `reg add "HKLM\System\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 1 /f` |
| `THREAT-2026-036` to `THREAT-2026-050` | Advanced Subversion Variations (36–50) | Evasion / Process Probe | `MEDIUM` to `CRITICAL` | `start calc.exe` | `taskkill /F /IM calc.exe` |

---

## 6. Enterprise Threat Catalog (25 Canonical Database Threats)

| Threat ID | Threat Name | Category | Severity | Detection Mechanism | Immediate Action | Recovery Workflow Summary |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **THREAT-001** | SQL Injection (SQLi) | Web Security | `CRITICAL` | WAF heuristic analysis & payload signature matching | Block source IP & terminate session | 1. Review Web Server Logs<br>2. Trace vulnerable API parameter<br>3. Enforce Prepared Statements/ORMs<br>4. Run AST vulnerability scan<br>5. Restore database from clean snapshot |
| **THREAT-002** | Cross-Site Scripting (XSS) | Web Security | `HIGH` | WAF rule triggers & endpoint script injection monitoring | Drop malicious request & invalidate user token | 1. Clear active sessions<br>2. Sanitize backend response encoders<br>3. Implement Content Security Policy (CSP)<br>4. Audit client DOM sinks<br>5. Validate with automated XSS test suite |
| **THREAT-003** | Brute Force Authentication | Identity | `MEDIUM` | Event Log 4625 threshold (>5 failures/60s) | Temporarily lock targeted user account | 1. Notify impacted user<br>2. Enforce complexity policy<br>3. Apply exponential rate limiting<br>4. Enforce Multi-Factor Authentication (MFA)<br>5. Audit auth logs for compromised accounts |
| **THREAT-004** | Credential Stuffing | Identity | `HIGH` | Distributed logins across multiple accounts from single IP/subnet | Block offending IP subnet & flag accounts | 1. Trigger forced password resets<br>2. Enable mandatory MFA<br>3. Query compromised database hashes (HIBP)<br>4. Correlate with threat intel feeds<br>5. Notify security operations |
| **THREAT-005** | Password Spray Attack | Identity | `HIGH` | Single common password attempted against large user pool | Block attacking IP & restrict authentication gateway | 1. Audit enterprise login logs<br>2. Enforce minimum 14-char password policy<br>3. Enforce adaptive MFA challenges<br>4. Monitor for successful anomalous logins<br>5. Brief security incident team |
| **THREAT-006** | Privilege Escalation | System Security | `CRITICAL` | EDR detects unauthorized token impersonation / `SeDebugPrivilege` / UAC bypass | Kill offending process tree & isolate host | 1. Identify exploited vulnerability (e.g. CVE-2024-xxxx)<br>2. Patch system OS / kernel<br>3. Audit local Administrators group<br>4. Revoke unauthorized privileges<br>5. Restore compromised binaries |
| **THREAT-007** | Malware / Trojan Infection | Endpoint | `CRITICAL` | Antivirus / EDR hash lookup against Threat Catalog DB & behavioral heuristics | Quarantine executable file & freeze host | 1. Isolate endpoint from network<br>2. Run full system offline scan<br>3. Trace infection vector (email/drive-by)<br>4. Reimage workstation if rootkit detected<br>5. Update global catalog hash signatures |
| **THREAT-008** | Ransomware Cryptor | Endpoint | `CRITICAL` | Rapid mass file rename (`.encrypted`/`.locked`) & shadow copy deletion attempts (`vssadmin`) | Immediate network adapter severance & process termination | 1. Isolate endpoint from LAN/VLAN<br>2. Identify ransomware family variant<br>3. Stop all network shares<br>4. Execute automated file decryption / rollback<br>5. Restore corrupted data from immutable offline backups |
| **THREAT-009** | Command & Control (C2) Beacon | Network | `CRITICAL` | Network IDS detects beaconing intervals & known malicious IP/domain communication | Block outbound destination IP on edge firewall & kill socket | 1. Sever host network access<br>2. Identify initiating PID / process image<br>3. Extract memory dumps for C2 extraction<br>4. Deploy firewall blocking rule enterprise-wide<br>5. Reimage compromised host |
| **THREAT-010** | DNS Tunneling / Exfiltration | Network | `HIGH` | Anomaly detection on high-entropy subdomains & non-standard TXT/NULL record volumes | Block malicious domain on recursive DNS resolvers | 1. Isolate querying endpoint<br>2. Restrict DNS queries strictly to internal DNS<br>3. Deploy DNS sinkholing<br>4. Extract and analyze exfiltrated payload<br>5. Update Threat Intelligence indicators (IOCs) |
| **THREAT-011** | External Port Scan (Recon) | Network | `LOW` | Edge firewall detects sequential SYN probes across port ranges | Temporarily drop and blacklist source IP | 1. Audit perimeter firewall access lists<br>2. Verify closed unneeded external ports<br>3. Log probe fingerprint<br>4. Update intrusion detection thresholds<br>5. Monitor for secondary targeted exploitation |
| **THREAT-012** | Internal Lateral Port Scan | Network | `MEDIUM` | Agent detects internal host scanning adjacent subnet addresses | Isolate scanning host immediately | 1. Determine compromised account/process<br>2. Review internal VLAN microsegmentation<br>3. Execute endpoint malware scan<br>4. Reset all credentials cached on host<br>5. Monitor lateral communication channels |
| **THREAT-013** | Data Exfiltration | Data Security | `CRITICAL` | Network/DLP monitor detects large outbound volume (e.g. continuous ICMP/TCP flood) | Kill exfiltrating process & terminate network adapter | 1. Block outbound target endpoint<br>2. Conduct forensics on exfiltrated data files<br>3. Evaluate regulatory & compliance impact<br>4. Patch data leak channel<br>5. Formalize incident report & notify leadership |
| **THREAT-014** | Insider Threat / Data Snooping | Identity | `HIGH` | User Behavior Analytics (UBA) flags anomalous file access outside working baseline | Suspend user domain account & revoke session | 1. Audit user access and file touch logs<br>2. Conduct HR/Security supervisor review<br>3. Revoke elevated repository permissions<br>4. Re-enforce principle of least privilege (PoLP)<br>5. Update insider threat detection baselines |
| **THREAT-015** | Unauthorized USB / BadUSB Device | Hardware / Endpoint | `MEDIUM` / `HIGH` | `USBMonitor` detects unapproved Vendor ID / Product ID insertion or HID keystroke injector | Block USB mass storage / disable port driver | 1. Show enforcement banner on user screen<br>2. Inspect copied files / staged scripts<br>3. Execute endpoint deep scan<br>4. Enforce strict USB hardware whitelisting<br>5. Log device hardware serial into forensic database |
| **THREAT-016** | Host Firewall Disabled | Endpoint | `HIGH` | `FirewallMonitor` detects all Windows Firewall profiles set to `OFF` | Automatically re-enable Windows Firewall across all profiles | 1. Execute `netsh advfirewall set allprofiles state on`<br>2. Identify responsible PID or user context<br>3. Run rootkit/malware scan<br>4. Re-enforce Group Policy (GPO)<br>5. Audit system event log 5025 |
| **THREAT-017** | Antivirus / Defender Disabled | Endpoint | `CRITICAL` | `DefenderMonitor` detects `DisableRealtimeMonitoring = true` | Force enable Real-Time Protection via PowerShell API | 1. Execute `Set-MpPreference -DisableRealtimeMonitoring $false`<br>2. Isolate host pending verification<br>3. Investigate tamper vector<br>4. Trigger Defender Quick/Full scan (`Start-MpScan`)<br>5. Lock down Tamper Protection via Intune/GPO |
| **THREAT-018** | Unexpected VPN Disconnection | Network | `MEDIUM` | `VPNMonitor` detects dropped tunnel while on untrusted network | Force re-connect & engage network kill-switch | 1. Re-establish encrypted VPN tunnel<br>2. Verify local network integrity<br>3. Inspect cleartext traffic leaks<br>4. Validate VPN client certificate<br>5. Review gateway connectivity logs |
| **THREAT-019** | High CPU Anomaly / Cryptomining | Performance | `LOW` / `MEDIUM` | `CPUMonitor` detects sustained 100% CPU with unknown process signature | Throttle or kill abnormal process | 1. Identify offending process via Task Manager/CLI<br>2. Terminate unauthorized miner (`taskkill /F`)<br>3. Analyze binary provenance and origin<br>4. Execute AV scan<br>5. Optimize benign software or reimage host |
| **THREAT-020** | Memory Exhaustion / DoS | Performance | `LOW` | `MemoryMonitor` detects >99% RAM usage and memory leak loop | Identify and restart offending application | 1. Isolate memory hog PID<br>2. Terminate hung process<br>3. Debug application for uncollected memory handles<br>4. Allocate appropriate virtual memory / paging file<br>5. Restore normal operational load |
| **THREAT-021** | Critical Security Service Failure | System Security | `HIGH` | `ServiceMonitor` detects stoppage of EDR, EventLog, or Cryptographic services | Auto-restart failed service immediately | 1. Issue service restart commands (`Start-Service`)<br>2. Review crash logs and event ID 7034<br>3. Check for malicious termination attempts<br>4. Reinstall corrupted service binaries<br>5. Continuously monitor service health state |
| **THREAT-022** | File Integrity Violation (FIM) | Endpoint | `HIGH` | `FileIntegrityMonitor` detects checksum modification on protected system files | Restore original file from secure snapshot & isolate host | 1. Check modified file hash against baseline catalog<br>2. Overwrite modified binary with validated gold image<br>3. Identify process responsible for disk write<br>4. Run rootkit/malware deep scan<br>5. Recalculate and update FIM cryptographic baselines |
| **THREAT-023** | Unauthorized Admin Account Creation | Identity | `CRITICAL` | `AdministratorMonitor` detects new user added to `Administrators` local group | Immediately disable rogue account & strip privileges | 1. Execute `Disable-LocalUser` & delete account<br>2. Remove user from local `Administrators`<br>3. Isolate device from network<br>4. Investigate event ID 4720 (User Created) & 4728 (Member Added)<br>5. Re-audit all privileged access accounts |
| **THREAT-024** | Rogue Scheduled Task Persistence | Endpoint | `HIGH` | `ScheduledTaskMonitor` detects new task creation with suspicious binaries | Disable and delete rogue scheduled task | 1. Execute `schtasks /delete /tn <task> /f`<br>2. Analyze target payload binary<br>3. Quarantine referenced executable<br>4. Check registry run keys for secondary persistence<br>5. Monitor system restart logs |
| **THREAT-025** | Unauthorized RDP Enabling | Endpoint | `HIGH` | `RDPMonitor` detects `fDenyTSConnections` set to `0` | Immediately toggle registry to disable Remote Desktop | 1. Write `fDenyTSConnections = 1` in registry<br>2. Terminate any active RDP sessions (`qwinsta`/`rwinsta`)<br>3. Isolate machine if connection was external<br>4. Review incoming RDP authentication logs (Event 1149)<br>5. Enforce GPO policy |
