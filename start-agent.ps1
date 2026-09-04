<#
.SYNOPSIS
    ASTRA EDR Agent - Quick Start Runner
.DESCRIPTION
    Runs the ASTRA Windows Agent directly with dynamic central backend URL support.
.EXAMPLE
    .\start-agent.ps1 -BackendUrl "http://192.168.1.100:8080"
#>

[CmdletBinding()]
param (
    [string]$BackendUrl = "http://localhost:8080",
    [string]$Hostname = $env:COMPUTERNAME,
    [string]$AgentToken = ""
)

# Check Administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[!] WARNING: You are running without Administrator privileges." -ForegroundColor Yellow
    Write-Host "    Firewall reset, process termination, and registry recovery may fail without elevation." -ForegroundColor Yellow
    Write-Host "    Recommended: Run PowerShell as Administrator." -ForegroundColor Yellow
    Write-Host ""
}

# Stop background AstraEDR service if running (to prevent port 8082 collision and allow desktop GUI popups)
Get-Service -Name "AstraEDR" -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq "Running" } | ForEach-Object {
    Write-Host "[*] Stopping background AstraEDR service to launch interactive desktop runner..." -ForegroundColor Cyan
    Stop-Service -Name "AstraEDR" -Force -ErrorAction SilentlyContinue
}

# Ensure port 8082 is free
Get-NetTCPConnection -LocalPort 8082 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "[*] Releasing port 8082 (terminating previous background PID: $($_.OwningProcess))..." -ForegroundColor DarkGray
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

$scriptDir = $PSScriptRoot
$jarPath = Join-Path $scriptDir "windows-agent\target\windows-agent-1.0.0.jar"
if (-not (Test-Path $jarPath)) {
    $jarPath = Join-Path $scriptDir "windows-agent.jar"
}
if (-not (Test-Path $jarPath)) {
    $jarPath = Join-Path $scriptDir "windows-agent\windows-agent.jar"
}

if (-not (Test-Path $jarPath)) {
    Write-Host "[!] Compiling windows-agent binary first..." -ForegroundColor Yellow
    Push-Location (Join-Path $scriptDir "windows-agent")
    mvn clean package -DskipTests
    Pop-Location
    $jarPath = Join-Path $scriptDir "windows-agent\target\windows-agent-1.0.0.jar"
}

if (-not (Test-Path $jarPath)) {
    Write-Host "[!] ERROR: windows-agent.jar not found. Please run 'mvn clean package' in windows-agent/" -ForegroundColor Red
    exit 1
}

# Locate Java 21 (Prioritize real JDK 21 over broken PATH stubs)
$javaCmd = $null
$searchPaths = @(
    "C:\Program Files\Eclipse Adoptium\jdk-21*\bin\java.exe",
    "$env:USERPROFILE\.jdks\openjdk-21*\bin\java.exe",
    "$env:JAVA_HOME\bin\java.exe",
    "C:\Program Files\Java\jdk-21*\bin\java.exe",
    "C:\Program Files\Microsoft\jdk-21*\bin\java.exe",
    "C:\Program Files\Amazon Corretto\jdk21*\bin\java.exe"
)

foreach ($pathPattern in $searchPaths) {
    $resolved = Get-Item -Path $pathPattern -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($resolved -and (Test-Path $resolved.FullName)) {
        $javaCmd = $resolved.FullName
        break
    }
}

if (-not $javaCmd) {
    $cmdObj = Get-Command java.exe -ErrorAction SilentlyContinue
    if ($cmdObj) { $javaCmd = $cmdObj.Source }
}

if (-not $javaCmd) { $javaCmd = "java" }

# Set Environment Variables
$env:ASTRA_BACKEND_URL = $BackendUrl
$env:ASTRA_HOSTNAME = $Hostname
if (-not [string]::IsNullOrWhiteSpace($AgentToken)) {
    $env:ASTRA_AGENT_TOKEN = $AgentToken
}

Write-Host "[+] Starting ASTRA Agent using $javaCmd..." -ForegroundColor Cyan
Write-Host "    JAR: $jarPath" -ForegroundColor DarkGray
Write-Host ""

& $javaCmd "-Djava.awt.headless=false" "-Dastra.backend.url=$BackendUrl" "-jar" "$jarPath"
