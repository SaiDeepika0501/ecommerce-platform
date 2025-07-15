# E-Commerce Platform with IoT - Windows Setup Guide

This guide will help you set up and run the E-Commerce Platform with IoT functionality on Windows systems.

## Prerequisites

### Required Software

1. **Node.js (v16 or later)**
   - Download from: https://nodejs.org/
   - Choose the LTS version
   - Verify installation: Open Command Prompt and run `node --version`

2. **npm (comes with Node.js)**
   - Verify installation: `npm --version`

3. **MongoDB (Choose one option):**

   **Option A: MongoDB Community Server (Recommended)**
   - Download from: https://www.mongodb.com/try/download/community
   - Choose Windows x64
   - Install as a Windows Service
   - Default port: 27017

   **Option B: Docker Desktop + MongoDB Container**
   - Download Docker Desktop: https://www.docker.com/products/docker-desktop
   - After installation, run: `docker run -d --name ecommerce-mongodb -p 27017:27017 mongo`

   **Option C: MongoDB Atlas (Cloud)**
   - Sign up at: https://www.mongodb.com/atlas
   - Update connection string in `backend/server.js`

4. **Git (Optional but recommended)**
   - Download from: https://git-scm.com/download/win

### Optional Tools

- **Windows Terminal** (Better command line experience)
- **Visual Studio Code** (Code editor)
- **Postman** (API testing)

## Installation Steps

### 1. Download/Clone the Project

If you have Git:
```bash
git clone <repository-url>
cd ecommerce-platform
```

Or download and extract the ZIP file.

### 2. Install Global Dependencies

Open Command Prompt or PowerShell as Administrator and run:
```bash
npm install -g http-server
```

### 3. Verify Prerequisites

Run the following commands to ensure everything is installed:
```bash
node --version     # Should show v16+ 
npm --version      # Should show a version number
```

For MongoDB:
```bash
# If using local MongoDB
mongo --version

# If using Docker
docker --version
```

## Running the Application

### Method 1: PowerShell Script (Recommended)

1. **Open PowerShell as Administrator**
2. **Navigate to project directory**
3. **Run the startup script:**
   ```powershell
   .\start-application.ps1
   ```

### Method 2: Batch Script

1. **Open Command Prompt as Administrator**
2. **Navigate to project directory**  
3. **Run the startup script:**
   ```cmd
   start-application.bat
   ```

### Method 3: Manual Setup (if scripts don't work)

1. **Start MongoDB** (if not running as service)
2. **Start Backend:**
   ```bash
   cd backend
   npm install
   node server.js
   ```

3. **Build and Start Frontend Services** (in separate terminals):
   ```bash
   # Products Service
   cd frontend/products
   npm install
   npm run build
   npx http-server dist -p 3001 -c-1 --cors

   # Cart Service  
   cd frontend/cart
   npm install
   npm run build
   npx http-server dist -p 3002 -c-1 --cors

   # Users Service
   cd frontend/users
   npm install  
   npm run build
   npx http-server dist -p 3003 -c-1 --cors

   # Orders Service
   cd frontend/orders
   npm install
   npm run build  
   npx http-server dist -p 3004 -c-1 --cors

   # Admin Service
   cd frontend/admin
   npm install
   npm run build
   npx http-server dist -p 3005 -c-1 --cors
   ```

4. **Start Shell Application:**
   ```bash
   cd frontend/shell
   npm install
   npm start
   ```

## Accessing the Application

Once all services are running, access:

- **Main Application:** http://localhost:3000
- **Admin Panel:** http://localhost:3000 (login: admin@example.com / password123)
- **Individual Services:**
  - Products: http://localhost:3001
  - Cart: http://localhost:3002  
  - Users: http://localhost:3003
  - Orders: http://localhost:3004
  - Admin: http://localhost:3005
- **Backend API:** http://localhost:5000

## IoT Features

The platform includes comprehensive IoT functionality:

### IoT Dashboard Access
1. Login to admin panel (admin@example.com / password123)
2. Navigate to "IoT Management" tab
3. Explore:
   - **Overview:** System statistics and alerts
   - **Devices:** Manage IoT devices (sensors, RFID readers, etc.)
   - **Alerts:** Monitor threshold-based notifications
   - **Live Data:** Real-time sensor readings

### IoT Device Types
- Temperature Sensors
- Humidity Sensors  
- RFID Readers
- Smart Weight Scales
- Motion Detectors
- Camera Systems
- Barcode Scanners

### IoT Simulation
Use the simulation controls in the IoT Dashboard to:
- Generate sample sensor data
- Test RFID scanning
- Simulate inventory updates via weight sensors
- Test alert systems

## Stopping the Application

### Using Scripts
```powershell
# PowerShell
.\stop-application.ps1

# Command Prompt
stop-application.bat
```

### Manual Method
1. Press `Ctrl+C` in each terminal window
2. Or close all Command Prompt/PowerShell windows
3. Check Task Manager for any remaining Node.js processes

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3000
```
- **Solution:** Run the stop script first, or manually kill processes using Task Manager

**2. PowerShell Execution Policy Error**
```
cannot be loaded because running scripts is disabled on this system
```
- **Solution:** Run PowerShell as Administrator and execute:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

**3. Module Federation Errors**
- **Solution:** Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Ensure all services are running

**4. MongoDB Connection Failed**
- **Solution:** 
  - Check if MongoDB service is running: `sc query MongoDB`
  - Start MongoDB service: `sc start MongoDB`
  - Or use Docker: `docker start ecommerce-mongodb`

**5. Build Failures**
- **Solution:**
  - Delete `node_modules` folders: `rmdir /s node_modules`
  - Clear npm cache: `npm cache clean --force`
  - Reinstall dependencies: `npm install`

### Log Files

Check logs in the `logs/` directory:
- `backend.log` - Backend server logs
- `products.log` - Products service logs
- `cart.log` - Cart service logs
- `users.log` - Users service logs
- `orders.log` - Orders service logs
- `admin.log` - Admin service logs
- `shell.log` - Shell application logs

### Performance Tips

1. **Close unnecessary applications** to free up memory
2. **Use Windows Terminal** for better performance
3. **Disable Windows Defender** real-time scanning for project folder (temporarily)
4. **Use SSD storage** for better Node.js performance

### Network Issues

If you can't access the application:
1. Check Windows Firewall settings
2. Ensure ports 3000-3005 and 5000 are not blocked
3. Try accessing via `127.0.0.1` instead of `localhost`

## Development Notes

### Architecture
- **Microservices:** Each frontend service runs independently
- **Module Federation:** Services share React components
- **Real-time Communication:** Socket.IO for IoT data
- **Database:** MongoDB for data persistence

### Default Users
- **Admin:** admin@example.com / password123
- **Customer:** john@example.com / password123

### Sample Data
The application auto-seeds with:
- 5 sample products
- IoT devices (temperature, humidity, RFID, weight, motion sensors)
- Sample IoT readings and alerts

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review log files in `logs/` directory
3. Ensure all prerequisites are properly installed
4. Try running individual services manually to isolate issues

## Security Notes

For production deployment:
1. Change default passwords
2. Use environment variables for sensitive configuration
3. Set up proper MongoDB authentication
4. Configure HTTPS and proper CORS settings
5. Update JWT secrets and API keys 