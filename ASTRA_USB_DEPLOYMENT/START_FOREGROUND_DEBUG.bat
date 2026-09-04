@echo off
cd /d "%~dp0"
title ASTRA EDR - Live Agent Console (Debug Mode)

echo ====================================================================
echo             ASTRA EDR AGENT - LIVE DEBUG CONSOLE
echo ====================================================================
echo.
echo Starting ASTRA EDR Agent in foreground...
echo You will see registration and heartbeat logs in real-time.
echo (Keep this window open during testing, or run INSTALL_ASTRA.bat for 24/7 silent service)
echo.

set "DEFAULT_BACKEND=http://192.168.1.46:8080"
set /p "USER_BACKEND=Backend URL [default: %DEFAULT_BACKEND%]: "

if "%USER_BACKEND%"=="" (
    set "BACKEND_URL=%DEFAULT_BACKEND%"
) else (
    set "BACKEND_URL=%USER_BACKEND%"
)

echo.
echo Connecting to: %BACKEND_URL%
echo.

java -Djava.awt.headless=false -jar "%~dp0windows-agent.jar" --astra.backend.url=%BACKEND_URL%
pause
