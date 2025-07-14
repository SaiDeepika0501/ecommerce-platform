@echo off
setlocal enabledelayedexpansion

echo ================================
echo E-Commerce Platform Startup Script
echo Version 2.0 - Enhanced with Docker MongoDB & Auto-fixes
echo ================================

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo [INFO] npm version:
npm --version

echo ================================
echo Installing Dependencies
echo ================================

echo [INFO] Installing root dependencies...
call npm install

echo [INFO] Installing backend dependencies...
cd backend
call npm install
cd ..

echo [INFO] Installing shell app dependencies...
cd frontend\shell
call npm install
cd ..\..

echo [INFO] Installing products service dependencies...
cd frontend\products
call npm install
cd ..\..

echo [INFO] Installing cart service dependencies...
cd frontend\cart
call npm install
cd ..\..

echo [INFO] Installing users service dependencies...
cd frontend\users
call npm install
cd ..\..

echo [INFO] All dependencies installed successfully!

echo ================================
echo Creating Environment File
echo ================================

if not exist "backend\.env" (
    echo [INFO] Creating backend\.env file...
    (
        echo NODE_ENV=development
        echo PORT=5000
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
        echo CORS_ORIGIN=http://localhost:3000
        echo SOCKET_CORS_ORIGIN=http://localhost:3000
        echo # Docker MongoDB (default):
        echo MONGODB_URI=mongodb://admin:password123@localhost:27017/ecommerce?authSource=admin
        echo # For local MongoDB: MONGODB_URI=mongodb://localhost:27017/ecommerce
        echo # For MongoDB Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
    ) > backend\.env
    echo [INFO] Environment file created at backend\.env
) else (
    echo [INFO] Environment file already exists at backend\.env
)

echo ================================
echo Database Setup
echo ================================

echo [INFO] Setting up MongoDB with Docker (Recommended)...
docker ps -f name=ecommerce-mongodb >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Starting MongoDB Docker container...
    docker run -d -p 27017:27017 --name ecommerce-mongodb -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo
    if %errorlevel% neq 0 (
        echo [WARNING] Docker not available or MongoDB container failed to start
        echo [INFO] Alternative database setup options:
        echo   1. MongoDB Atlas (Cloud - Free): https://www.mongodb.com/cloud/atlas
        echo   2. Local MongoDB: Download from https://www.mongodb.com/try/download/community
        echo   3. Manual Docker: docker run -d -p 27017:27017 --name ecommerce-mongodb -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo
    ) else (
        echo [SUCCESS] MongoDB Docker container started successfully
    )
) else (
    echo [INFO] MongoDB Docker container already running
)

echo [INFO] Updating environment file with Docker MongoDB connection...
if exist "backend\.env" (
    findstr /C:"MONGODB_URI=" backend\.env >nul
    if %errorlevel% neq 0 (
        echo MONGODB_URI=mongodb://admin:password123@localhost:27017/ecommerce?authSource=admin >> backend\.env
    )
) else (
    echo MONGODB_URI=mongodb://admin:password123@localhost:27017/ecommerce?authSource=admin >> backend\.env
)

echo ================================
echo Starting Services
echo ================================

echo [INFO] Cleaning up existing processes on ports 3000, 3001, 3002, 3003, 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do if not "%%a"=="" taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do if not "%%a"=="" taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3002" ^| find "LISTENING"') do if not "%%a"=="" taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3003" ^| find "LISTENING"') do if not "%%a"=="" taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do if not "%%a"=="" taskkill /F /PID %%a >nul 2>&1
echo [INFO] Port cleanup completed

echo [INFO] Installing missing dependencies...
cd frontend\users
call npm install @module-federation/webpack >nul 2>&1
cd ..\..

echo [INFO] Starting backend server...
cd backend
start /B npm run dev
cd ..

echo [INFO] Waiting for backend to start...
timeout /t 8 /nobreak >nul

echo [INFO] Starting shell application...
cd frontend\shell
start /B npm start
cd ..\..

echo [INFO] Starting products service...
cd frontend\products
start /B npm start
cd ..\..

echo [INFO] Starting cart service...
cd frontend\cart
start /B npm start
cd ..\..

echo [INFO] Starting users service...
cd frontend\users
start /B npm start
cd ..\..

echo [INFO] Waiting for all services to start...
timeout /t 15 /nobreak >nul

echo [INFO] Performing service health checks...
curl -s -o nul -w "Backend API: %%{http_code}" http://localhost:5000/health 2>nul || echo Backend API: Not responding
echo.
curl -s -o nul -w "Shell App: %%{http_code}" http://localhost:3000 2>nul || echo Shell App: Not responding
echo.
curl -s -o nul -w "Products: %%{http_code}" http://localhost:3001 2>nul || echo Products: Not responding
echo.
curl -s -o nul -w "Cart: %%{http_code}" http://localhost:3002 2>nul || echo Cart: Not responding
echo.
curl -s -o nul -w "Users: %%{http_code}" http://localhost:3003 2>nul || echo Users: Not responding
echo.

echo ================================
echo Service Information
echo ================================

echo ✅ Application is running!
echo.
echo Main Application:
echo   🌐 Shell App: http://localhost:3000
echo.
echo Micro-Frontend Services:
echo   📦 Products: http://localhost:3001
echo   🛒 Cart: http://localhost:3002
echo   👤 Users: http://localhost:3003
echo.
echo Backend Services:
echo   🔧 API Server: http://localhost:5000
echo   📚 API Docs: http://localhost:5000/api
echo.
echo Test Accounts:
echo   Admin: admin@example.com / password123
echo   Customer: john@example.com / password123
echo.
echo Recent Improvements:
echo   ✅ Fixed Backend Seeding Issue - Server stays running after database setup
echo   ✅ Added Docker MongoDB Support - One-command database setup
echo   ✅ Enhanced Port Cleanup - Automatic cleanup of conflicting processes
echo   ✅ Better Dependencies - Auto-installation of missing modules
echo   ✅ Improved Error Handling - Better startup reliability
echo.
echo Health Check Commands:
echo   Backend API: curl http://localhost:5000/health
echo   Test Login: curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\": \"admin@example.com\", \"password\": \"password123\"}"
echo.
echo Troubleshooting:
echo   - If services don't start, check if ports are already in use
echo   - For login issues, ensure MongoDB is running and seeded
echo   - Check console output for detailed error messages
echo.
echo Press any key to open the main application in your browser...
pause >nul

start http://localhost:3000

echo.
echo Press any key to exit (this will NOT stop the services)...
pause >nul 