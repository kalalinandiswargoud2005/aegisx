@echo off
setlocal enabledelayedexpansion

:: 1. Check & Auto-elevate to Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd.exe -ArgumentList '/c cd /d \"%~dp0\" && \"%~f0\"' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"
title ASTRA EDR - 1-Click USB Installer

echo ====================================================================
echo                 ASTRA EDR - 1-CLICK USB DEPLOYMENT
echo ====================================================================
echo.

:: 2. Check Java Installation
java -version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Java 21 or higher is not found in PATH on this target laptop.
    echo Please install Java 21 / OpenJDK 21 on this laptop first.
    echo.
    pause
    exit /b 1
)

echo [OK] Administrator privileges verified.
echo [OK] Java environment detected.
echo.

:: 3. Configure Backend URL
set "DEFAULT_BACKEND=http://192.168.1.46:8080"
echo --------------------------------------------------------------------
echo Enter the ASTRA SOC Server URL.
echo If your dashboard host IP is 192.168.1.46, simply press ENTER.
echo Or type your custom URL (e.g. http://192.168.1.50:8080):
echo --------------------------------------------------------------------
set /p "USER_BACKEND=Backend URL [default: %DEFAULT_BACKEND%]: "

if "%USER_BACKEND%"=="" (
    set "BACKEND_URL=%DEFAULT_BACKEND%"
) else (
    set "BACKEND_URL=%USER_BACKEND%"
)

echo.
echo [CONFIG] Setting Target Laptop to connect to: %BACKEND_URL%
echo.

:: 4. Create Standard ASTRA Directories
echo [1/4] Initializing protected directories...
if not exist "C:\Astra\Agent" mkdir "C:\Astra\Agent"
if not exist "C:\Astra\Demo" mkdir "C:\Astra\Demo"
if not exist "C:\ProgramData\Astra\agent" mkdir "C:\ProgramData\Astra\agent"
if not exist "C:\ProgramData\Astra\Agent\logs" mkdir "C:\ProgramData\Astra\Agent\logs"

:: 5. Copy Files from USB to Target Laptop
echo [2/4] Deploying ASTRA binaries to C:\Astra\Agent\...
set "USB_DIR=%~dp0"
copy /Y "%USB_DIR%windows-agent.jar" "C:\Astra\Agent\windows-agent.jar" >nul
copy /Y "%USB_DIR%Astra-UI.vbs" "C:\Astra\Agent\Astra-UI.vbs" >nul

:: Write persistent configuration file
(
  echo {
  echo   "backendUrl": "%BACKEND_URL%",
  echo   "installedAt": "%date% %time%"
  echo }
) > "C:\ProgramData\Astra\agent\device.json"

:: 6. Configure Windows Auto-Start
echo [3/4] Registering 24/7 background service and desktop UI auto-start...

:: Auto-start UI companion on user login
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v "ASTRA_EDR_UI" /t REG_SZ /d "wscript.exe \"C:\Astra\Agent\Astra-UI.vbs\"" /f >nul

:: Auto-start background agent service on Windows system boot
schtasks /create /tn "AstraEDRAgent" /tr "javaw.exe -Djava.awt.headless=true -Xmx512m -jar \"C:\Astra\Agent\windows-agent.jar\" --astra.backend.url=%BACKEND_URL%" /sc onstart /ru "SYSTEM" /f >nul

:: 7. Start Agent & Companion Now
echo [4/4] Starting ASTRA EDR agent and connecting to SOC dashboard...
taskkill /F /IM javaw.exe >nul 2>&1
timeout /t 1 >nul

start "" javaw.exe -Djava.awt.headless=true -Xmx512m -jar "C:\Astra\Agent\windows-agent.jar" --astra.backend.url=%BACKEND_URL%
timeout /t 2 >nul
start "" wscript.exe "C:\Astra\Agent\Astra-UI.vbs"

echo.
echo ====================================================================
echo          SUCCESS! ASTRA EDR IS NOW CONNECTED AND RUNNING!
echo ====================================================================
echo.
echo  - Target Laptop is now actively sending registration and heartbeats.
echo  - Look at your main laptop SOC Dashboard (/devices) - your laptop
echo    will now appear as ONLINE!
echo.
pause
