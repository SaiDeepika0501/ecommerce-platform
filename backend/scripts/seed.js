const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Create sample customer
    const customer = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'customer'
    });

    // Create sample products
    const products = [
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        category: 'Electronics',
        inventory: {
          quantity: 50,
          lowStockThreshold: 10,
          sku: 'WH001'
        },
        images: [
          { url: '/images/headphones1.jpg', alt: 'Wireless Headphones' }
        ],
        tags: ['electronics', 'audio', 'wireless'],
        specifications: new Map([
          ['Battery Life', '30 hours'],
          ['Connectivity', 'Bluetooth 5.0'],
          ['Weight', '250g']
        ])
      },
      {
        name: 'Smart Watch',
        description: 'Advanced fitness tracking smartwatch with heart rate monitor',
        price: 299.99,
        category: 'Electronics',
        inventory: {
          quantity: 30,
          lowStockThreshold: 5,
          sku: 'SW001'
        },
        images: [
          { url: '/images/smartwatch1.jpg', alt: 'Smart Watch' }
        ],
        tags: ['electronics', 'fitness', 'wearable'],
        specifications: new Map([
          ['Display', '1.4 inch OLED'],
          ['Battery Life', '7 days'],
          ['Water Resistance', 'IP68']
        ])
      },
      {
        name: 'Organic Cotton T-Shirt',
        description: 'Comfortable organic cotton t-shirt, sustainably made',
        price: 29.99,
        category: 'Clothing',
        inventory: {
          quantity: 100,
          lowStockThreshold: 20,
          sku: 'TS001'
        },
        images: [
          { url: '/images/tshirt1.jpg', alt: 'Organic Cotton T-Shirt' }
        ],
        tags: ['clothing', 'organic', 'sustainable'],
        specifications: new Map([
          ['Material', '100% Organic Cotton'],
          ['Fit', 'Regular'],
          ['Care', 'Machine washable']
        ])
      },
      {
        name: 'Yoga Mat',
        description: 'Premium non-slip yoga mat for all types of practice',
        price: 49.99,
        category: 'Sports',
        inventory: {
          quantity: 75,
          lowStockThreshold: 15,
          sku: 'YM001'
        },
        images: [
          { url: '/images/yogamat1.jpg', alt: 'Yoga Mat' }
        ],
        tags: ['sports', 'fitness', 'yoga'],
        specifications: new Map([
          ['Thickness', '6mm'],
          ['Material', 'TPE'],
          ['Size', '183cm x 61cm']
        ])
      },
      {
        name: 'Coffee Maker',
        description: 'Programmable coffee maker with thermal carafe',
        price: 89.99,
        category: 'Home',
        inventory: {
          quantity: 25,
          lowStockThreshold: 5,
          sku: 'CM001'
        },
        images: [
          { url: '/images/coffeemaker1.jpg', alt: 'Coffee Maker' }
        ],
        tags: ['home', 'kitchen', 'coffee'],
        specifications: new Map([
          ['Capacity', '12 cups'],
          ['Features', 'Programmable, Auto-shutoff'],
          ['Carafe', 'Thermal stainless steel']
        ])
      }
    ];

    await Product.insertMany(products);

    // Only log in development mode when run directly
    if (require.main === module && process.env.NODE_ENV === 'development') {
      // Seeding completed successfully
    }

    // Only exit if this script is run directly, not when required by server
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    if (require.main === module && process.env.NODE_ENV === 'development') {
      // Error seeding data
    }
    if (require.main === module) {
      process.exit(1);
    }
  }
};

// Only run seeding if this script is executed directly
if (require.main === module) {
  seedData();
} else {
  // Export the function for use in server.js
  module.exports = seedData;
} 