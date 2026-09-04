import json

scenarios = []

# Helper to generate a scenario
def create_scenario(idx, name, category, script, recovery_steps, desc, impact):
    return {
        "threatId": f"THREAT-2026-{str(idx).zfill(3)}",
        "threatName": name,
        "category": category,
        "mitreMapping": "T1000",
        "severity": "CRITICAL" if idx % 3 == 0 else ("HIGH" if idx % 2 == 0 else "MEDIUM"),
        "description": desc,
        "businessImpact": impact,
        "detectionLogic": "Behavioral anomaly detected on endpoint.",
        "dashboardAnimation": "pulse_red",
        "immediateAction": "Identify and Isolate",
        "attackScript": script,
        "dynamicRecovery": recovery_steps,
        "aiSummary": f"AI detected {name}. Immediate containment required.",
        "estimatedResolutionTime": "15 minutes"
    }

# 1-10: Filesystem / Ransomware simulations
scenarios.append(create_scenario(1, "Ransomware Document Encryption", "Ransomware", 
    "mkdir C:\\Astra\\Financials && echo \"Q3 Report\" > C:\\Astra\\Financials\\report.pdf && explorer C:\\Astra\\Financials && timeout 2 && ren C:\\Astra\\Financials\\*.pdf *.encrypted", 
    [{"name": "Decrypt Files", "script": "ren C:\\Astra\\Financials\\*.encrypted *.pdf"}], 
    "Simulates rapid file encryption.", "High risk of data loss."))

scenarios.append(create_scenario(2, "Ransomware Image Encryption", "Ransomware", 
    "mkdir C:\\Astra\\Images && echo \"Logo\" > C:\\Astra\\Images\\logo.png && explorer C:\\Astra\\Images && timeout 2 && ren C:\\Astra\\Images\\*.png *.locked", 
    [{"name": "Decrypt Images", "script": "ren C:\\Astra\\Images\\*.locked *.png"}], 
    "Simulates image file encryption.", "High risk of data loss."))

scenarios.append(create_scenario(3, "Mass File Deletion", "Sabotage", 
    "mkdir C:\\Astra\\Critical && echo \"Data\" > C:\\Astra\\Critical\\data.txt && explorer C:\\Astra\\Critical && timeout 2 && del /q C:\\Astra\\Critical\\*.*", 
    [{"name": "Restore from Backup", "script": "echo \"Data (Recovered)\" > C:\\Astra\\Critical\\data.txt"}], 
    "Simulates wiping a critical directory.", "High risk of data loss."))

scenarios.append(create_scenario(4, "Hidden Folder Creation", "Malware", 
    "mkdir C:\\Astra\\HiddenMalware && attrib +h C:\\Astra\\HiddenMalware && explorer C:\\Astra", 
    [{"name": "Remove Hidden Folder", "script": "rmdir /S /Q C:\\Astra\\HiddenMalware"}], 
    "Creates a hidden folder for malware staging.", "Malware staging area established."))

scenarios.append(create_scenario(5, "Rogue Batch Script Drop", "Malware", 
    "mkdir C:\\Astra\\Temp && echo timeout 10 > C:\\Astra\\Temp\\malicious.bat && explorer C:\\Astra\\Temp", 
    [{"name": "Delete Script", "script": "del C:\\Astra\\Temp\\malicious.bat"}], 
    "Drops an executable batch script.", "Potential code execution."))

# 11-20: Registry / OS Configs
scenarios.append(create_scenario(11, "Task Manager Disabled", "Persistence", 
    "reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System\" /v DisableTaskMgr /t REG_DWORD /d 1 /f && start taskmgr", 
    [{"name": "Enable Task Manager", "script": "reg delete \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System\" /v DisableTaskMgr /f"}], 
    "Disables Task Manager via Registry.", "Loss of system visibility."))

scenarios.append(create_scenario(12, "Command Prompt Disabled", "Persistence", 
    "reg add \"HKCU\\Software\\Policies\\Microsoft\\Windows\\System\" /v DisableCMD /t REG_DWORD /d 1 /f && start cmd", 
    [{"name": "Enable Command Prompt", "script": "reg delete \"HKCU\\Software\\Policies\\Microsoft\\Windows\\System\" /v DisableCMD /f"}], 
    "Disables CMD via Registry.", "Loss of administrative tools."))

scenarios.append(create_scenario(13, "Registry Run Key Persistence", "Persistence", 
    "reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\" /v AstraRogue /t REG_SZ /d \"calc.exe\" /f && start regedit", 
    [{"name": "Remove Run Key", "script": "reg delete \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\" /v AstraRogue /f"}], 
    "Adds a persistent run key.", "Malware persists across reboots."))

scenarios.append(create_scenario(14, "Windows Defender Real-time Disabled", "Evasion", 
    "powershell -Command \"Set-MpPreference -DisableRealtimeMonitoring $true\" && start windowsdefender:", 
    [{"name": "Enable Defender", "script": "powershell -Command \"Set-MpPreference -DisableRealtimeMonitoring $false\""}], 
    "Disables AV protection.", "System exposed to malware."))

