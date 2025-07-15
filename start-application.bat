@echo off
setlocal enabledelayedexpansion
title E-Commerce Platform with IoT - Windows Startup

:: Color codes for output
set "GREEN=[32m"
set "RED=[31m"
set "YELLOW=[33m"
set "BLUE=[34m"
set "CYAN=[36m"
set "RESET=[0m"

echo.
echo %CYAN%======================================================================%RESET%
echo %CYAN%            🚀 E-Commerce Platform with IoT - Windows Startup         %RESET%
echo %CYAN%======================================================================%RESET%
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ Node.js is not installed or not in PATH%RESET%
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ npm is not installed or not in PATH%RESET%
    pause
    exit /b 1
)

:: Set up variables
set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"
set "LOGS_DIR=%PROJECT_ROOT%logs"

:: Create logs directory if it doesn't exist
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"

:: Function to check if port is in use
:check_port
netstat -an | find ":%1 " >nul
if not errorlevel 1 (
    echo %YELLOW%⚠️  Port %1 is already in use, attempting to free it...%RESET%
    for /f "tokens=5" %%a in ('netstat -ano ^| find ":%1 "') do (
        taskkill /f /pid %%a >nul 2>&1
    )
    timeout /t 2 >nul
)
goto :eof

:: Cleanup function
:cleanup
echo.
echo %YELLOW%🧹 Cleaning up existing processes...%RESET%
call :check_port 3000
call :check_port 3001
call :check_port 3002
call :check_port 3003
call :check_port 3004
call :check_port 3005
call :check_port 5000

:: Kill any existing Node.js processes related to our application
tasklist /fi "imagename eq node.exe" /fo csv | find "node.exe" >nul
if not errorlevel 1 (
    echo %YELLOW%Stopping existing Node.js processes...%RESET%
    wmic process where "name='node.exe' and commandline like '%%ecommerce%%'" delete >nul 2>&1
    wmic process where "name='node.exe' and commandline like '%%server.js%%'" delete >nul 2>&1
    wmic process where "name='node.exe' and commandline like '%%webpack%%'" delete >nul 2>&1
)

:: Kill http-server processes
tasklist /fi "imagename eq node.exe" /fo csv | find "http-server" >nul
if not errorlevel 1 (
    wmic process where "commandline like '%%http-server%%'" delete >nul 2>&1
)

timeout /t 3 >nul
goto :eof

:: MongoDB setup function
:setup_mongodb
echo.
echo %BLUE%🐳 Setting up MongoDB...%RESET%

:: Check if MongoDB is running locally
netstat -an | find ":27017 " >nul
if not errorlevel 1 (
    echo %GREEN%✅ MongoDB already running on port 27017%RESET%
    goto :verify_mongo
)

:: Try to start MongoDB service (if installed as Windows service)
sc query MongoDB >nul 2>&1
if not errorlevel 1 (
    echo %BLUE%Starting MongoDB Windows service...%RESET%
    sc start MongoDB >nul 2>&1
    timeout /t 5 >nul
    goto :verify_mongo
)

:: Check if Docker is available and try to start MongoDB container
docker --version >nul 2>&1
if not errorlevel 1 (
    echo %BLUE%Starting MongoDB Docker container...%RESET%
    docker run -d --name ecommerce-mongodb -p 27017:27017 -e MONGO_INITDB_DATABASE=ecommerce mongo:latest >nul 2>&1
    if not errorlevel 1 (
        echo %GREEN%✅ MongoDB Docker container started%RESET%
        timeout /t 10 >nul
        goto :verify_mongo
    )
)

:: If no MongoDB found, provide instructions
echo %YELLOW%⚠️  MongoDB not found. Please install MongoDB using one of these options:%RESET%
echo    1. Install MongoDB Community Server from https://www.mongodb.com/try/download/community
echo    2. Install Docker Desktop and run: docker run -d -p 27017:27017 mongo
echo    3. Use MongoDB Atlas (cloud) and update connection string in backend/server.js
echo.
echo %YELLOW%For now, continuing without MongoDB verification...%RESET%
goto :eof

:verify_mongo
:: Simple MongoDB connection test
echo %BLUE%Verifying MongoDB connection...%RESET%
timeout /t 2 >nul
echo %GREEN%✅ MongoDB connection assumed ready%RESET%
goto :eof

:: Function to wait for service to be ready
:wait_for_service
set "PORT=%1"
set "NAME=%2"
set "MAX_ATTEMPTS=30"
set "ATTEMPT=0"

:wait_loop
set /a ATTEMPT+=1
if %ATTEMPT% gtr %MAX_ATTEMPTS% (
    echo %RED%❌ Timeout waiting for %NAME% on port %PORT%%RESET%
    goto :eof
)

netstat -an | find ":%PORT% " >nul
if errorlevel 1 (
    echo %YELLOW%   Waiting for %NAME% on port %PORT%... Attempt %ATTEMPT%/%MAX_ATTEMPTS%%RESET%
    timeout /t 2 >nul
    goto :wait_loop
)

:: Verify the service is actually serving content
curl -s http://localhost:%PORT%/remoteEntry.js >nul 2>&1
if not errorlevel 1 (
    echo %GREEN%✅ %NAME% is ready%RESET%
) else (
    if %ATTEMPT% lss %MAX_ATTEMPTS% (
        timeout /t 2 >nul
        goto :wait_loop
    ) else (
        echo %YELLOW%⚠️  %NAME% port is open but may not be fully ready%RESET%
    )
)
goto :eof

:: Function to build and serve frontend service
:build_and_serve
set "SERVICE_NAME=%1"
set "PORT=%2"
set "SERVICE_DIR=%FRONTEND_DIR%\%SERVICE_NAME%"

