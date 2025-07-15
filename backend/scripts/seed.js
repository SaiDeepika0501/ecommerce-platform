const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('Connected to MongoDB');

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
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
        price: 16599, // ₹16,599 (converted from $199.99)
        category: 'Electronics',
        inventory: {
          quantity: 50,
          lowStockThreshold: 10,
          sku: 'WH001'
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Wireless Headphones' },
          { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500', alt: 'Wireless Headphones' }
        ],
        tags: ['wireless', 'bluetooth', 'headphones', 'audio'],
        specifications: {
          'Battery Life': '30 hours',
          'Connectivity': 'Bluetooth 5.0',
          'Weight': '250g',
          'Color': 'Black'
        }
      },
      {
        name: 'Premium Coffee Beans',
        description: 'Organic, fair-trade coffee beans roasted to perfection. Single origin from Colombian highlands.',
        price: 2490, // ₹2,490 (converted from $29.99)
        category: 'Food & Beverages',
        inventory: {
          quantity: 100,
          lowStockThreshold: 20,
          sku: 'SW001'
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', alt: 'Smart Watch' },
          { url: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=500', alt: 'Smart Watch' }
        ],
        tags: ['coffee', 'organic', 'fair-trade', 'premium'],
        specifications: {
          'Origin': 'Colombia',
          'Roast Level': 'Medium',
          'Weight': '1kg',
          'Processing': 'Washed'
        }
      },
      {
        name: 'Ergonomic Office Chair',
        description: 'Comfortable ergonomic office chair with lumbar support and adjustable height.',
        price: 24899, // ₹24,899 (converted from $299.99)
        category: 'Furniture',
        inventory: {
          quantity: 25,
          lowStockThreshold: 5,
          sku: 'CM001'
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', alt: 'Coffee Maker' },
          { url: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500', alt: 'Coffee Maker' }
        ],
        tags: ['office', 'chair', 'ergonomic', 'furniture'],
        specifications: {
          'Material': 'Mesh and fabric',
          'Weight Capacity': '150kg',
          'Dimensions': '65x65x110cm',
          'Warranty': '5 years'
        }
      },
      {
        name: 'Smartphone Cases Set',
        description: 'Protective smartphone cases compatible with latest models. Pack of 3 different colors.',
        price: 4149, // ₹4,149 (converted from $49.99)
        category: 'Accessories',
        inventory: {
          quantity: 200,
          lowStockThreshold: 40,
          sku: 'TS001'
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=500', alt: 'Organic Cotton T-Shirt' },
          { url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', alt: 'Organic Cotton T-Shirt' }
        ],
        tags: ['smartphone', 'case', 'protection', 'accessories'],
        specifications: {
          'Material': 'TPU and PC',
          'Colors': 'Black, Blue, Clear',
          'Compatibility': 'Multiple models',
          'Drop Protection': 'Up to 2m'
        }
      },
      {
        name: 'Yoga Mat Premium',
        description: 'Non-slip yoga mat made from eco-friendly materials. Perfect for home workouts.',
        price: 7459, // ₹7,459 (converted from $89.99)
        category: 'Sports & Fitness',
        inventory: {
          quantity: 75,
          lowStockThreshold: 15,
          sku: 'YM001'
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', alt: 'Yoga Mat' },
          { url: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=500', alt: 'Yoga Mat' }
        ],
        tags: ['yoga', 'fitness', 'exercise', 'eco-friendly'],
        specifications: {
          'Material': 'Natural rubber',
          'Thickness': '6mm',
          'Dimensions': '183x61cm',
          'Weight': '2.5kg'
        }
      }
    ];

    await Product.insertMany(products);

    console.log('Sample data seeded successfully');
    console.log(`Created ${products.length} products`);
    console.log('Admin user: admin@example.com / password123');
    console.log('Customer user: john@example.com / password123');

    // Only exit if this script is run directly, not when required by server
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error seeding data:', error);
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