const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004"],
    methods: ["GET", "POST"]
  }
});

// Rate limiting - Disabled for development, only enabled in production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 999999, // Essentially unlimited for dev, 100 for production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  skip: (req) => {
    // Skip rate limiting entirely for development
    return process.env.NODE_ENV !== 'production';
  }
});

// Middleware
app.use(helmet());
app.use(compression());

// Apply rate limiting only to API routes (skip for health checks)
// Completely disable rate limiting for development
// app.use('/api', limiter);
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004"],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
let isMongoConnected = false;

// Configure mongoose to handle connection issues gracefully
mongoose.set('strictQuery', false);

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ Connected to MongoDB');
    isMongoConnected = true;
    
    // Seed database if needed
    if (process.env.NODE_ENV !== 'production') {
      console.log('🌱 Seeding database...');
      const seedData = require('./scripts/seed');
      await seedData();
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('\n🔧 Database Setup Options:');
    console.log('1. MongoDB Atlas (Free): https://www.mongodb.com/cloud/atlas');
    console.log('2. Local MongoDB: brew install mongodb/brew/mongodb-community');
    console.log('3. Docker: docker run -d -p 27017:27017 mongo');
    console.log('\n📝 Set MONGODB_URI environment variable for custom connection string');
    console.log('\n⚠️  Server continuing without database connection for frontend testing');
    isMongoConnected = false;
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('📀 Mongoose connected to MongoDB');
  isMongoConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
  isMongoConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('💔 Mongoose disconnected from MongoDB');
  isMongoConnected = false;
  
  // Try to reconnect after 5 seconds
  setTimeout(() => {
    console.log('🔄 Attempting to reconnect to MongoDB...');
    connectToMongoDB();
  }, 5000);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Initial connection attempt
connectToMongoDB();

// Socket.IO for real-time features
let connectedUsers = 0;
let lastLogTime = 0;
const LOG_INTERVAL = 30000; // Log every 30 seconds

io.on('connection', (socket) => {
  connectedUsers++;
  const now = Date.now();
  
  // Only log connection stats periodically in development to reduce noise
  if (process.env.NODE_ENV === 'production' || now - lastLogTime > LOG_INTERVAL) {
    console.log(`📡 Socket.IO: ${connectedUsers} active connections`);
    lastLogTime = now;
  }
  
  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
  });
  
  socket.on('inventory-update', (data) => {
    socket.broadcast.emit('inventory-changed', data);
  });
  
  socket.on('disconnect', () => {
    connectedUsers = Math.max(0, connectedUsers - 1);
  });
});

// Make io accessible to routes and add MongoDB status
app.use((req, res, next) => {
  req.io = io;
  req.isMongoConnected = isMongoConnected;
  next();
});

// Middleware to handle requests when MongoDB is down
app.use((req, res, next) => {
  // Allow health check and basic routes even without MongoDB
  if (req.path === '/health' || req.path === '/' || req.path.startsWith('/api/health')) {
    return next();
  }
  
  // For API routes, add MongoDB status info
  if (req.path.startsWith('/api/') && !isMongoConnected) {
    // Allow some routes to work without MongoDB for testing
    if (req.path.includes('/auth') || req.path.includes('/products')) {
      req.mockMode = true;
    }
  }
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: isMongoConnected ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'E-commerce Backend API',
    status: 'running',
    mongodb: isMongoConnected ? 'connected' : 'disconnected',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      products: '/api/products',
      users: '/api/users',
      cart: '/api/cart',
      orders: '/api/orders'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  
  // Handle specific MongoDB errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    return res.status(503).json({ 
      error: 'Database temporarily unavailable',
      mongodb: false,
      message: 'Please try again later'
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: err.message
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    mongodb: isMongoConnected,
    timestamp: new Date().toISOString()
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  // Don't exit the process, just log the error
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 