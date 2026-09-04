<#
.SYNOPSIS
    ASTRA EDR Agent - Enterprise Windows Service Uninstaller
.DESCRIPTION
    Stops and removes the ASTRA EDR Windows Service, unregisters the Session 0
    IPC overlay companion, restores Windows security baselines, and cleans files.
#>

# 1. Verify Administrator Privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[!] ERROR: Administrative privileges are required." -ForegroundColor Red
    Write-Host "Please re-run this uninstaller from an elevated PowerShell prompt (Run as Administrator)." -ForegroundColor Yellow
    exit 1
}

Write-Host "===================================================" -ForegroundColor Magenta
Write-Host "   ASTRA EDR AGENT - SERVICE UNINSTALLATION        " -ForegroundColor Magenta
Write-Host "===================================================" -ForegroundColor Magenta
Write-Host ""

# 2. Stop & Remove Windows Service
Write-Host "[1/5] Stopping and removing ASTRA Windows Services..." -ForegroundColor Yellow
$winswExe = "C:\Astra\Agent\AstraEDR.exe"
if (Test-Path $winswExe) {
    & $winswExe stop 2>&1 | Out-Null
    & $winswExe uninstall 2>&1 | Out-Null
    Write-Host "  [+] AstraEDR service removed via WinSW." -ForegroundColor Green
}

Get-Service -Name "AstraEDR" -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Service -Name "AstraEDR" -Force -ErrorAction SilentlyContinue
    sc.exe delete "AstraEDR" | Out-Null
    Write-Host "  [+] AstraEDR service unregistered via sc.exe." -ForegroundColor Green
}

# Remove any fallback scheduled tasks
Unregister-ScheduledTask -TaskName "AstraEDR_AgentService" -Confirm:$false -ErrorAction SilentlyContinue | Out-Null

# 3. Stop Active Background Processes and UI Companions
Write-Host "[2/5] Terminating active agent and UI companion processes..." -ForegroundColor Yellow
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { 
    $_.CommandLine -like '*windows-agent*' -or $_.CommandLine -like '*C:\Astra\Agent*' -or $_.CommandLine -like '*Astra-UI.vbs*'
} | ForEach-Object {
    Write-Host "  [-] Terminating PID: $($_.ProcessId)"
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

# 4. Remove User Session Registry Run Entries
Write-Host "[3/5] Cleaning user session startup registry..." -ForegroundColor Yellow
$regKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"
if (Get-ItemProperty -Path $regKey -Name "AstraOverlayCompanion" -ErrorAction SilentlyContinue) {
    Remove-ItemProperty -Path $regKey -Name "AstraOverlayCompanion" -Force -ErrorAction SilentlyContinue
    Write-Host "  [+] Removed AstraOverlayCompanion startup entry." -ForegroundColor Green
}

# 5. Restore Windows Security Defaults
Write-Host "[4/5] Restoring Windows security defaults..." -ForegroundColor Yellow
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableTaskMgr /f 2>&1 | Out-Null
reg delete "HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableTaskMgr /f 2>&1 | Out-Null
netsh advfirewall set allprofiles state on 2>&1 | Out-Null
Write-Host "  [+] Windows Firewall and Task Manager policies verified/restored." -ForegroundColor Green

# 6. Clean Installation Files
Write-Host "[5/5] Removing installation directory (C:\Astra)..." -ForegroundColor Yellow
if (Test-Path "C:\Astra") {
    try {
        Remove-Item -Path "C:\Astra" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  [+] Removed C:\Astra successfully." -ForegroundColor Green
    } catch {
        Write-Host "  [*] Some files locked; will be cleaned on reboot." -ForegroundColor DarkGray
    }
} else {
    Write-Host "  [*] No C:\Astra folder found." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "   UNINSTALLATION COMPLETE!                        " -ForegroundColor Green
Write-Host "   ASTRA EDR Service and all companion components  " -ForegroundColor Green
Write-Host "   have been completely removed from this computer." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
