# Modular E-Commerce Platform

A scalable e-commerce platform built with micro-frontends architecture using React, Webpack Module Federation, Node.js, and MongoDB. This project demonstrates modern web development practices with independent development, deployment, and real-time capabilities.

## 🏗️ Architecture

### Micro-Frontends
- **Shell App** (Port 3000): Main application shell with routing and shared state
- **Products** (Port 3001): Product catalog and search functionality
- **Cart** (Port 3002): Shopping cart management
- **Users** (Port 3003): User profile and authentication
- **Orders** (Port 3004): Order management and tracking

### Backend
- **Express Server** (Port 5000): RESTful API with MongoDB and real-time features
- **Socket.IO**: Real-time inventory updates and order notifications
- **JWT Authentication**: Secure user authentication

## 🚀 Features

- **Micro-Frontend Architecture**: Independent development and deployment
- **Real-time Updates**: Live inventory tracking and order status updates
- **IoT Integration Ready**: Bulk inventory update endpoints for IoT devices
- **Responsive Design**: Mobile-first approach with modern UI
- **Authentication**: JWT-based secure authentication
- **Shopping Cart**: Real-time cart management with inventory validation
- **Order Management**: Complete order lifecycle tracking
- **Search & Filtering**: Advanced product search and categorization

## 📦 Technology Stack

### Frontend
- React 18
- Webpack Module Federation
- React Router
- Axios
- Socket.IO Client
- CSS3 with responsive design

### Backend
- Node.js & Express
- MongoDB with Mongoose
- Socket.IO for real-time features
- JWT for authentication
- bcryptjs for password hashing
- Helmet for security
- Winston for logging

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local, Docker, or cloud instance)
- npm or yarn
- Docker (optional, for easy MongoDB setup)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-platform
   ```

2. **Run the automated setup script**
   ```bash
   chmod +x start-application.sh
   ./start-application.sh
   ```
   
   The script will:
   - Install all dependencies
   - Set up environment variables
   - Optionally start MongoDB in Docker
   - Start all services
   - Create sample data automatically

### Manual Setup

1. **Install dependencies**
   ```bash
   npm install
   npm run install-all
   ```

2. **Set up MongoDB** (Choose one option):

   **Option A: Docker (Recommended for development)**
   ```bash
   docker run -d -p 27017:27017 --name ecommerce-mongodb \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo
   ```

   **Option B: Local MongoDB**
   ```bash
   brew install mongodb/brew/mongodb-community
   brew services start mongodb/brew/mongodb-community
   ```

   **Option C: MongoDB Atlas (Cloud)**
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get connection string

3. **Set up environment variables**
   Create a `.env` file in the `backend` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your-secret-key-here
   
   # Choose one database connection:
   # Local MongoDB
   # MONGODB_URI=mongodb://localhost:27017/ecommerce
   
   # Docker MongoDB
   MONGODB_URI=mongodb://admin:password123@localhost:27017/ecommerce?authSource=admin
   
   # MongoDB Atlas
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
   ```

4. **Start all services**
   ```bash
   npm run start-all
   ```

   Sample data will be created automatically when the backend connects to MongoDB.

### Individual Service Setup

#### Backend Only
```bash
npm run start-backend
```

#### Frontend Shell Only
```bash
npm run start-shell
```

#### Individual Micro-Frontends
```bash
npm run start-products
npm run start-cart
npm run start-users
npm run start-orders
```

## 🔧 Development

### Project Structure
```
ecommerce-platform/
├── backend/                 # Express API server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── scripts/            # Utility scripts
│   └── server.js           # Main server file
├── frontend/
│   ├── shell/              # Main shell application
│   ├── products/           # Products micro-frontend
│   ├── cart/               # Cart micro-frontend
│   ├── users/              # Users micro-frontend
│   └── orders/             # Orders micro-frontend
└── package.json            # Root package.json
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

#### Products
- `GET /api/products` - Get all products (with search/filter)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

#### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item quantity
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

#### Orders
- `POST /api/orders` - Create order from cart
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders` - Get all orders (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)

#### Inventory (IoT Integration)
- `GET /api/inventory/status` - Get inventory status
- `POST /api/inventory/update` - Update single product inventory
- `POST /api/inventory/bulk-update` - Bulk inventory update