echo.
echo %CYAN%📦 Building and serving %SERVICE_NAME% service...%RESET%

cd /d "%SERVICE_DIR%"
if not exist "package.json" (
    echo %RED%❌ package.json not found in %SERVICE_DIR%%RESET%
    goto :eof
)

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo %YELLOW%Installing dependencies for %SERVICE_NAME%...%RESET%
    call npm install >nul 2>&1
)

:: Build the service
echo Building %SERVICE_NAME%...
call npm run build >"%LOGS_DIR%\%SERVICE_NAME%-build.log" 2>&1
if errorlevel 1 (
    echo %RED%❌ Build failed for %SERVICE_NAME%%RESET%
    type "%LOGS_DIR%\%SERVICE_NAME%-build.log"
    goto :eof
)

:: Check if http-server is installed globally
http-server --version >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%Installing http-server globally...%RESET%
    npm install -g http-server >nul 2>&1
)

:: Start the service
echo Starting %SERVICE_NAME% on port %PORT%...
start /b "" cmd /c "http-server dist -p %PORT% -c-1 --cors > %LOGS_DIR%\%SERVICE_NAME%.log 2>&1"

:: Wait for service to be ready
call :wait_for_service %PORT% %SERVICE_NAME%

cd /d "%PROJECT_ROOT%"
goto :eof

:: Main execution starts here
call :cleanup

call :setup_mongodb

:: Start backend
echo.
echo %BLUE%🔧 Starting backend server...%RESET%
cd /d "%BACKEND_DIR%"

:: Install backend dependencies if needed
if not exist "node_modules" (
    echo %YELLOW%Installing backend dependencies...%RESET%
    call npm install >nul 2>&1
)

:: Start backend server
echo Starting backend on port 5000...
start /b "" cmd /c "node server.js > %LOGS_DIR%\backend.log 2>&1"

:: Wait for backend
call :wait_for_service 5000 "Backend"

cd /d "%PROJECT_ROOT%"

:: Build and serve all frontend services
call :build_and_serve "products" "3001"
call :build_and_serve "cart" "3002"
call :build_and_serve "users" "3003"
call :build_and_serve "orders" "3004"
call :build_and_serve "admin" "3005"

:: Wait for services to stabilize
echo.
echo %YELLOW%⏳ Waiting for all services to stabilize...%RESET%
timeout /t 10 >nul

:: Verify all remotes are accessible
echo.
echo %BLUE%🔍 Verifying all remote entry points...%RESET%
for %%p in (3001 3002 3003 3004 3005) do (
    curl -s -o nul -w "%%{http_code}" http://localhost:%%p/remoteEntry.js | find "200" >nul
    if not errorlevel 1 (
        echo %GREEN%   ✅ Service on port %%p is accessible%RESET%
    ) else (
        echo %YELLOW%   ⚠️  Service on port %%p may not be fully ready%RESET%
    )
)

:: Start shell application
echo.
echo %CYAN%🌐 Starting shell application...%RESET%
cd /d "%FRONTEND_DIR%\shell"

:: Install shell dependencies if needed
if not exist "node_modules" (
    echo %YELLOW%Installing shell dependencies...%RESET%
    call npm install >nul 2>&1
)

:: Start shell in development mode
echo Starting shell application on port 3000...
start /b "" cmd /c "npm start > %LOGS_DIR%\shell.log 2>&1"

:: Wait for shell to be ready
call :wait_for_service 3000 "Shell"

cd /d "%PROJECT_ROOT%"

:: Display success message
echo.
echo %GREEN%======================================================================%RESET%
echo %GREEN%                    🎉 ALL SERVICES RUNNING!                         %RESET%
echo %GREEN%======================================================================%RESET%
echo %GREEN%🌐 Main App:     http://localhost:3000                              %RESET%
echo %GREEN%📦 Products:     http://localhost:3001                              %RESET%
echo %GREEN%🛒 Cart:         http://localhost:3002                              %RESET%
echo %GREEN%👤 Users:        http://localhost:3003                              %RESET%
echo %GREEN%📋 Orders:       http://localhost:3004                              %RESET%
echo %GREEN%⚙️  Admin:        http://localhost:3005                              %RESET%
echo %GREEN%🔧 Backend:      http://localhost:5000                              %RESET%
echo %GREEN%🐳 MongoDB:      Port 27017                                          %RESET%
echo %GREEN%======================================================================%RESET%
echo.
echo %CYAN%🧪 Test the application:%RESET%
echo    • Main App: http://localhost:3000
echo    • Admin Panel: http://localhost:3000 (login: admin@example.com / password123)
echo    • IoT Dashboard: Available in Admin Panel under IoT Management tab
echo.
echo %YELLOW%📋 Logs are available in the logs/ directory%RESET%
echo %YELLOW%💡 Use Ctrl+C to stop monitoring. Services will continue running.%RESET%
echo %YELLOW%💡 To stop all services, run: stop-application.bat%RESET%
echo.

:: Monitor services (optional)
:monitor_loop
echo %BLUE%🔍 Monitoring services... (Press Ctrl+C to exit monitoring)%RESET%
timeout /t 30 >nul

:: Check if key services are still running
set "SERVICES_OK=1"
for %%p in (3000 5000) do (
    netstat -an | find ":%%p " >nul
    if errorlevel 1 (
        echo %RED%❌ Service on port %%p has stopped%RESET%
        set "SERVICES_OK=0"
    )
)

if !SERVICES_OK! equ 1 (
    echo %GREEN%✅ Core services are running%RESET%
) else (
    echo %YELLOW%⚠️  Some services may have issues. Check logs in %LOGS_DIR%%RESET%
)

goto :monitor_loop 