@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title ASTRA EDR - Silent Background Runner

set "BACKEND_URL=http://192.168.1.46:8080"

echo ====================================================================
echo                 ASTRA EDR - SILENT BACKGROUND LAUNCHER
echo ====================================================================
echo.
echo Launching agent via javaw (runs 24/7 without keeping any CMD window open)...

taskkill /F /IM javaw.exe >nul 2>&1
timeout /t 1 >nul

start "" javaw.exe -Djava.awt.headless=false -Xmx512m -jar "%~dp0windows-agent.jar" --astra.backend.url=%BACKEND_URL%

echo.
echo [SUCCESS] ASTRA Agent is now running in the background!
echo [INFO] You can safely close this window now.
echo [INFO] Check your SOC Web Dashboard (/devices) - the laptop will be ONLINE.
echo.
timeout /t 3
exit
