@echo off
title ASTRA Windows Agent - Autostart Setup
color 0A
echo =======================================================================
echo              ASTRA EDR AGENT - AUTO-START CONFIGURATOR
echo =======================================================================
echo.

set AGENT_DIR=%~dp0
cd /d "%AGENT_DIR%"

set JAR_PATH=%AGENT_DIR%windows-agent.jar
if not exist "%JAR_PATH%" (
    echo [ERROR] windows-agent.jar not found in %AGENT_DIR%!
    pause
    exit /b 1
)

set BACKEND_URL=%1
if "%BACKEND_URL%"=="" (
    echo Choose Backend Connection:
    echo  [1] Localhost (http://localhost:8080) - [Recommended if SOC is on this laptop]
    echo  [2] Cloud Backend (https://aegisx-backend-2k67.onrender.com)
    echo  [3] Custom LAN IP (e.g. http://192.168.1.50:8080)
    echo.
    set /p CHOICE="Enter choice [1, 2, or 3] (Default: 1): "
    if "%CHOICE%"=="2" (
        set BACKEND_URL=https://aegisx-backend-2k67.onrender.com
    ) else if "%CHOICE%"=="3" (
        set /p BACKEND_URL="Enter backend URL: "
    ) else (
        set BACKEND_URL=http://localhost:8080
    )
)

echo.
echo [*] Target Agent JAR: %JAR_PATH%
echo [*] Target Backend URL: %BACKEND_URL%
echo.

:: Create invisible VBS launcher in Startup directory
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set VBS_SCRIPT=%STARTUP_FOLDER%\AstraAgentStartup.vbs

echo [*] Creating auto-boot background service at:
echo     %VBS_SCRIPT%
echo.

(
echo Set WshShell = CreateObject^("WScript.Shell"^)
echo WshShell.CurrentDirectory = "%AGENT_DIR%"
echo WshShell.Run "javaw.exe -Djava.awt.headless=false -Dastra.backend.url=%BACKEND_URL% -jar """ & "%JAR_PATH%" & """", 0, False
) > "%VBS_SCRIPT%"

:: Also add registry Run entry for maximum persistence
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "AstraWindowsAgent" /t REG_SZ /d "wscript.exe \"%VBS_SCRIPT%\"" /f >nul 2>&1

echo =======================================================================
echo [SUCCESS] ASTRA Agent is now configured to start automatically on boot!
echo.
echo Whenever this laptop is turned on or logs into Windows, the agent will:
echo   1. Start invisibly in the background.
echo   2. Report ONLINE to your SOC dashboard automatically.
echo   3. Listen for real-time recovery playbooks and live demonstrations.
echo =======================================================================
echo.
echo Starting agent right now in background...
wscript.exe "%VBS_SCRIPT%"
echo [*] Agent started!
echo.
pause