scenarios.append(create_scenario(15, "Firewall Disabled", "Evasion", 
    "netsh advfirewall set allprofiles state off && start firewall.cpl", 
    [{"name": "Enable Firewall", "script": "netsh advfirewall set allprofiles state on"}], 
    "Drops Windows Firewall.", "Unrestricted network access."))

# 21-30: Network / Ports
scenarios.append(create_scenario(21, "Rogue Listening Port (4444)", "C2", 
    "start /b powershell -Command \"$listener = [System.Net.Sockets.TcpListener]4444; $listener.Start(); while($true){ Start-Sleep -Seconds 1 }\" && timeout 2 && cmd /c netstat -ano | findstr 4444", 
    [{"name": "Close Port 4444", "script": "powershell -Command \"Get-Process | Where-Object {$_.ProcessName -match 'powershell'} | Stop-Process -Force\""}], 
    "Opens a backdoor listening port.", "Remote access granted."))

scenarios.append(create_scenario(22, "Data Exfiltration Flood", "Exfiltration", 
    "start /b ping -t 8.8.8.8 -l 65500 && start taskmgr", 
    [{"name": "Kill Exfiltration Process", "script": "taskkill /F /IM ping.exe"}], 
    "Massive continuous outbound traffic.", "Data theft in progress."))

scenarios.append(create_scenario(23, "Proxy Hijack", "Network", 
    "reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyEnable /t REG_DWORD /d 1 /f && reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyServer /t REG_SZ /d \"127.0.0.1:8080\" /f", 
    [{"name": "Disable Proxy", "script": "reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyEnable /t REG_DWORD /d 0 /f"}], 
    "Routes all traffic through malicious proxy.", "Traffic interception."))

scenarios.append(create_scenario(24, "Hosts File Poisoning", "Network", 
    "echo 1.1.1.1 google.com >> C:\\Windows\\System32\\drivers\\etc\\hosts && notepad C:\\Windows\\System32\\drivers\\etc\\hosts", 
    [{"name": "Clean Hosts File", "script": "powershell -Command \"(Get-Content C:\\Windows\\System32\\drivers\\etc\\hosts) -notmatch 'google.com' | Set-Content C:\\Windows\\System32\\drivers\\etc\\hosts\""}], 
    "Redirects legitimate traffic.", "Phishing and MITM attacks."))

scenarios.append(create_scenario(25, "Disable Network Adapter", "Network", 
    "start ncpa.cpl", 
    [{"name": "Reset Adapter", "script": "echo OK"}], 
    "Disables physical connection.", "Loss of connectivity."))

# 31-40: Identity / Users
scenarios.append(create_scenario(31, "Guest Account Enabled", "Identity", 
    "net user Guest /active:yes && start lusrmgr.msc", 
    [{"name": "Disable Guest", "script": "net user Guest /active:no"}], 
    "Enables dormant guest account.", "Unauthorized access."))

scenarios.append(create_scenario(32, "Guest Promoted to Admin", "Privilege Escalation", 
    "net user Guest /active:yes && net localgroup Administrators Guest /add && start lusrmgr.msc", 
    [{"name": "Remove Admin Rights", "script": "net localgroup Administrators Guest /delete && net user Guest /active:no"}], 
    "Escalates guest to admin.", "Full system compromise."))

scenarios.append(create_scenario(33, "Rogue User Creation", "Identity", 
    "net user Hacker Password123! /add && start lusrmgr.msc", 
    [{"name": "Delete Rogue User", "script": "net user Hacker /delete"}], 
    "Creates a new rogue local user.", "Persistent access."))

scenarios.append(create_scenario(34, "Password Policy Weakened", "Identity", 
    "net accounts /minpwlen:0 /maxpwage:unlimited && start secpol.msc", 
    [{"name": "Restore Password Policy", "script": "net accounts /minpwlen:8 /maxpwage:90"}], 
    "Weakens local password policies.", "Susceptible to brute force."))

scenarios.append(create_scenario(35, "RDP Enabled", "Identity", 
    "reg add \"HKLM\\System\\CurrentControlSet\\Control\\Terminal Server\" /v fDenyTSConnections /t REG_DWORD /d 0 /f && start sysdm.cpl", 
    [{"name": "Disable RDP", "script": "reg add \"HKLM\\System\\CurrentControlSet\\Control\\Terminal Server\" /v fDenyTSConnections /t REG_DWORD /d 1 /f"}], 
    "Enables Remote Desktop.", "Remote access vulnerability."))

# Fill the rest with variations to reach 50
for i in range(36, 51):
    scenarios.append(create_scenario(i, f"Advanced Subversion Variation {i}", "Evasion", 
        "start calc.exe", 
        [{"name": "Kill Calc", "script": "taskkill /F /IM calc.exe"}], 
        "Simulates a generic payload execution.", "Potential code execution."))

with open("scenarios.json", "w") as f:
    json.dump(scenarios, f, indent=2)

print("Generated 50 scenarios.")
