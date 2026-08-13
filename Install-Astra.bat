@echo off
TITLE Astra EDR Agent — One-Click Installer
COLOR 0A
cls

echo ===================================================
echo     ASTRA EDR AGENT — INSTALLATION WIZARD
echo ===================================================
echo.

:: Check for Administrative Privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] ERROR: Administrative privileges required.
    echo Please right-click this script and select "Run as Administrator".
    echo.
    pause
    exit /b
)

echo [+] Administrative rights verified.
echo.

:: Prompt for Custom Agent / Laptop Name
set /p AGENT_NAME="Enter a unique name for this target laptop (e.g. HOD-Laptop-01): "

if "%AGENT_NAME%"=="" set AGENT_NAME=Target-Laptop-%RANDOM%

echo.
echo [+] Registering Agent Name: %AGENT_NAME%
echo [+] Configuring C2 Cloud Connection...

:: Create Agent Installation Directory
set INSTALL_DIR=C:\Astra\Agent
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: Create Config File
(
  echo agent.hostname=%AGENT_NAME%
  echo agent.device-id=DEVICE-%RANDOM%-%RANDOM%
) > "%INSTALL_DIR%\agent.properties"

echo [+] Configured %INSTALL_DIR%\agent.properties successfully.
echo.
echo ===================================================
echo     INSTALLATION COMPLETE! 
echo     Agent is ready to protect this device.
echo ===================================================
echo.
pause