## 🌐 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
# Backend
docker build -t ecommerce-backend ./backend

# Frontend (each micro-frontend)
docker build -t ecommerce-shell ./frontend/shell
docker build -t ecommerce-products ./frontend/products
# ... etc
```

## 🔌 IoT Integration

The platform includes endpoints for IoT-based inventory management:

### Single Product Update
```bash
POST /api/inventory/update
{
  "sku": "PROD123",
  "quantity": 50,
  "operation": "set" // "set", "add", or "subtract"
}
```

### Bulk Update
```bash
POST /api/inventory/bulk-update
{
  "updates": [
    { "sku": "PROD123", "quantity": 50, "operation": "set" },
    { "sku": "PROD456", "quantity": 25, "operation": "add" }
  ]
}
```

## 📱 Real-time Features

- **Inventory Updates**: Real-time stock level changes
- **Order Status**: Live order status updates
- **User Notifications**: WebSocket-based notifications

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting
- CORS configuration
- Input validation
- Helmet security headers

## 🧪 Testing

### Demo Credentials
- **Admin**: admin@example.com / password123
- **Customer**: john@example.com / password123

### Sample Data
The seed script creates:
- 5 sample products across different categories
- Admin and customer user accounts
- Product inventory with different stock levels

### Quick Health Check
```bash
# Check if backend is running
curl http://localhost:5000/health

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

## 🔧 Troubleshooting

### Common Issues

#### Backend Server Exits After Starting
**Issue**: Server starts, shows "Sample data seeded successfully" then exits.
**Solution**: This was a known issue that has been fixed. The server now continues running after seeding.

#### Port Already in Use
**Issue**: `Error: listen EADDRINUSE: address already in use`
**Solution**: 
```bash
# Kill processes on specific ports
lsof -ti:3000,3001,3002,3003,5000 | xargs kill -9

# Or use the cleanup in start script
./start-application.sh  # It handles cleanup automatically
```

#### MongoDB Connection Issues
**Issue**: `MongooseServerSelectionError: connect ECONNREFUSED`
**Solutions**:
1. **Check if MongoDB is running**:
   ```bash
   # For local MongoDB
   brew services list | grep mongodb
   
   # For Docker MongoDB
   docker ps | grep mongo
   ```

2. **Start MongoDB**:
   ```bash
   # Local MongoDB
   brew services start mongodb/brew/mongodb-community
   
   # Docker MongoDB
   docker start ecommerce-mongodb
   ```

3. **Check connection string** in `backend/.env`

#### Frontend Services Won't Start
**Issue**: Webpack compilation errors or module not found
**Solutions**:
1. **Clear node_modules and reinstall**:
   ```bash
   rm -rf node_modules frontend/*/node_modules
   npm install
   npm run install-all
   ```

2. **Check for missing dependencies**:
   ```bash
   cd frontend/users
   npm install @module-federation/webpack
   ```

#### Login Failed Error
**Issue**: Login returns error even with correct credentials
**Solution**: Ensure backend is running and connected to MongoDB. Check `http://localhost:5000/health`

### Reset Everything
If you encounter persistent issues:
```bash
# Stop all services
pkill -f "node\|nodemon\|webpack"

# Remove all dependencies
rm -rf node_modules frontend/*/node_modules

# Remove Docker containers (if using Docker MongoDB)
docker stop ecommerce-mongodb
docker rm ecommerce-mongodb

# Start fresh
./start-application.sh
```

## 📊 Performance & Scalability

- **Micro-Frontend Architecture**: Independent scaling of frontend components
- **Module Federation**: Efficient code sharing and lazy loading
- **Database Indexing**: Optimized MongoDB queries
- **Real-time Communication**: Efficient WebSocket connections
- **Caching**: Browser caching and HTTP caching headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔮 Future Enhancements

- Payment gateway integration
- Advanced search with Elasticsearch
- Machine learning recommendations
- Multi-language support
- Progressive Web App (PWA) features
- Advanced analytics and reporting
- Mobile app with React Native
- Kubernetes deployment configurations

---

**Built with ❤️ using modern web technologies for scalable e-commerce solutions.** 