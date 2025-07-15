# 🚀 Quick Start Guide

## One-Command Application Startup

This guide shows you how to start the entire e-commerce platform with a single command.

### Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

### For macOS/Linux/Unix:

```bash
./start-application.sh
```

### For Windows:

```cmd
start-application.bat
```

## What the Script Does

1. **Checks Prerequisites**: Verifies Node.js and npm are installed
2. **Installs Dependencies**: Automatically installs all required packages
3. **Creates Environment File**: Sets up backend configuration
4. **Starts All Services**: Launches backend and all micro-frontends
5. **Displays Service URLs**: Shows where each service is running

## Services Started

| Service | Port | URL |
|---------|------|-----|
| Main Application | 3000 | http://localhost:3000 |
| Products Service | 3001 | http://localhost:3001 |
| Cart Service | 3002 | http://localhost:3002 |
| Users Service | 3003 | http://localhost:3003 |
| Backend API | 5000 | http://localhost:5000 |

## Database Setup (Optional)

The application will run without a database for frontend testing. For full functionality:

### Option 1: MongoDB Atlas (Recommended - Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Copy your connection string
4. Update `backend/.env` with:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
   ```

### Option 2: Local MongoDB
```bash
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Option 3: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

## Test Accounts

Once database is connected:
- **Admin**: admin@example.com / password123
- **Customer**: john@example.com / password123

## Stopping the Application

### macOS/Linux:
Press `Ctrl+C` in the terminal running the script

### Windows:
Close the command prompt windows or use Task Manager to stop Node.js processes

## Troubleshooting

### Port Already in Use
If you get port errors, kill existing processes:
```bash
# macOS/Linux
lsof -ti:3000,3001,3002,3003,5000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### npm Permission Errors
```bash
# macOS/Linux
sudo chown -R $(whoami) ~/.npm
```

### Module Not Found Errors
Delete node_modules and reinstall:
```bash
rm -rf node_modules frontend/*/node_modules backend/node_modules
npm install
```

## Manual Startup (Alternative)

If the script doesn't work, you can start services manually:

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend/shell && npm install && cd ../..
cd frontend/products && npm install && cd ../..
cd frontend/cart && npm install && cd ../..
cd frontend/users && npm install && cd ../..

# Start services (in separate terminals)
cd backend && npm run dev
cd frontend/shell && npm start
cd frontend/products && npm start
cd frontend/cart && npm start
cd frontend/users && npm start
```

## Next Steps

1. **Visit** http://localhost:3000 to see the main application
2. **Browse** the product catalog
3. **Test** the cart functionality
4. **Set up** database connection for full features
5. **Explore** individual micro-frontend services

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify all prerequisites are installed
3. Ensure no other services are using the required ports
4. Try the manual startup method as a fallback 