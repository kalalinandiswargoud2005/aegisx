@echo off
:: ====================================================================
:: ASTRA EDR - Auto-Start Installer for Target Laptop
:: Sets up automatic startup on Windows boot & login (No manual commands needed)
:: ====================================================================
echo.
echo ====================================================================
echo   ASTRA EDR - TARGET LAPTOP AUTO-START SETUP
echo ====================================================================
echo.

:: Check Administrator Privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Please right-click this file and select "Run as administrator".
    echo.
    pause
    exit /b 1
)

set "AGENT_DIR=%~dp0"
set "JAR_PATH=%AGENT_DIR%target\windows-agent-1.0.0.jar"
set "VBS_PATH=%AGENT_DIR%Astra-UI.vbs"

if not exist "%JAR_PATH%" (
    echo [BUILDING] Compiling windows-agent-1.0.0.jar first...
    cd /d "%AGENT_DIR%"
    call mvn package -DskipTests
)

:: Create directories
if not exist "C:\Astra\Agent" mkdir "C:\Astra\Agent"
if not exist "C:\Astra\Demo" mkdir "C:\Astra\Demo"
if not exist "C:\ProgramData\Astra\Agent\logs" mkdir "C:\ProgramData\Astra\Agent\logs"

:: Copy files to C:\Astra\Agent
echo [1/3] Deploying agent binaries to C:\Astra\Agent...
copy /Y "%AGENT_DIR%target\windows-agent-1.0.0.jar" "C:\Astra\Agent\windows-agent.jar" >nul
copy /Y "%AGENT_DIR%Astra-UI.vbs" "C:\Astra\Agent\Astra-UI.vbs" >nul

:: Configure Windows Startup Registry for User Session UI
echo [2/3] Registering ASTRA Interactive UI Companion in Windows Startup...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v "ASTRA_EDR_UI" /t REG_SZ /d "wscript.exe \"C:\Astra\Agent\Astra-UI.vbs\"" /f >nul

:: Create Windows Scheduled Task to run agent on system boot with SYSTEM privileges
echo [3/3] Registering ASTRA Background Service Task (Auto-start on boot)...
schtasks /create /tn "AstraEDRAgent" /tr "javaw.exe -Djava.awt.headless=true -Xmx512m -jar \"C:\Astra\Agent\windows-agent.jar\"" /sc onstart /ru "SYSTEM" /f >nul

:: Start background agent now
echo.
echo [STARTING] Starting ASTRA Agent and UI Companion now...
start "" javaw.exe -Djava.awt.headless=true -Xmx512m -jar "C:\Astra\Agent\windows-agent.jar"
timeout /t 2 >nul
start "" wscript.exe "C:\Astra\Agent\Astra-UI.vbs"

echo.
echo ====================================================================
echo   SUCCESS! ASTRA EDR IS NOW CONFIGURED FOR 100%% AUTO-START!
echo ====================================================================
echo.
echo - Every time you turn ON / reboot your laptop, ASTRA starts automatically.
echo - NO manual commands or PowerShell windows are required.
echo - The threat detection and desktop visual HUD are active.
echo.
pause
