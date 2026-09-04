@echo off
TITLE Astra EDR Agent — Enterprise Windows Service Uninstaller
COLOR 0C
cls

echo ===================================================
echo     ASTRA EDR AGENT — SERVICE UNINSTALLATION
echo ===================================================
echo.

:: 1. Check for Administrative Privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] ERROR: Administrative privileges required.
    echo Please right-click this script and select "Run as Administrator".
    echo.
    pause
    exit /b 1
)

echo [+] Administrative rights verified.
echo.

:: 2. Execute PowerShell Uninstaller with ExecutionPolicy Bypass
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Uninstall-Astra.ps1"

if %errorLevel% neq 0 (
    echo.
    echo [!] Uninstallation encountered an error.
)

echo.
pause
