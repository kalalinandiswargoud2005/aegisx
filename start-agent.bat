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

echo [3/3] Launching ASTRA Windows Agent with GUI & Overlay support...
echo Configuration: agent.properties
echo.
echo -----------------------------------------------------------------------
echo Press Ctrl+C to safely terminate the agent when finished.
echo -----------------------------------------------------------------------
echo.

java -jar windows-agent.jar --spring.config.additional-location=file:agent.properties

pause
