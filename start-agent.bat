@echo off
title ASTRA Windows EDR Endpoint Agent
color 0A
echo =======================================================================
echo                 ASTRA EDR AGENT - RUNTIME LAUNCHER
echo =======================================================================
echo.
cd /d "%~dp0"

echo [1/3] Checking Java runtime environment...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in PATH. Please install Java 17+.
    pause
    exit /b 1
)

echo [2/3] Verifying agent files...
if not exist "windows-agent.jar" (
    echo [ERROR] windows-agent.jar not found in %CD%!
    pause
    exit /b 1
)

set BACKEND_URL=%1
if "%BACKEND_URL%"=="" set BACKEND_URL=https://aegisx-backend-2k67.onrender.com

echo [*] Releasing port 8082 (terminating any previous agent instance)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8082 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [3/3] Launching ASTRA Windows Agent connecting to: %BACKEND_URL%
echo.
echo -----------------------------------------------------------------------
echo Press Ctrl+C to safely terminate the agent when finished.
echo -----------------------------------------------------------------------
echo.

java -Djava.awt.headless=false -Dastra.backend.url=%BACKEND_URL% -jar windows-agent.jar

pause
