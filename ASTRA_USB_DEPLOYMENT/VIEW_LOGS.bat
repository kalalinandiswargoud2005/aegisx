@echo off
title ASTRA EDR - View Agent Logs
echo ====================================================================
echo                   ASTRA EDR AGENT REAL-TIME LOGS
echo ====================================================================
echo.

if exist "C:\ProgramData\Astra\Agent\logs\agent.log" (
    echo [OK] Found agent log file at C:\ProgramData\Astra\Agent\logs\agent.log
    echo.
    echo --- LAST 30 LINES OF AGENT LOG ---
    powershell -Command "Get-Content 'C:\ProgramData\Astra\Agent\logs\agent.log' -Tail 30"
    echo.
) else (
    echo [NOTICE] Log file not found yet. The agent may not have started yet.
)

echo.
echo ====================================================================
pause
