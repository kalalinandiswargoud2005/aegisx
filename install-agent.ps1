<#
.SYNOPSIS
    ASTRA EDR Agent - Enterprise Centralized Installer
.DESCRIPTION
    Installs, configures, and boots the ASTRA Windows Agent on any endpoint laptop.
.EXAMPLE
    .\install-agent.ps1 -BackendUrl "http://192.168.1.100:8080"
#>

[CmdletBinding()]
param (
    [string]$BackendUrl = "http://localhost:8080",
    [string]$Hostname = $env:COMPUTERNAME,
    [string]$EnrollmentToken = "",
    [string]$InstallDir = "C:\Astra\Agent"
)

# Verify Administrator Privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[!] ERROR: Administrative privileges are required." -ForegroundColor Red
    Write-Host "Please re-run this installer from an elevated PowerShell prompt (Run as Administrator)." -ForegroundColor Yellow
    exit 1
}

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    ASTRA EDR AGENT - CENTRALIZED INSTALLER        " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Backend Server URL : $BackendUrl" -ForegroundColor Green
Write-Host " Endpoint Hostname  : $Hostname" -ForegroundColor Green
Write-Host " Install Directory  : $InstallDir" -ForegroundColor Green
Write-Host ""

# 1. Create Directories
Write-Host "[1/4] Preparing directories..." -ForegroundColor Yellow
$programDataDir = "C:\ProgramData\Astra\agent"
if (-not (Test-Path $programDataDir)) { New-Item -ItemType Directory -Path $programDataDir -Force | Out-Null }
if (-not (Test-Path $InstallDir)) { New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null }
$logsDir = Join-Path $InstallDir "logs"
if (-not (Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir -Force | Out-Null }
$quarantineDir = "C:\Astra\Quarantine"
if (-not (Test-Path $quarantineDir)) { New-Item -ItemType Directory -Path $quarantineDir -Force | Out-Null }

# 2. Write Bootstrap device.json
Write-Host "[2/4] Initializing local configuration..." -ForegroundColor Yellow
$deviceJsonPath = Join-Path $programDataDir "device.json"
$configData = @{
    backendUrl = $BackendUrl
    hostname = $Hostname
    registeredAt = (Get-Date).ToString("o")
}
if (-not [string]::IsNullOrWhiteSpace($EnrollmentToken)) {
    $configData["deviceToken"] = $EnrollmentToken
}
$configData | ConvertTo-Json | Set-Content -Path $deviceJsonPath -Force
Write-Host "  [+] Initialized $deviceJsonPath" -ForegroundColor Green

# 3. Locate & Copy Binaries
Write-Host "[3/4] Copying binaries..." -ForegroundColor Yellow
$scriptDir = $PSScriptRoot
$jarSource = Join-Path $scriptDir "windows-agent\target\windows-agent-1.0.0.jar"
if (-not (Test-Path $jarSource)) { $jarSource = Join-Path $scriptDir "windows-agent.jar" }
if (-not (Test-Path $jarSource)) { $jarSource = Join-Path $scriptDir "windows-agent\windows-agent.jar" }

if (Test-Path $jarSource) {
    Copy-Item -Path $jarSource -Destination (Join-Path $InstallDir "windows-agent.jar") -Force
    Write-Host "  [+] Installed windows-agent.jar to $InstallDir" -ForegroundColor Green
} else {
    Write-Host "  [!] Warning: windows-agent.jar not found at $jarSource" -ForegroundColor Red
}

# 4. Set System Environment Variables
Write-Host "[4/4] Configuring environment variables..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("ASTRA_BACKEND_URL", $BackendUrl, [EnvironmentVariableTarget]::Machine)
[Environment]::SetEnvironmentVariable("ASTRA_HOSTNAME", $Hostname, [EnvironmentVariableTarget]::Machine)
if (-not [string]::IsNullOrWhiteSpace($EnrollmentToken)) {
    [Environment]::SetEnvironmentVariable("ASTRA_AGENT_TOKEN", $EnrollmentToken, [EnvironmentVariableTarget]::Machine)
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "   INSTALLATION COMPLETE - READY TO RUN            " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host " To start the agent now, run:" -ForegroundColor Yellow
Write-Host "   .\start-agent.ps1 -BackendUrl `"$BackendUrl`"" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Green
