@echo off
echo ====================================================================
echo   ASTRA EDR - UNINSTALL AUTO-START
echo ====================================================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Please right-click this file and select "Run as administrator".
    echo.
    pause
    exit /b 1
)

:: Remove registry entry
reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v "ASTRA_EDR_UI" /f >nul 2>&1

:: Remove scheduled task
schtasks /delete /tn "AstraEDRAgent" /f >nul 2>&1

:: Stop running javaw instances
taskkill /F /IM javaw.exe >nul 2>&1

echo [SUCCESS] ASTRA EDR auto-start removed.
echo.
pause
