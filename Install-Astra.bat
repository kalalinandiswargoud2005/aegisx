@echo off
TITLE Astra EDR Agent — Enterprise Windows Service Installer
COLOR 0A
cls

echo ===================================================
echo     ASTRA EDR AGENT — WINDOWS SERVICE INSTALLER
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

:: 2. Execute PowerShell Installer with ExecutionPolicy Bypass
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install-Astra.ps1" %*

if %errorLevel% neq 0 (
    echo.
    echo [!] Installation encountered an error. Please check the logs.
)

echo.
pause
