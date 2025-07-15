const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const IoTDevice = require('../models/IoTDevice');
const IoTReading = require('../models/IoTReading');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await IoTDevice.deleteMany({});
    await IoTReading.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Create customer user
    const customer = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'customer'
    });

    const products = [
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and long battery life.',
        price: 7999,
        category: 'Electronics',
        inventory: {
          quantity: 50,
          lowStockThreshold: 10,
          sku: 'WBH-001',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/headphones.jpg', alt: 'Wireless Bluetooth Headphones' }],
        tags: ['wireless', 'bluetooth', 'headphones', 'audio'],
        specifications: {
          'Battery Life': '30 hours',
          'Range': '10 meters',
          'Weight': '250g',
          'Noise Cancellation': 'Active'
        },
        metadata: {
          unitWeight: 0.25,
          rfidTag: 'RFID_001'
        }
      },
      {
        name: 'Smart Fitness Watch',
        description: 'Advanced fitness tracking with heart rate monitoring and GPS.',
        price: 12999,
        category: 'Wearables',
        inventory: {
          quantity: 30,
          lowStockThreshold: 5,
          sku: 'SFW-002',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/smartwatch.jpg', alt: 'Smart Fitness Watch' }],
        tags: ['fitness', 'smartwatch', 'health', 'gps'],
        specifications: {
          'Display': '1.4 inch AMOLED',
          'Battery': '7 days',
          'Water Resistance': '5ATM',
          'Sensors': 'Heart rate, GPS, Accelerometer'
        },
        metadata: {
          unitWeight: 0.1,
          rfidTag: 'RFID_002'
        }
      },
      {
        name: 'Laptop Backpack',
        description: 'Durable laptop backpack with multiple compartments and water-resistant material.',
        price: 2499,
        category: 'Accessories',
        inventory: {
          quantity: 75,
          lowStockThreshold: 15,
          sku: 'LBP-003',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/backpack.jpg', alt: 'Laptop Backpack' }],
        tags: ['backpack', 'laptop', 'travel', 'water-resistant'],
        specifications: {
          'Capacity': '25 liters',
          'Laptop Size': 'Up to 15.6 inches',
          'Material': 'Polyester',
          'Pockets': '6 compartments'
        },
        metadata: {
          unitWeight: 0.8,
          rfidTag: 'RFID_003'
        }
      },
      {
        name: 'Wireless Charging Pad',
        description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
        price: 1999,
        category: 'Electronics',
        inventory: {
          quantity: 100,
          lowStockThreshold: 20,
          sku: 'WCP-004',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/charger.jpg', alt: 'Wireless Charging Pad' }],
        tags: ['wireless', 'charging', 'qi', 'fast-charge'],
        specifications: {
          'Output': '10W',
          'Compatibility': 'Qi-enabled devices',
          'Input': 'USB-C',
          'Dimensions': '10cm diameter'
        }
      },
      {
        name: 'Eco-Friendly Yoga Mat',
        description: 'Non-slip yoga mat made from natural rubber, perfect for all yoga styles.',
        price: 3499,
        category: 'Fitness',
        inventory: {
          quantity: 40,
          lowStockThreshold: 8,
          sku: 'EYM-005',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/yogamat.jpg', alt: 'Eco-Friendly Yoga Mat' }],
        tags: ['yoga', 'fitness', 'exercise', 'eco-friendly'],
        specifications: {
          'Material': 'Natural rubber',
          'Thickness': '6mm',
          'Dimensions': '183x61cm',
          'Weight': '2.5kg'
        }
      }
    ];

    const createdProducts = await Product.insertMany(products);

    // Create IoT devices
    const iotDevices = [
      {
        deviceId: 'TEMP_001',
        name: 'Temperature Sensor - Warehouse A',
        type: 'temperature',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Zone A',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        status: 'active',
        isOnline: true,
        batteryLevel: 85,
        alertThresholds: { min: 15, max: 35 },
        lastReading: {
          value: 22.5,
          timestamp: new Date(),
          unit: '°C'
        }
      },
      {
        deviceId: 'HUM_001',
        name: 'Humidity Sensor - Warehouse A',
        type: 'humidity',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Zone A',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        status: 'active',
        isOnline: true,
        batteryLevel: 78,
        alertThresholds: { min: 30, max: 70 },
        lastReading: {
          value: 45,
          timestamp: new Date(),
          unit: '%'
        }
      },
      {
        deviceId: 'RFID_READER_01',
        name: 'RFID Reader - Entry Gate',
        type: 'rfid',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Entry',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        status: 'active',
        isOnline: true,
        batteryLevel: 92,
        lastReading: {
          value: 'RFID_001',
          timestamp: new Date(),
          unit: 'tag'
        }
      },
      {
        deviceId: 'WEIGHT_001',
        name: 'Smart Scale - Electronics Shelf',
        type: 'weight',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Electronics Section',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        status: 'active',
        isOnline: true,
        batteryLevel: 67,
        productId: createdProducts[0]._id, // Wireless Headphones
        lastReading: {
          value: 12.5,
          timestamp: new Date(),
          unit: 'kg'
        }
      },
      {
        deviceId: 'MOTION_001',
        name: 'Motion Detector - Warehouse Entrance',
        type: 'motion',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Entrance',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        status: 'active',
        isOnline: true,
        batteryLevel: 88,
        lastReading: {
          value: 1,
          timestamp: new Date(),
          unit: 'detected'
        }
      }
    ];

    const createdDevices = await IoTDevice.insertMany(iotDevices);

    // Create sample IoT readings
    const iotReadings = [
      {
        deviceId: 'TEMP_001',
        sensorType: 'temperature',
        value: 22.5,
        unit: '°C',
        location: { warehouse: 'Main Warehouse', zone: 'Zone A' },
        metadata: { humidity: 45, pressure: 1013.2 },
        alert: { isTriggered: false }
      },
      {
        deviceId: 'HUM_001',
        sensorType: 'humidity',
        value: 45,
        unit: '%',
        location: { warehouse: 'Main Warehouse', zone: 'Zone A' },
        metadata: { temperature: 22.5 },
        alert: { isTriggered: false }
      },
      {
        deviceId: 'WEIGHT_001',
        sensorType: 'weight',
        value: 12.5,
        unit: 'kg',
        location: { warehouse: 'Main Warehouse', zone: 'Electronics Section' },
        productId: createdProducts[0]._id,
        metadata: { 
          estimatedQuantity: 50,
          unitWeight: 0.25,
          shelfId: 'SHELF_A1'
        },
        alert: { isTriggered: false }
      },
      {
        deviceId: 'RFID_READER_01',
        sensorType: 'rfid',
        value: 'RFID_001',
        unit: 'tag',
        location: { warehouse: 'Main Warehouse', zone: 'Entry' },
        productId: createdProducts[0]._id,
        metadata: {
          scanType: 'product_identification',
          productName: 'Wireless Bluetooth Headphones'
        },
        alert: { isTriggered: false }
      }
    ];

    await IoTReading.insertMany(iotReadings);

    console.log('Sample data seeded successfully');
    console.log(`Created ${products.length} products`);
    console.log(`Created ${iotDevices.length} IoT devices`);
    console.log(`Created ${iotReadings.length} IoT readings`);
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
}

module.exports = seedData; 