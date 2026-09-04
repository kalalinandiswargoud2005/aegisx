@echo off
cd /d "%~dp0"
title ASTRA EDR - Connection Diagnostic Tool

echo ====================================================================
echo              ASTRA EDR - SOC CONNECTION DIAGNOSTIC
echo ====================================================================
echo.

set "BACKEND_IP=192.168.1.46"

echo [1/3] Testing Wi-Fi Ping to SOC Host Laptop (%BACKEND_IP%)...
ping -n 2 %BACKEND_IP% >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Target laptop can reach %BACKEND_IP% on the local network!
) else (
    echo [FAIL] Target laptop CANNOT ping %BACKEND_IP%.
    echo Please make sure both laptops are connected to the SAME Wi-Fi network.
)
echo.

echo [2/3] Testing ASTRA Backend API (http://%BACKEND_IP%:8080/api/v1/agent/status)...
powershell -Command "try { $r = Invoke-RestMethod -Uri 'http://%BACKEND_IP%:8080/api/v1/agent/register' -Method Post -Body '{\"hostname\":\"DiagnosticTest\"}' -ContentType 'application/json' -TimeoutSec 5; Write-Host '[OK] Successfully reached ASTRA Backend API!' -ForegroundColor Green } catch { Write-Host '[FAIL] Could not reach backend API on port 8080. Error: ' $_.Exception.Message -ForegroundColor Red }"

echo.
echo [3/3] Checking if Agent is currently running locally...
tasklist /FI "IMAGENAME eq javaw.exe" 2>NUL | find /I /N "javaw.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] ASTRA Agent background process (javaw.exe) is RUNNING.
) else (
    echo [WARN] ASTRA Agent is not running. Run INSTALL_ASTRA.bat to start it.
)

echo.
echo ====================================================================
pause
