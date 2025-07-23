# 🛒 Modular E-Commerce Platform with IoT Integration

A next-generation, scalable e-commerce platform built with **micro-frontends architecture** using React, Webpack Module Federation, Node.js, and MongoDB. Features comprehensive **IoT Management System** for real-time inventory tracking, sensor monitoring, and automated warehouse operations.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)]()
[![React](https://img.shields.io/badge/React-18-blue.svg)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-6%2B-green.svg)]()
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-orange.svg)]()

## 📋 Table of Contents

- [🏗️ Architecture](#%EF%B8%8F-architecture)
- [🚀 Features](#-features)
- [📡 IoT Management System](#-iot-management-system)
- [🛠️ Installation & Setup](#%EF%B8%8F-installation--setup)
- [📦 Technology Stack](#-technology-stack)
- [🔧 Development](#-development)
- [📊 API Documentation](#-api-documentation)
- [🔌 Real-time Features](#-real-time-features)
- [🧪 Testing & Demo](#-testing--demo)
- [🚀 Deployment](#-deployment)
- [🔧 Troubleshooting](#-troubleshooting)
- [📈 Recent Updates](#-recent-updates)

## 🏗️ Architecture

### Micro-Frontends with Module Federation

```
┌─────────────────────────────────────────────────────────────────┐
│                        Shell App (Port 3000)                    │
│                   ┌─────────────────────────────┐                │
│                   │    Module Federation Host   │                │
│                   │   ┌─────────────────────┐   │                │
│                   │   │    Shared Context   │   │                │
│                   │   │  • Auth Context     │   │                │
│                   │   │  • Cart Context     │   │                │
│                   │   │  • Socket Context   │   │                │
│                   │   └─────────────────────┘   │                │
│                   └─────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
           │              │              │              │
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Products   │ │    Cart     │ │   Users     │ │   Orders    │
    │ (Port 3001) │ │ (Port 3002) │ │ (Port 3003) │ │ (Port 3004) │
    └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
           │              │              │              │
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   Admin     │ │   Socket    │ │   Express   │ │  MongoDB    │
    │ (Port 3005) │ │  Real-time  │ │   Server    │ │  Database   │
    └─────────────┘ └─────────────┘ │ (Port 5000) │ │             │
                                    └─────────────┘ └─────────────┘
```

### Service Architecture

| Service | Port | Purpose | Technology |
|---------|------|---------|------------|
| **Shell App** | 3000 | Main application host, routing, shared state | React + Module Federation |
| **Products** | 3001 | Product catalog, search, filtering | React Micro-frontend |
| **Cart** | 3002 | Shopping cart management | React Micro-frontend |
| **Users** | 3003 | User profiles, authentication UI | React Micro-frontend |
| **Orders** | 3004 | Order management, tracking | React Micro-frontend |
| **Admin** | 3005 | Admin dashboard, IoT management | React Micro-frontend |
| **Backend** | 5000 | RESTful API, authentication, IoT endpoints | Node.js + Express |
| **MongoDB** | 27017 | Primary database | MongoDB (Docker) |

## 🚀 Features

### Core E-Commerce Features
- ✅ **Product Catalog**: Advanced search, filtering, categorization
- ✅ **Shopping Cart**: Real-time cart management with inventory validation
- ✅ **User Management**: Registration, authentication, profiles
- ✅ **Order Processing**: Complete order lifecycle management
- ✅ **Admin Dashboard**: Comprehensive admin interface
- ✅ **Real-time Updates**: Live inventory and order status updates
- ✅ **Responsive Design**: Mobile-first, modern UI/UX

### Advanced Features
- ✅ **Micro-Frontend Architecture**: Independent development and deployment
- ✅ **Module Federation**: Efficient code sharing and lazy loading
- ✅ **JWT Authentication**: Secure, stateless authentication
- ✅ **Socket.IO Integration**: Real-time communication
- ✅ **Role-based Access**: Admin/Customer role management
- ✅ **Inventory Management**: Automated stock tracking

### Security Features
- ✅ **Password Hashing**: bcrypt encryption
- ✅ **CORS Protection**: Configured cross-origin resource sharing
- ✅ **Rate Limiting**: API request throttling
- ✅ **Input Validation**: Comprehensive data validation
- ✅ **Security Headers**: Helmet.js security middleware

## 📡 IoT Management System

### Overview
Comprehensive IoT integration for warehouse automation, inventory tracking, and sensor monitoring.

```
┌─────────────────────────────────────────────────────────────────┐
│                    IoT Management Dashboard                      │
├─────────────────┬─────────────────┬─────────────────┬───────────┤
│   📊 Overview   │   🔧 Devices    │   🚨 Alerts     │ 📈 Live   │
│                 │                 │                 │   Data    │
│ • Total Devices │ • Device Status │ • Critical: 2   │ • RFID    │
│ • Online: 85%   │ • Sensors by    │ • High: 5       │ • Temp    │
│ • Alerts: 12    │   Type          │ • Medium: 3     │ • Motion  │
│ • Data Points   │ • Maintenance   │ • Low: 2        │ • Camera  │
└─────────────────┴─────────────────┴─────────────────┴───────────┘
```

### Supported IoT Devices & Sensors

| Device Type | Purpose | Data Tracked | Integration |
|-------------|---------|--------------|-------------|
| **RFID Readers** | Inventory tracking | Product scans, stock changes | Real-time inventory updates |
| **Temperature Sensors** | Environmental monitoring | Temperature, humidity | Warehouse condition alerts |
| **Weight Sensors** | Smart shelves | Product weight, quantity estimation | Automated stock calculation |
| **Motion Sensors** | Security & monitoring | Movement detection | Security alerts |
| **Barcode Scanners** | Product identification | Product scanning | Inventory verification |
| **Smart Cameras** | Visual monitoring | Image capture, analysis | Quality control |

### IoT Features

#### 📊 Real-time Dashboard
- **Live sensor data streaming** via Socket.IO
- **Device status monitoring** (online/offline/maintenance)
- **Alert management** with severity levels
- **Historical data visualization**
- **Automated report generation**

#### 🏷️ RFID Inventory Tracking
- **Automatic stock updates** when products move through RFID gates
- **Inbound/Outbound tracking** with quantity changes
- **Product identification** via RFID tags
- **Transaction history** with before/after quantities
- **Low stock alerts** triggered by RFID scans

#### 🌡️ Environmental Monitoring
- **Temperature & humidity tracking** for warehouse conditions
- **Threshold violation alerts** for sensitive products
- **Automated HVAC integration** (API ready)
- **Environmental compliance reporting**

#### ⚖️ Smart Weight Sensors
- **Real-time weight monitoring** on smart shelves
- **Automatic quantity calculation** based on unit weight
- **Stock level estimation** without manual counting
- **Discrepancy detection** between expected and actual stock

#### 🚨 Intelligent Alerting System
- **Multi-level alerts**: Critical, High, Medium, Low
- **Real-time notifications** via Socket.IO
- **Alert history tracking** with resolution status
- **Automated escalation** for critical issues
- **Integration with external notification systems**

### IoT Data Flow

```
IoT Device → Sensor Reading → API Endpoint → Database → Real-time Update → Dashboard
     │              │              │            │            │            │
  RFID Reader → Product Scan → /api/iot/rfid → MongoDB → Socket.IO → Live Update
     │              │              │            │            │            │
Temp Sensor → Temperature → /api/iot/readings → Store → Broadcast → Alert Check
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: v18+ (LTS recommended)
- **MongoDB**: v6+ (local installation or Docker)
- **Docker**: For MongoDB container (recommended)
- **Git**: For repository cloning
- **npm**: v8+ (comes with Node.js)

### 🚀 Quick Start (Recommended)

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-platform
   ```

2. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install all micro-frontend dependencies
   npm run install-all
   ```

3. **Start MongoDB (Docker - Recommended)**
   ```bash
   # Start MongoDB container
   docker run -d --name ecommerce-mongodb -p 27017:27017 mongo:latest
   ```

4. **Environment Configuration**
   Create `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CORS_ORIGIN=http://localhost:3000
   ```

5. **Seed Sample Data**
   ```bash
   npm run seed
   ```

6. **Start All Services**
   ```bash
   # Start all services with one command
   ./start-application.sh
   
   # Alternative: Manual start
   npm run start-all
   ```

7. **Access the Application**
   ```
   🌐 Main App:     http://localhost:3000
   📦 Products:     http://localhost:3001
   🛒 Cart:         http://localhost:3002
   👤 Users:        http://localhost:3003
   📋 Orders:       http://localhost:3004
   ⚙️  Admin:        http://localhost:3005
   🔧 Backend:      http://localhost:5000
   ```

### 🔧 Manual Setup (Development)

#### Backend Setup
```bash
cd backend
npm install
npm run dev  # Development mode with nodemon
```

#### Frontend Shell Setup
```bash
cd frontend/shell
npm install
npm start
```

#### Individual Micro-frontends
```bash
# Products
cd frontend/products && npm install && npm start

# Cart
cd frontend/cart && npm install && npm start

# Users
cd frontend/users && npm install && npm start

# Orders
cd frontend/orders && npm install && npm start

# Admin
cd frontend/admin && npm install && npm start
```

### 🐳 Docker Setup (Alternative)

```bash
# Start MongoDB
docker run -d --name ecommerce-mongodb -p 27017:27017 mongo:latest

# Build and run backend
docker build -t ecommerce-backend ./backend
docker run -d -p 5000:5000 --link ecommerce-mongodb:mongo ecommerce-backend

# Build and run frontend services
docker build -t ecommerce-shell ./frontend/shell
docker run -d -p 3000:3000 ecommerce-shell
```

## 📦 Technology Stack

### Frontend Stack
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18.2+ |
| **Webpack Module Federation** | Micro-frontend architecture | 5.0+ |
| **React Router** | Client-side routing | 6.0+ |
| **Socket.IO Client** | Real-time communication | 4.0+ |
| **Axios** | HTTP client | 1.0+ |
| **CSS3** | Styling with custom properties | - |

### Backend Stack
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | 18+ |
| **Express.js** | Web application framework | 4.18+ |
| **MongoDB** | Primary database | 6.0+ |
| **Mongoose** | MongoDB ODM | 7.0+ |
| **Socket.IO** | Real-time communication | 4.0+ |
| **JWT** | Authentication tokens | - |
| **bcryptjs** | Password hashing | - |
| **Helmet** | Security middleware | - |
| **Winston** | Logging | - |

### Development Tools
- **Nodemon**: Development server auto-restart
- **Webpack DevServer**: Development server for frontends
- **ESLint**: Code linting and formatting
- **Git**: Version control

## 🔧 Development

### Project Structure
```
ecommerce-platform/
├── 📁 backend/                     # Express.js API Server
│   ├── 📁 middleware/              # Express middleware
│   │   └── auth.js                 # JWT authentication middleware
│   ├── 📁 models/                  # MongoDB/Mongoose models
│   │   ├── User.js                 # User model with roles
│   │   ├── Product.js              # Product catalog model
│   │   ├── Cart.js                 # Shopping cart model
│   │   ├── Order.js                # Order management model
│   │   ├── IoTDevice.js            # IoT device registration
│   │   └── IoTReading.js           # Sensor data storage
│   ├── 📁 routes/                  # API route definitions
│   │   ├── auth.js                 # Authentication routes
│   │   ├── products.js             # Product CRUD operations
│   │   ├── cart.js                 # Cart management
│   │   ├── orders.js               # Order processing
│   │   ├── users.js                # User management
│   │   ├── inventory.js            # Inventory operations
│   │   └── iot.js                  # IoT device & sensor routes
│   ├── 📁 scripts/                 # Utility scripts
│   │   └── seed.js                 # Database seeding script
│   ├── server.js                   # Main application entry point
│   ├── package.json                # Backend dependencies
│   └── .env.example                # Environment configuration template
├── 📁 frontend/                    # Micro-frontend applications
│   ├── 📁 shell/                   # Main shell application (Host)
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/      # Shared UI components
│   │   │   │   ├── Header.js       # Navigation header
│   │   │   │   ├── Footer.js       # Application footer
│   │   │   │   └── Toast.js        # Notification system
│   │   │   ├── 📁 contexts/        # React contexts
│   │   │   │   ├── AuthContext.js  # Authentication state
│   │   │   │   ├── CartContext.js  # Cart state management
│   │   │   │   └── SocketContext.js # Real-time connection
│   │   │   ├── 📁 pages/           # Main application pages
│   │   │   │   ├── Home.js         # Landing page
│   │   │   │   ├── Login.js        # User authentication
│   │   │   │   └── Register.js     # User registration
│   │   │   ├── App.js              # Shell application root
│   │   │   ├── bootstrap.js        # Module Federation bootstrap
│   │   │   └── index.js            # Application entry point
│   │   ├── webpack.config.js       # Module Federation host config
│   │   └── package.json            # Shell dependencies
│   ├── 📁 products/                # Products micro-frontend
│   │   ├── 📁 src/
│   │   │   ├── Products.js         # Product catalog component
│   │   │   ├── bootstrap.js        # MF bootstrap
│   │   │   └── index.js            # Entry point
│   │   ├── webpack.config.js       # MF remote configuration
│   │   └── package.json            # Product service dependencies
│   ├── 📁 cart/                    # Cart micro-frontend
│   │   └── (similar structure)
│   ├── 📁 users/                   # Users micro-frontend
│   │   └── (similar structure)
│   ├── 📁 orders/                  # Orders micro-frontend
│   │   └── (similar structure)
│   └── 📁 admin/                   # Admin dashboard micro-frontend
│       ├── 📁 src/
│       │   ├── AdminDashboard.js   # Main admin interface
│       │   ├── IoTDashboard.js     # IoT management interface
│       │   ├── SensorReadingDetail.js # Detailed sensor data view
│       │   ├── InventoryManagement.js # Stock management
│       │   ├── OrderManagement.js  # Order administration
│       │   └── UserManagement.js   # User administration
│       └── package.json
├── 📁 logs/                        # Application logs (auto-generated)
├── 📄 start-application.sh         # Quick start script
├── 📄 stop-application.sh          # Application shutdown script
├── 📄 package.json                 # Root package.json with scripts
├── 📄 README.md                    # This documentation
└── 📄 IOT_MANAGEMENT_DETAILED.md   # Detailed IoT documentation
```

### Development Workflow

1. **Feature Development**
   ```bash
   # Create feature branch
   git checkout -b feature/new-feature
   
   # Start development servers
   npm run start-all
   
   # Make changes to specific micro-frontend
   cd frontend/products
   # Edit components, add features
   
   # Test changes
   npm test
   
   # Commit and push
   git add .
   git commit -m "feat: add new product feature"
   git push origin feature/new-feature
   ```

2. **Adding New Micro-frontend**
   ```bash
   # Create new service directory
   mkdir frontend/new-service
   cd frontend/new-service
   
   # Initialize with webpack config
   npm init -y
   # Copy webpack.config.js from existing service
   # Update Module Federation configuration
   
   # Add to shell app remotes
   # Update shell webpack.config.js
   ```

3. **Database Schema Changes**
   ```bash
   # Update model files in backend/models/
   # Create migration script if needed
   # Update seed data if required
   # Test with fresh database
   ```

## 📊 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "customer"  // "customer" | "admin"
}

Response:
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response: (same as register)
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer jwt-token-here

Response:
{
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Product Endpoints

#### Get Products (with filtering)
```http
GET /api/products?search=laptop&category=electronics&minPrice=100&maxPrice=2000&page=1&limit=10

Response:
{
  "products": [...],
  "totalPages": 5,
  "currentPage": 1,
  "total": 47
}
```

#### Create Product (Admin only)
```http
POST /api/products
Authorization: Bearer admin-jwt-token
Content-Type: application/json

{
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop",
  "price": 1299.99,
  "category": "Electronics",
  "inventory": {
    "quantity": 10,
    "sku": "LAPTOP-001",
    "lowStockThreshold": 5
  },
  "images": [
    {
      "url": "/images/laptop.jpg",
      "alt": "Gaming Laptop"
    }
  ],
  "specifications": {
    "CPU": "Intel i7",
    "RAM": "16GB",
    "Storage": "1TB SSD"
  },
  "tags": ["gaming", "laptop", "electronics"]
}
```

### Cart Endpoints

#### Add to Cart
```http
POST /api/cart/add
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "productId": "product-id-here",
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /api/cart/update/cart-item-id
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "quantity": 3
}
```

### Order Endpoints

#### Create Order
```http
POST /api/orders
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

### IoT Endpoints

#### Submit Sensor Reading
```http
POST /api/iot/readings
Content-Type: application/json

{
  "deviceId": "TEMP_SENSOR_001",
  "sensorType": "temperature",
  "value": 23.5,
  "unit": "°C",
  "metadata": {
    "humidity": 45.2,
    "pressure": 1013.25
  }
}
```

#### RFID Scan for Inventory
```http
POST /api/iot/rfid/scan
Content-Type: application/json

{
  "deviceId": "RFID_READER_01",
  "rfidTag": "RFID_001",
  "location": {
    "warehouse": "Main Warehouse",
    "zone": "Shipping Dock"
  },
  "action": "outbound",  // "inbound" | "outbound"
  "quantity": 5
}

Response:
{
  "success": true,
  "product": {...},
  "reading": {...},
  "inventoryUpdate": {
    "action": "outbound",
    "quantity": 5,
    "previousStock": 50,
    "newStock": 45
  }
}
```

#### Get IoT Dashboard Data
```http
GET /api/iot/dashboard
Authorization: Bearer admin-jwt-token

Response:
{
  "summary": {
    "totalDevices": 15,
    "onlineDevices": 12,
    "offlineDevices": 3,
    "activeAlerts": 7
  },
  "recentReadings": [...],
  "devicesByType": [...]
}
```

#### Get Device Readings
```http
GET /api/iot/devices/TEMP_001/readings?limit=50&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer admin-jwt-token

Response: [array of readings with metadata]
```

## 🔌 Real-time Features

### Socket.IO Events

#### Client → Server Events
```javascript
// Join admin room for IoT updates
socket.emit('join-admin');

// Join user room for order updates
socket.emit('join-user', { userId: 'user-id' });
```

#### Server → Client Events
```javascript
// IoT sensor reading update
socket.on('iot-reading', (data) => {
  console.log('New sensor reading:', data);
  // Update dashboard with new data
});

// RFID inventory scan
socket.on('rfid-scan', (data) => {
  console.log('RFID scan detected:', data);
  // Update inventory display
  // Show stock change animation
});

// Inventory update notification
socket.on('inventory-update', (data) => {
  console.log('Inventory updated:', data);
  // Update product stock levels
});

// Order status change
socket.on('order-status-update', (data) => {
  console.log('Order status changed:', data);
  // Update order tracking display
});

// Low stock alert
socket.on('low-stock-alert', (data) => {
  console.log('Low stock alert:', data);
  // Show notification to admin
});

// System alert
socket.on('system-alert', (data) => {
  console.log('System alert:', data);
  // Display alert banner
});
```

### Real-time Use Cases

1. **Inventory Management**
   - RFID scans trigger instant stock updates
   - Weight sensors update quantities automatically
   - Low stock alerts notify purchasing team

2. **Order Tracking**
   - Order status changes broadcast to customers
   - Admin receives new order notifications
   - Shipping updates sent in real-time

3. **IoT Monitoring**
   - Sensor readings stream to dashboard
   - Temperature alerts for sensitive products
   - Device offline notifications

4. **Admin Notifications**
   - Critical system alerts
   - High-priority customer issues
   - Security breach notifications

## 🧪 Testing & Demo

### Demo Credentials

#### Admin Access
```
Email: admin@example.com
Password: password123
Role: admin
Access: Full platform + IoT dashboard
```

#### Customer Access
```
Email: john@example.com
Password: password123
Role: customer
Access: Shopping features only
```

### Sample Data Overview

The seed script creates comprehensive test data:

#### Products (15 items)
- **Electronics**: Gaming Laptop, Smartphone, Wireless Headphones, Charging Pad, Smart Watch
- **Clothing**: Cotton T-Shirt, Denim Jeans
- **Home & Garden**: Smart LED Bulb, Artificial Plant
- **Sports & Fitness**: Yoga Mat, Resistance Bands
- **Accessories**: Laptop Backpack, Phone Case
- **Books**: JavaScript Programming Guide

#### IoT Devices (5 devices)
- **RFID Readers**: 2 readers for entry/exit points
- **Temperature Sensors**: 2 sensors for warehouse monitoring
- **Weight Sensor**: 1 smart shelf sensor

#### Pre-configured RFID Tags
Each product has an associated RFID tag (RFID_001 through RFID_015) for testing inventory tracking.

### Testing Scenarios

#### 1. E-Commerce Flow Test
```bash
1. Register new customer account
2. Browse products and add to cart
3. Update cart quantities
4. Proceed to checkout
5. Place order
6. Track order status
7. Admin: Process order through fulfillment
```

#### 2. IoT Integration Test
```bash
1. Login as admin
2. Navigate to IoT Dashboard
3. Click "Simulate RFID Scan"
4. Observe real-time inventory updates
5. Check sensor history details
6. Verify stock level changes
7. Test alert system with low stock
```

#### 3. Real-time Features Test
```bash
1. Open admin dashboard in one browser
2. Open customer cart in another browser
3. Admin: Update product inventory
4. Customer: See real-time stock updates
5. Admin: Process order
6. Customer: See real-time order status
```

### Performance Testing

#### Load Testing Endpoints
```bash
# Test product search performance
curl -w "%{time_total}s\n" "http://localhost:5000/api/products?search=laptop"

# Test cart operations
curl -X POST -w "%{time_total}s\n" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"product-id","quantity":1}' \
  "http://localhost:5000/api/cart/add"

# Test IoT data submission
curl -X POST -w "%{time_total}s\n" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"TEST_001","sensorType":"temperature","value":23.5,"unit":"°C"}' \
  "http://localhost:5000/api/iot/readings"
```

#### WebSocket Performance
```javascript
// Test Socket.IO connection handling
const io = require('socket.io-client');
const clients = [];

// Create 100 concurrent connections
for (let i = 0; i < 100; i++) {
  const client = io('http://localhost:5000');
  clients.push(client);
  
  client.on('connect', () => {
    console.log(`Client ${i} connected`);
  });
}
```

## 🚀 Deployment

### Production Environment Setup

#### 1. Environment Variables (Production)
```env
# Backend Production Environment
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-mongo-host:27017/ecommerce_prod
JWT_SECRET=your-super-secure-jwt-secret-change-this
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW=15  # minutes
RATE_LIMIT_MAX=100    # requests per window
LOG_LEVEL=info
```

#### 2. Docker Production Setup
```dockerfile
# Dockerfile.prod (Backend)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    restart: always
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure_password
    
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      MONGODB_URI: mongodb://admin:secure_password@mongodb:27017/ecommerce?authSource=admin
      
  frontend:
    build:
      context: ./frontend/shell
      dockerfile: Dockerfile.prod
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo_data:
```

#### 3. Nginx Configuration
```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend shell app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    # Micro-frontends
    location /products/ {
        proxy_pass http://localhost:3001;
    }
    
    location /cart/ {
        proxy_pass http://localhost:3002;
    }
    
    # ... other micro-frontends
}
```

#### 4. Process Management (PM2)
```json
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'ecommerce-backend',
      script: './backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'ecommerce-shell',
      script: 'serve',
      args: '-s frontend/shell/build -p 3000',
      env: {
        NODE_ENV: 'production'
      }
    }
    // ... other frontend services
  ]
};
```

```bash
# Deploy with PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Cloud Deployment Options

#### AWS Deployment
```bash
# Using AWS Elastic Beanstalk
eb init ecommerce-platform
eb create production
eb deploy

# Using AWS ECS with Docker
aws ecs create-cluster --cluster-name ecommerce-cluster
# Configure task definitions and services
```

#### Azure Deployment
```bash
# Using Azure Container Instances
az container create \
  --resource-group ecommerce-rg \
  --name ecommerce-app \
  --image your-registry/ecommerce:latest \
  --ports 80 443
```

#### Google Cloud Deployment
```bash
# Using Google Cloud Run
gcloud run deploy ecommerce-backend \
  --image gcr.io/project-id/ecommerce-backend \
  --platform managed \
  --region us-central1
```

### Monitoring & Logging

#### Application Monitoring
```javascript
// backend/middleware/monitoring.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// API response time monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });
  next();
});
```

#### Health Check Endpoints
```javascript
// Health check for load balancers
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});

// Detailed system check
app.get('/health/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    checks: {
      database: await checkDatabase(),
      memory: checkMemoryUsage(),
      disk: await checkDiskSpace()
    }
  };
  
  const isHealthy = Object.values(health.checks).every(check => check.status === 'healthy');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. **Application Won't Start**

**Problem**: Services fail to start or ports are already in use
```bash
Error: EADDRINUSE: address already in use :::3000
```

**Solution**:
```bash
# Check what's using the ports
lsof -i :3000 -i :3001 -i :3002 -i :3003 -i :3004 -i :3005 -i :5000

# Kill processes using those ports
pkill -f "node"
pkill -f "http-server"
pkill -f "webpack"

# Or kill specific PIDs
kill -9 PID_NUMBER

# Restart the application
./start-application.sh
```

#### 2. **MongoDB Connection Issues**

**Problem**: Backend can't connect to MongoDB
```bash
❌ Mongoose connection error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions**:
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Start MongoDB container
docker start mongodb
# OR create new container
docker run -d --name ecommerce-mongodb -p 27017:27017 mongo:latest

# Check MongoDB logs
docker logs ecommerce-mongodb

# Test connection
docker exec mongodb mongosh --eval "db.adminCommand('ping')"
```

#### 3. **Module Federation Errors**

**Problem**: Micro-frontend fails to load
```bash
ChunkLoadError: Loading chunk remoteEntry failed
```

**Solutions**:
```bash
# Check if all frontend services are running
lsof -i :3001 -i :3002 -i :3003 -i :3004 -i :3005

# Restart specific micro-frontend
cd frontend/products
npm start

# Clear webpack cache
rm -rf node_modules/.cache
npm start

# Check webpack.config.js remotes configuration
```

#### 4. **IoT Dashboard Shows "N/A" for Previous Stock**

**Problem**: Sensor history events show "N/A" instead of actual previous quantities

**Solution**: ✅ **FIXED** - This issue has been resolved in recent updates
- Updated backend RFID scan route to properly calculate stock levels
- Enhanced database schema to support RFID metadata fields
- Fixed frontend to use backend-provided stock values

If still experiencing issues:
```bash
# Restart backend to apply schema changes
pkill -f "node server.js"
cd backend && node server.js

# Test with new RFID scan
curl -X POST http://localhost:5000/api/iot/rfid/scan \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"RFID_READER_01","rfidTag":"RFID_009","action":"outbound","quantity":2}'
```

#### 5. **Real-time Updates Not Working**

**Problem**: Socket.IO connections failing or not receiving updates

**Solutions**:
```bash
# Check Socket.IO connection in browser console
// Should see: Connected to IoT Dashboard Socket.IO

# Verify backend Socket.IO is running
curl http://localhost:5000/socket.io/?transport=polling

# Check for CORS issues
# Update backend CORS configuration if needed

# Test Socket.IO connection manually
const io = require('socket.io-client');
const socket = io('http://localhost:5000');
socket.on('connect', () => console.log('Connected!'));
```

#### 6. **Authentication Issues**

**Problem**: JWT token expired or invalid

**Solutions**:
```bash
# Clear browser localStorage
localStorage.removeItem('token');

# Check JWT secret in backend/.env
JWT_SECRET=your-secret-key

# Verify token in browser developer tools
// Check Application > Local Storage > token value

# Test authentication endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

#### 7. **Build Failures**

**Problem**: npm build or start commands fail

**Solutions**:
```bash
# Clear all node_modules and reinstall
find . -name "node_modules" -type d -exec rm -rf {} +
npm run install-all

# Clear npm cache
npm cache clean --force

# Update Node.js to LTS version
nvm install --lts
nvm use --lts

# Check for port conflicts
netstat -tulpn | grep LISTEN
```

#### 8. **Performance Issues**

**Problem**: Slow API responses or UI lag

**Solutions**:
```bash
# Check system resources
top
df -h

# Monitor API response times
curl -w "%{time_total}s\n" http://localhost:5000/api/products

# Check database performance
docker exec mongodb mongosh --eval "db.products.getIndexes()"

# Optimize MongoDB queries (add indexes if needed)
# Monitor real-time connections
docker logs -f ecommerce-mongodb
```

### Debug Mode

#### Enable Debug Logging
```bash
# Backend debug mode
DEBUG=* npm run dev

# Frontend debug mode
REACT_APP_DEBUG=true npm start

# Socket.IO debug mode
DEBUG=socket.io* npm run dev
```

#### Log Analysis
```bash
# Monitor backend logs
tail -f logs/backend.log

# Filter for errors
grep "ERROR" logs/backend.log

# Monitor Socket.IO connections
grep "Socket.IO" logs/backend.log

# Check IoT-related logs
grep "RFID\|IoT" logs/backend.log
```

### Getting Help

#### Debug Information to Provide
When reporting issues, include:

1. **System Information**:
   ```bash
   node --version
   npm --version
   docker --version
   uname -a  # Linux/macOS
   ```

2. **Service Status**:
   ```bash
   lsof -i :3000 -i :3001 -i :3002 -i :3003 -i :3004 -i :3005 -i :5000
   docker ps
   ```

3. **Error Logs**:
   ```bash
   tail -50 logs/backend.log
   npm run start-shell 2>&1 | head -20
   ```

4. **Environment**:
   ```bash
   cat backend/.env  # (hide sensitive values)
   npm list --depth=0
   ```

## 📈 Recent Updates

### v2.1.0 (Latest) - IoT Sensor History Fix
**Release Date**: Current

#### 🐛 **Major Bug Fixes**
- ✅ **Fixed IoT sensor history showing "N/A" for previous quantities**
  - **Issue**: RFID scan events displayed "N/A" instead of actual previous stock levels
  - **Root Cause**: Database schema didn't support RFID-specific metadata fields
  - **Solution**: 
    - Updated `IoTReading` model to include `previousStock`, `currentStock`, `action`, etc.
    - Fixed backend logic to calculate stock levels before inventory changes
    - Enhanced frontend to use backend-provided stock values
  - **Result**: Sensor history now shows proper transitions like "50 → 47 units"

#### 📡 **IoT Management Enhancements**
- ✅ **Enhanced RFID inventory tracking**
  - Real-time stock level updates with before/after quantities
  - Improved transaction history with complete metadata
  - Better integration with product inventory system

- ✅ **Improved sensor data persistence**
  - Extended database schema for comprehensive IoT metadata
  - Added support for custom sensor data fields
  - Enhanced data retrieval for historical analysis

#### 🔧 **Technical Improvements**
- ✅ **Backend API improvements**
  - Enhanced `/api/iot/rfid/scan` endpoint with better response data
  - Improved error handling for IoT device operations
  - Added comprehensive logging for debugging

- ✅ **Frontend enhancements**
  - Better real-time data synchronization via Socket.IO
  - Improved IoT dashboard with accurate historical data
  - Enhanced user experience with proper loading states

#### 🗂️ **Code Organization**
- ✅ **Updated student name and removed academic branding**
  - Changed student name from "Sai Pravalika" to "Uha Smitha"
  - Removed "Student Internship Project" section from home page
  - Cleaned up documentation and UI for professional appearance

### v2.0.0 - IoT Integration Release
**Release Date**: Previous

#### 🚀 **Major Features**
- ✅ **Complete IoT Management System**
  - Real-time sensor monitoring dashboard
  - RFID-based inventory tracking
  - Environmental sensor integration
  - Alert management system

- ✅ **Admin Dashboard Enhancement**
  - Comprehensive IoT device management
  - Real-time analytics and reporting
  - User and order management interfaces

#### 🔌 **Real-time Features**
- ✅ **Socket.IO Integration**
  - Live sensor data streaming
  - Real-time inventory updates
  - Instant alert notifications

### v1.0.0 - Core Platform Release
**Release Date**: Initial

#### 🏗️ **Core Architecture**
- ✅ **Micro-frontend architecture** with Module Federation
- ✅ **Complete e-commerce functionality**
- ✅ **User authentication and authorization**
- ✅ **Product catalog and inventory management**
- ✅ **Shopping cart and order processing**

---

## 🤝 Contributing

### Development Guidelines

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Follow coding standards**
   - Use ESLint configuration
   - Write meaningful commit messages
   - Include tests for new features
   - Update documentation

3. **Test your changes**
   ```bash
   npm run test
   npm run start-all  # Verify all services work
   ```

4. **Submit a Pull Request**
   - Describe changes and their purpose
   - Include screenshots for UI changes
   - Reference any related issues

### Code Style Guidelines

#### JavaScript/React
```javascript
// Use functional components with hooks
const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

#### API Routes
```javascript
// Use async/await for consistency
router.get('/endpoint', protect, async (req, res) => {
  try {
    const result = await SomeModel.find(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

#### CSS
```css
/* Use BEM methodology for CSS classes */
.component-name {
  /* Component styles */
}

.component-name__element {
  /* Element styles */
}

.component-name--modifier {
  /* Modifier styles */
}
```

## 📄 License

This project is licensed under the **MIT License**.

### MIT License

```
Copyright (c) 2024 Modular E-Commerce Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🔮 Future Roadmap

### Short-term Goals (Next 3 months)
- [ ] **Payment Gateway Integration** (Stripe, PayPal)
- [ ] **Advanced Analytics Dashboard** with charts and reports
- [ ] **Email Notification System** for orders and alerts
- [ ] **Product Reviews and Ratings** system
- [ ] **Mobile App Development** with React Native

### Medium-term Goals (3-6 months)
- [ ] **Machine Learning Recommendations** engine
- [ ] **Advanced Search** with Elasticsearch
- [ ] **Multi-language Support** (i18n)
- [ ] **Progressive Web App** (PWA) features
- [ ] **Advanced IoT Device Integration** (cameras, sensors)

### Long-term Goals (6+ months)
- [ ] **Kubernetes Deployment** configurations
- [ ] **Multi-tenant Architecture** for multiple stores
- [ ] **AI-powered Inventory Prediction**
- [ ] **Blockchain Integration** for supply chain tracking
- [ ] **Voice Interface** for IoT devices

---

## 🆘 Support

### Getting Help

1. **Documentation**: Start with this README and `IOT_MANAGEMENT_DETAILED.md`
2. **Issues**: Create a GitHub issue with detailed description
3. **Discussions**: Use GitHub Discussions for questions
4. **Email**: Contact the development team

### Reporting Bugs

When reporting bugs, please include:
- **Description**: What you expected vs what happened
- **Steps to reproduce**: Detailed step-by-step instructions
- **Environment**: OS, Node.js version, browser details
- **Logs**: Relevant error messages and logs
- **Screenshots**: If applicable

### Feature Requests

We welcome feature requests! Please:
- Search existing issues first
- Describe the use case and benefit
- Provide examples or mockups if possible
- Consider implementation complexity

---

## 📞 Contact Information

- **Project Repository**: [GitHub Repository URL]
- **Documentation**: [Documentation Site URL]
- **Development Team**: [Contact Email]
- **Bug Reports**: [GitHub Issues URL]

---

**Built with ❤️ using modern web technologies for scalable e-commerce solutions.**

**Last Updated**: December 2024 | **Version**: 2.1.0 