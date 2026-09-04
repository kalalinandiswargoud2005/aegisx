@echo off
title ASTRA Windows Agent - Autostart Removal
color 0C
echo =======================================================================
echo              ASTRA EDR AGENT - AUTO-START REMOVER
echo =======================================================================
echo.

set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set VBS_SCRIPT=%STARTUP_FOLDER%\AstraAgentStartup.vbs

if exist "%VBS_SCRIPT%" (
    del /f /q "%VBS_SCRIPT%"
    echo [*] Removed startup script from %VBS_SCRIPT%
)

reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "AstraWindowsAgent" /f >nul 2>&1
echo [*] Removed registry startup entry.

echo.
echo [SUCCESS] Auto-start configuration removed.
pause
