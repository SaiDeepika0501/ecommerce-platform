@echo off
setlocal enabledelayedexpansion
title E-Commerce Platform - Stop All Services

:: Color codes for output
set "GREEN=[32m"
set "RED=[31m"
set "YELLOW=[33m"
set "BLUE=[34m"
set "CYAN=[36m"
set "RESET=[0m"

echo.
echo %RED%======================================================================%RESET%
echo %RED%          🛑 E-Commerce Platform - Stopping All Services              %RESET%
echo %RED%======================================================================%RESET%
echo.

:: Function to stop processes on specific port
:stop_port
set "PORT=%1"
echo %YELLOW%Stopping services on port %PORT%...%RESET%

for /f "tokens=5" %%a in ('netstat -ano ^| find ":%PORT% "') do (
    if "%%a" neq "" (
        echo Killing process %%a on port %PORT%
        taskkill /f /pid %%a >nul 2>&1
    )
)
goto :eof

:: Stop all application ports
echo %BLUE%🧹 Stopping all E-Commerce Platform services...%RESET%
call :stop_port 3000
call :stop_port 3001
call :stop_port 3002
call :stop_port 3003
call :stop_port 3004
call :stop_port 3005
call :stop_port 5000

:: Kill Node.js processes related to our application
echo %YELLOW%Stopping Node.js processes...%RESET%
wmic process where "name='node.exe' and commandline like '%%ecommerce%%'" delete >nul 2>&1
wmic process where "name='node.exe' and commandline like '%%server.js%%'" delete >nul 2>&1
wmic process where "name='node.exe' and commandline like '%%webpack%%'" delete >nul 2>&1
wmic process where "name='node.exe' and commandline like '%%http-server%%'" delete >nul 2>&1

:: Wait a moment for processes to terminate
timeout /t 3 >nul

:: Verify ports are free
echo.
echo %BLUE%🔍 Verifying ports are free...%RESET%
set "ALL_STOPPED=1"
for %%p in (3000 3001 3002 3003 3004 3005 5000) do (
    netstat -an | find ":%%p " >nul
    if not errorlevel 1 (
        echo %YELLOW%⚠️  Port %%p still in use%RESET%
        set "ALL_STOPPED=0"
    ) else (
        echo %GREEN%✅ Port %%p is free%RESET%
    )
)

if !ALL_STOPPED! equ 1 (
    echo.
    echo %GREEN%✅ All services stopped successfully%RESET%
) else (
    echo.
    echo %YELLOW%⚠️  Some services may still be running. You might need to restart your computer or manually kill remaining processes.%RESET%
)

echo.
echo %CYAN%📋 Log files are preserved in the logs/ directory%RESET%
echo %CYAN%💡 To start the application again, run: start-application.bat%RESET%
echo.

pause 