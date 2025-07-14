# Setup Instructions for Modular E-Commerce Platform

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **npm** (comes with Node.js)

## MongoDB Setup Options

### Option 1: Local MongoDB Installation
1. Install MongoDB Community Edition from [https://www.mongodb.com/docs/manual/installation/](https://www.mongodb.com/docs/manual/installation/)
2. Start MongoDB service:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a cluster and get the connection string
3. Update `backend/config/config.js` with your Atlas connection string

## Quick Start

1. **Clone and navigate to the project**
   ```bash
   cd ecommerce-platform
   ```

2. **Install all dependencies**
   ```bash
   npm install
   npm run install-all
   ```

3. **Configure environment (if using custom MongoDB)**
   ```bash
   # Copy example config
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MongoDB URI
   ```

4. **Seed the database (after MongoDB is running)**
   ```bash
   cd backend
   npm run seed
   cd ..
   ```

5. **Start all services**
   ```bash
   npm run start-all
   ```

## Individual Service Startup

### Backend Only
```bash
npm run start-backend
# Runs on http://localhost:5000
```

### Frontend Shell (Main App)
```bash
npm run start-shell
# Runs on http://localhost:3000
```

### Individual Micro-Frontends
```bash
npm run start-products   # Port 3001
npm run start-cart       # Port 3002
npm run start-users      # Port 3003
npm run start-orders     # Port 3004
```

## Application URLs

- **Main Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Products Service**: http://localhost:3001
- **Cart Service**: http://localhost:3002
- **Users Service**: http://localhost:3003
- **Orders Service**: http://localhost:3004

## Demo Credentials

After seeding the database, you can use these test accounts:

- **Admin User**: 
  - Email: admin@example.com
  - Password: password123

- **Customer User**: 
  - Email: john@example.com
  - Password: password123

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item
- `DELETE /api/cart/remove/:itemId` - Remove item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders

### IoT Integration
- `POST /api/inventory/update` - Update single product inventory
- `POST /api/inventory/bulk-update` - Bulk inventory update

## Troubleshooting

### MongoDB Connection Issues
1. Ensure MongoDB is running
2. Check connection string in config
3. Verify firewall settings
4. For Atlas: Check IP whitelist

### Port Conflicts
1. Kill processes on conflicting ports:
   ```bash
   # Find process on port
   lsof -ti:3000
   # Kill process
   kill -9 <PID>
   ```

### Module Federation Issues
1. Ensure all micro-frontends are running
2. Check browser console for loading errors
3. Verify CORS settings

### Performance Issues
1. Use production builds for better performance:
   ```bash
   npm run build
   ```
2. Consider using nginx for load balancing in production

## Development Workflow

1. **Backend Development**: Make changes in `backend/` and restart with `npm run start-backend`
2. **Frontend Development**: Each micro-frontend hot-reloads automatically
3. **Testing**: Each service can be tested independently

## Production Deployment

1. **Build all frontends**:
   ```bash
   npm run build
   ```

2. **Environment Variables**: Set production environment variables
3. **Database**: Use MongoDB Atlas or dedicated MongoDB instance
4. **Reverse Proxy**: Use nginx to serve static files and proxy API calls
5. **Process Management**: Use PM2 or similar for process management

## Architecture Benefits

- **Independent Development**: Teams can work on different micro-frontends
- **Independent Deployment**: Deploy each service separately
- **Technology Diversity**: Use different libraries per micro-frontend
- **Scalability**: Scale services independently based on demand
- **Fault Isolation**: Issues in one micro-frontend don't affect others

## Next Steps

1. Customize the UI/UX for your brand
2. Add payment gateway integration
3. Implement advanced search with Elasticsearch
4. Add caching layer with Redis
5. Set up CI/CD pipelines
6. Add monitoring and logging
7. Implement microservices for the backend 