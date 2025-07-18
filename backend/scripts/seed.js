const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const IoTDevice = require('../models/IoTDevice');
const IoTReading = require('../models/IoTReading');
const Order = require('../models/Order');
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
    
    // Clear orders if they exist
    await Order.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Create multiple customer users (using individual creates to trigger password hashing)
    const customers = [];
    
    const customerData = [
      { name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'customer' },
      { name: 'Sarah Wilson', email: 'sarah@example.com', password: 'password123', role: 'customer' },
      { name: 'Mike Chen', email: 'mike@example.com', password: 'password123', role: 'customer' },
      { name: 'Emily Johnson', email: 'emily@example.com', password: 'password123', role: 'customer' },
      { name: 'David Rodriguez', email: 'david@example.com', password: 'password123', role: 'customer' }
    ];
    
    for (const userData of customerData) {
      const customer = await User.create(userData);
      customers.push(customer);
    }

    const products = [
      // Electronics - Various stock levels
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
        name: 'Gaming Laptop',
        description: 'High-performance gaming laptop with RTX 4060 and 16GB RAM.',
        price: 89999,
        category: 'Electronics',
        inventory: {
          quantity: 3, // Low stock scenario
          lowStockThreshold: 5,
          sku: 'GL-002',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/gaming-laptop.jpg', alt: 'Gaming Laptop' }],
        tags: ['gaming', 'laptop', 'high-performance', 'rtx'],
        specifications: {
          'CPU': 'Intel i7-12700H',
          'GPU': 'RTX 4060',
          'RAM': '16GB DDR5',
          'Storage': '1TB SSD'
        },
        metadata: {
          unitWeight: 2.3,
          rfidTag: 'RFID_002'
        }
      },
      {
        name: 'Smartphone 128GB',
        description: 'Latest flagship smartphone with advanced camera system.',
        price: 69999,
        category: 'Electronics',
        inventory: {
          quantity: 0, // Out of stock scenario
          lowStockThreshold: 10,
          sku: 'SP-003',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/smartphone.jpg', alt: 'Smartphone' }],
        tags: ['smartphone', 'camera', 'flagship', '5g'],
        specifications: {
          'Display': '6.7" OLED',
          'Camera': '108MP Triple',
          'Storage': '128GB',
          'Battery': '5000mAh'
        },
        metadata: {
          unitWeight: 0.2,
          rfidTag: 'RFID_003'
        }
      },
      {
        name: 'Wireless Charging Pad',
        description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
        price: 1999,
        category: 'Electronics',
        inventory: {
          quantity: 150, // Overstocked scenario
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
        },
        metadata: {
          unitWeight: 0.3,
          rfidTag: 'RFID_004'
        }
      },

      // Wearables
      {
        name: 'Smart Fitness Watch',
        description: 'Advanced fitness tracking with heart rate monitoring and GPS.',
        price: 12999,
        category: 'Wearables',
        inventory: {
          quantity: 30,
          lowStockThreshold: 5,
          sku: 'SFW-005',
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
          rfidTag: 'RFID_005'
        }
      },
      {
        name: 'Wireless Earbuds Pro',
        description: 'Premium wireless earbuds with active noise cancellation.',
        price: 15999,
        category: 'Wearables',
        inventory: {
          quantity: 8, // Low stock
          lowStockThreshold: 15,
          sku: 'WEP-006',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/earbuds.jpg', alt: 'Wireless Earbuds Pro' }],
        tags: ['earbuds', 'wireless', 'anc', 'premium'],
        specifications: {
          'Battery': '6+24 hours',
          'Drivers': '11mm dynamic',
          'ANC': 'Active Noise Cancellation',
          'Water Rating': 'IPX4'
        },
        metadata: {
          unitWeight: 0.05,
          rfidTag: 'RFID_006'
        }
      },

      // Clothing
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt in various colors.',
        price: 1299,
        category: 'Clothing',
        inventory: {
          quantity: 200,
          lowStockThreshold: 50,
          sku: 'CTS-007',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/tshirt.jpg', alt: 'Cotton T-Shirt' }],
        tags: ['cotton', 'casual', 'comfortable', 'basic'],
        specifications: {
          'Material': '100% Cotton',
          'Fit': 'Regular',
          'Care': 'Machine washable',
          'Sizes': 'S, M, L, XL, XXL'
        },
        metadata: {
          unitWeight: 0.15,
          rfidTag: 'RFID_007'
        }
      },
      {
        name: 'Denim Jeans',
        description: 'Classic blue denim jeans with comfortable fit.',
        price: 3999,
        category: 'Clothing',
        inventory: {
          quantity: 0, // Out of stock
          lowStockThreshold: 20,
          sku: 'DJ-008',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/jeans.jpg', alt: 'Denim Jeans' }],
        tags: ['denim', 'jeans', 'casual', 'classic'],
        specifications: {
          'Material': '98% Cotton, 2% Elastane',
          'Fit': 'Slim',
          'Wash': 'Classic Blue',
          'Sizes': '28-42 waist'
        },
        metadata: {
          unitWeight: 0.6,
          rfidTag: 'RFID_008'
        }
      },

      // Home & Garden
      {
        name: 'Smart LED Bulb',
        description: 'Wi-Fi enabled smart LED bulb with millions of colors.',
        price: 899,
        category: 'Home & Garden',
        inventory: {
          quantity: 75,
          lowStockThreshold: 25,
          sku: 'SLB-009',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/smart-bulb.jpg', alt: 'Smart LED Bulb' }],
        tags: ['smart', 'led', 'wifi', 'colorful'],
        specifications: {
          'Wattage': '9W (60W equivalent)',
          'Colors': '16 million',
          'Connectivity': 'Wi-Fi',
          'Lifespan': '25,000 hours'
        },
        metadata: {
          unitWeight: 0.08,
          rfidTag: 'RFID_009'
        }
      },
      {
        name: 'Artificial Plant',
        description: 'Realistic artificial plant for home decoration.',
        price: 2499,
        category: 'Home & Garden',
        inventory: {
          quantity: 4, // Low stock
          lowStockThreshold: 10,
          sku: 'AP-010',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/plant.jpg', alt: 'Artificial Plant' }],
        tags: ['artificial', 'plant', 'decoration', 'home'],
        specifications: {
          'Height': '45cm',
          'Material': 'High-quality plastic',
          'Pot': 'Ceramic included',
          'Maintenance': 'No watering required'
        },
        metadata: {
          unitWeight: 1.2,
          rfidTag: 'RFID_010'
        }
      },

      // Sports & Fitness
      {
        name: 'Eco-Friendly Yoga Mat',
        description: 'Non-slip yoga mat made from natural rubber, perfect for all yoga styles.',
        price: 3499,
        category: 'Sports & Fitness',
        inventory: {
          quantity: 40,
          lowStockThreshold: 8,
          sku: 'EYM-011',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/yogamat.jpg', alt: 'Eco-Friendly Yoga Mat' }],
        tags: ['yoga', 'fitness', 'exercise', 'eco-friendly'],
        specifications: {
          'Material': 'Natural rubber',
          'Thickness': '6mm',
          'Dimensions': '183x61cm',
          'Weight': '2.5kg'
        },
        metadata: {
          unitWeight: 2.5,
          rfidTag: 'RFID_011'
        }
      },
      {
        name: 'Resistance Bands Set',
        description: 'Complete set of resistance bands for strength training.',
        price: 1899,
        category: 'Sports & Fitness',
        inventory: {
          quantity: 1, // Critical low stock
          lowStockThreshold: 10,
          sku: 'RBS-012',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/resistance-bands.jpg', alt: 'Resistance Bands Set' }],
        tags: ['resistance', 'bands', 'strength', 'training'],
        specifications: {
          'Bands': '5 different resistances',
          'Material': 'Natural latex',
          'Accessories': 'Handles, door anchor',
          'Max Resistance': '50lbs'
        },
        metadata: {
          unitWeight: 0.5,
          rfidTag: 'RFID_012'
        }
      },

      // Accessories
      {
        name: 'Laptop Backpack',
        description: 'Durable laptop backpack with multiple compartments and water-resistant material.',
        price: 2499,
        category: 'Accessories',
        inventory: {
          quantity: 75,
          lowStockThreshold: 15,
          sku: 'LBP-013',
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
          rfidTag: 'RFID_013'
        }
      },
      {
        name: 'Phone Case Premium',
        description: 'Premium protective case with card holder.',
        price: 799,
        category: 'Accessories',
        inventory: {
          quantity: 0, // Out of stock
          lowStockThreshold: 30,
          sku: 'PCP-014',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/phone-case.jpg', alt: 'Phone Case Premium' }],
        tags: ['case', 'protective', 'premium', 'cards'],
        specifications: {
          'Protection': 'Drop protection up to 2m',
          'Material': 'Premium leather',
          'Features': 'Card slots, kickstand',
          'Compatibility': 'Multiple models'
        },
        metadata: {
          unitWeight: 0.1,
          rfidTag: 'RFID_014'
        }
      },

      // Books
      {
        name: 'JavaScript Programming Guide',
        description: 'Comprehensive guide to modern JavaScript programming.',
        price: 2999,
        category: 'Books',
        inventory: {
          quantity: 25,
          lowStockThreshold: 5,
          sku: 'JPG-015',
          lastUpdated: new Date()
        },
        images: [{ url: '/images/js-book.jpg', alt: 'JavaScript Programming Guide' }],
        tags: ['javascript', 'programming', 'coding', 'web'],
        specifications: {
          'Pages': '450',
          'Publisher': 'Tech Press',
          'Edition': '2024',
          'Level': 'Intermediate to Advanced'
        },
        metadata: {
          unitWeight: 0.7,
          rfidTag: 'RFID_015'
        }
      }
    ];

    const createdProducts = await Product.insertMany(products);

    // Create comprehensive IoT devices
    const iotDevices = [
      // Temperature sensors - Various statuses
      {
        deviceId: 'TEMP_001',
        name: 'Temperature Sensor - Zone A',
        type: 'temperature',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Zone A - Electronics',
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
        deviceId: 'TEMP_002',
        name: 'Temperature Sensor - Zone B',
        type: 'temperature',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Zone B - Clothing',
          coordinates: { lat: 40.7130, lng: -74.0062 }
        },
        status: 'active',
        isOnline: true,
        batteryLevel: 67,
        alertThresholds: { min: 18, max: 28 },
        lastReading: {
          value: 36.8, // Above threshold - will trigger alert
          timestamp: new Date(),
          unit: '°C'
        }
      },
      {
        deviceId: 'TEMP_003',
        name: 'Temperature Sensor - Cold Storage',
        type: 'temperature',
        location: {
          warehouse: 'Cold Storage',
          zone: 'Freezer Section',
          coordinates: { lat: 40.7125, lng: -74.0065 }
        },
        status: 'maintenance',
        isOnline: false,
        batteryLevel: 23, // Low battery
        alertThresholds: { min: -5, max: 5 },
        lastReading: {
          value: 12.5, // Above freezer threshold
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          unit: '°C'
        }
      },

      // Humidity sensors
      {
        deviceId: 'HUM_001',
        name: 'Humidity Sensor - Zone A',
        type: 'humidity',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Zone A - Electronics',
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
        deviceId: 'HUM_002',
        name: 'Humidity Sensor - Zone C',
        type: 'humidity',
        location: {
          warehouse: 'Secondary Warehouse',
          zone: 'Zone C - Books',
          coordinates: { lat: 40.7135, lng: -74.0070 }
        },
        status: 'active',
        isOnline: true,
        batteryLevel: 91,
        alertThresholds: { min: 40, max: 60 },
        lastReading: {
          value: 25, // Below threshold
          timestamp: new Date(),
          unit: '%'
        }
      },

      // RFID readers
      {
        deviceId: 'RFID_READER_01',
        name: 'RFID Reader - Main Entry',
        type: 'rfid',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Entry Gate',
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
        deviceId: 'RFID_READER_02',
        name: 'RFID Reader - Shipping Dock',
        type: 'rfid',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Shipping Dock',
          coordinates: { lat: 40.7132, lng: -74.0058 }
        },
        status: 'active',
        isOnline: true,
        batteryLevel: 88,
        lastReading: {
          value: 'RFID_002',
          timestamp: new Date(Date.now() - 1800000), // 30 min ago
          unit: 'tag'
        }
      },

      // Weight sensors for inventory
      {
        deviceId: 'WEIGHT_001',
        name: 'Smart Scale - Electronics Shelf A1',
        type: 'weight',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Electronics Section - Shelf A1',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        status: 'active',
        isOnline: true,
        batteryLevel: 67,
        productId: createdProducts[0]._id, // Wireless Headphones
        alertThresholds: { min: 5, max: 100 },
        lastReading: {
          value: 12.5, // 50 units * 0.25kg each
          timestamp: new Date(),
          unit: 'kg'
        }
      },
      {
        deviceId: 'WEIGHT_002',
        name: 'Smart Scale - Clothing Rack B2',
        type: 'weight',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Clothing Section - Rack B2',
          coordinates: { lat: 40.7130, lng: -74.0062 }
        },
        status: 'active',
        isOnline: true,
        batteryLevel: 84,
        productId: createdProducts[6]._id, // Cotton T-Shirt
        alertThresholds: { min: 7.5, max: 50 },
        lastReading: {
          value: 30.0, // 200 units * 0.15kg each
          timestamp: new Date(),
          unit: 'kg'
        }
      },
      {
        deviceId: 'WEIGHT_003',
        name: 'Smart Scale - Fitness Equipment',
        type: 'weight',
        location: {
          warehouse: 'Secondary Warehouse',
          zone: 'Fitness Section',
          coordinates: { lat: 40.7135, lng: -74.0070 }
        },
        status: 'error',
        isOnline: false,
        batteryLevel: 15, // Critical battery
        productId: createdProducts[11]._id, // Resistance Bands
        alertThresholds: { min: 0.5, max: 20 },
        lastReading: {
          value: 0.5, // Critical low stock
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          unit: 'kg'
        }
      },

      // Motion detectors
      {
        deviceId: 'MOTION_001',
        name: 'Motion Detector - Main Entrance',
        type: 'motion',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Main Entrance',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        status: 'active',
        isOnline: true,
        batteryLevel: 88,
        lastReading: {
          value: 1, // Motion detected
          timestamp: new Date(Date.now() - 300000), // 5 min ago
          unit: 'detected'
        }
      },
      {
        deviceId: 'MOTION_002',
        name: 'Motion Detector - Storage Area',
        type: 'motion',
        location: {
          warehouse: 'Secondary Warehouse',
          zone: 'Restricted Storage',
          coordinates: { lat: 40.7135, lng: -74.0070 }
        },
        status: 'active',
        isOnline: true,
        batteryLevel: 95,
        lastReading: {
          value: 0, // No motion
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          unit: 'detected'
        }
      },

      // Camera systems
      {
        deviceId: 'CAMERA_001',
        name: 'Security Camera - Entrance',
        type: 'camera',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Security - Entrance',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        status: 'active',
        isOnline: true,
        batteryLevel: 100, // AC powered
        lastReading: {
          value: 'recording',
          timestamp: new Date(),
          unit: 'status'
        }
      },

      // Barcode scanners
      {
        deviceId: 'BARCODE_001',
        name: 'Barcode Scanner - Checkout',
        type: 'barcode',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Checkout Station',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        status: 'active',
        isOnline: true,
        batteryLevel: 72,
        lastReading: {
          value: 'WBH-001',
          timestamp: new Date(Date.now() - 600000), // 10 min ago
          unit: 'sku'
        }
      }
    ];

    const createdDevices = await IoTDevice.insertMany(iotDevices);

    // Create comprehensive IoT readings with alerts
    const iotReadings = [
      // Normal temperature readings
      {
        deviceId: 'TEMP_001',
        sensorType: 'temperature',
        value: 22.5,
        unit: '°C',
        location: { warehouse: 'Main Warehouse', zone: 'Zone A - Electronics' },
        metadata: { humidity: 45, pressure: 1013.2 },
        alert: { isTriggered: false },
        createdAt: new Date(Date.now() - 300000) // 5 min ago
      },
      {
        deviceId: 'TEMP_001',
        sensorType: 'temperature',
        value: 24.1,
        unit: '°C',
        location: { warehouse: 'Main Warehouse', zone: 'Zone A - Electronics' },
        metadata: { humidity: 47, pressure: 1012.8 },
        alert: { isTriggered: false },
        createdAt: new Date()
      },

      // Temperature alert - above threshold
      {
        deviceId: 'TEMP_002',
        sensorType: 'temperature',
        value: 36.8,
        unit: '°C',
        location: { warehouse: 'Main Warehouse', zone: 'Zone B - Clothing' },
        metadata: { humidity: 65, pressure: 1014.1 },
        alert: { 
          isTriggered: true,
          level: 'high',
          message: 'Temperature 36.8°C is above threshold range (18-28°C)'
        },
        createdAt: new Date(Date.now() - 600000) // 10 min ago
      },

      // Critical cold storage alert
      {
        deviceId: 'TEMP_003',
        sensorType: 'temperature',
        value: 12.5,
        unit: '°C',
        location: { warehouse: 'Cold Storage', zone: 'Freezer Section' },
        metadata: { humidity: 85, pressure: 1015.3 },
        alert: { 
          isTriggered: true,
          level: 'critical',
          message: 'Cold storage temperature 12.5°C is critically above threshold (-5 to 5°C)'
        },
        createdAt: new Date(Date.now() - 3600000) // 1 hour ago
      },

      // Humidity readings
      {
        deviceId: 'HUM_001',
        sensorType: 'humidity',
        value: 45,
        unit: '%',
        location: { warehouse: 'Main Warehouse', zone: 'Zone A - Electronics' },
        metadata: { temperature: 22.5 },
        alert: { isTriggered: false },
        createdAt: new Date(Date.now() - 180000) // 3 min ago
      },

      // Low humidity alert
      {
        deviceId: 'HUM_002',
        sensorType: 'humidity',
        value: 25,
        unit: '%',
        location: { warehouse: 'Secondary Warehouse', zone: 'Zone C - Books' },
        metadata: { temperature: 23.2 },
        alert: { 
          isTriggered: true,
          level: 'medium',
          message: 'Humidity 25% is below optimal range (40-60%)'
        },
        createdAt: new Date(Date.now() - 900000) // 15 min ago
      },

      // Weight/inventory readings
      {
        deviceId: 'WEIGHT_001',
        sensorType: 'weight',
        value: 12.5,
        unit: 'kg',
        location: { warehouse: 'Main Warehouse', zone: 'Electronics Section - Shelf A1' },
        productId: createdProducts[0]._id,
        metadata: { 
          estimatedQuantity: 50,
          unitWeight: 0.25,
          shelfId: 'SHELF_A1'
        },
        alert: { isTriggered: false },
        createdAt: new Date(Date.now() - 1200000) // 20 min ago
      },

      // Normal clothing inventory
      {
        deviceId: 'WEIGHT_002',
        sensorType: 'weight',
        value: 30.0,
        unit: 'kg',
        location: { warehouse: 'Main Warehouse', zone: 'Clothing Section - Rack B2' },
        productId: createdProducts[6]._id, // Cotton T-Shirt
        metadata: { 
          estimatedQuantity: 200,
          unitWeight: 0.15,
          shelfId: 'RACK_B2'
        },
        alert: { isTriggered: false },
        createdAt: new Date(Date.now() - 1800000) // 30 min ago
      },

      // Critical low stock alert
      {
        deviceId: 'WEIGHT_003',
        sensorType: 'weight',
        value: 0.5,
        unit: 'kg',
        location: { warehouse: 'Secondary Warehouse', zone: 'Fitness Section' },
        productId: createdProducts[11]._id, // Resistance Bands
        metadata: { 
          estimatedQuantity: 1,
          unitWeight: 0.5,
          shelfId: 'FITNESS_C1'
        },
        alert: { 
          isTriggered: true,
          level: 'critical',
          message: 'Critical low stock: 1 unit remaining'
        },
        createdAt: new Date(Date.now() - 7200000) // 2 hours ago
      },

      // RFID scans
      {
        deviceId: 'RFID_READER_01',
        sensorType: 'rfid',
        value: 'RFID_001',
        unit: 'tag',
        location: { warehouse: 'Main Warehouse', zone: 'Entry Gate' },
        productId: createdProducts[0]._id,
        metadata: {
          scanType: 'product_identification',
          productName: 'Wireless Bluetooth Headphones'
        },
        alert: { isTriggered: false },
        createdAt: new Date(Date.now() - 2700000) // 45 min ago
      },
      {
        deviceId: 'RFID_READER_02',
        sensorType: 'rfid',
        value: 'RFID_005',
        unit: 'tag',
        location: { warehouse: 'Main Warehouse', zone: 'Shipping Dock' },
        productId: createdProducts[4]._id, // Smart Fitness Watch
        metadata: {
          scanType: 'shipping_verification',
          productName: 'Smart Fitness Watch'
        },
        alert: { isTriggered: false },
        createdAt: new Date(Date.now() - 1800000) // 30 min ago
      },

      // Motion detection
      {
        deviceId: 'MOTION_001',
        sensorType: 'motion',
        value: 1,
        unit: 'detected',
        location: { warehouse: 'Main Warehouse', zone: 'Main Entrance' },
        metadata: { 
          motionType: 'person_detected',
          duration: 15
        },
        alert: { isTriggered: false },
        createdAt: new Date(Date.now() - 300000) // 5 min ago
      },

      // Security camera status
      {
        deviceId: 'CAMERA_001',
        sensorType: 'camera',
        value: 'recording',
        unit: 'status',
        location: { warehouse: 'Main Warehouse', zone: 'Security - Entrance' },
        metadata: { 
          resolution: '1080p',
          fps: 30,
          storageUsed: '45%'
        },
        alert: { isTriggered: false },
        createdAt: new Date()
      },

      // Barcode scans
      {
        deviceId: 'BARCODE_001',
        sensorType: 'barcode',
        value: 'WBH-001',
        unit: 'sku',
        location: { warehouse: 'Main Warehouse', zone: 'Checkout Station' },
        productId: createdProducts[0]._id,
        metadata: {
          scanType: 'checkout',
          quantity: 1,
          employeeId: 'EMP_001'
        },
        alert: { isTriggered: false },
        createdAt: new Date(Date.now() - 600000) // 10 min ago
      }
    ];

    await IoTReading.insertMany(iotReadings);

    // Create sample orders with various statuses
    const sampleOrders = [
      {
        orderNumber: 'ORD-001',
        user: customers[0]._id, // John Doe
        items: [
          {
            product: createdProducts[0]._id, // Wireless Headphones
            quantity: 1,
            price: createdProducts[0].price,
            name: createdProducts[0].name
          },
          {
            product: createdProducts[3]._id, // Wireless Charging Pad
            quantity: 2,
            price: createdProducts[3].price,
            name: createdProducts[3].name
          }
        ],
        totalAmount: createdProducts[0].price + (createdProducts[3].price * 2),
        status: 'delivered',
        paymentMethod: 'card',
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
        deliveredAt: new Date(Date.now() - 86400000 * 2) // 2 days ago
      },
      {
        orderNumber: 'ORD-002',
        user: customers[1]._id, // Sarah Wilson
        items: [
          {
            product: createdProducts[1]._id, // Gaming Laptop
            quantity: 1,
            price: createdProducts[1].price,
            name: createdProducts[1].name
          }
        ],
        totalAmount: createdProducts[1].price,
        status: 'shipped',
        paymentMethod: 'paypal',
        shippingAddress: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
        shippedAt: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        orderNumber: 'ORD-003',
        user: customers[2]._id, // Mike Chen
        items: [
          {
            product: createdProducts[4]._id, // Smart Fitness Watch
            quantity: 1,
            price: createdProducts[4].price,
            name: createdProducts[4].name
          },
          {
            product: createdProducts[10]._id, // Yoga Mat
            quantity: 1,
            price: createdProducts[10].price,
            name: createdProducts[10].name
          }
        ],
        totalAmount: createdProducts[4].price + createdProducts[10].price,
        status: 'processing',
        paymentMethod: 'card',
        shippingAddress: {
          street: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        },
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        orderNumber: 'ORD-004',
        user: customers[3]._id, // Emily Johnson
        items: [
          {
            product: createdProducts[6]._id, // Cotton T-Shirt
            quantity: 3,
            price: createdProducts[6].price,
            name: createdProducts[6].name
          },
          {
            product: createdProducts[12]._id, // Laptop Backpack
            quantity: 1,
            price: createdProducts[12].price,
            name: createdProducts[12].name
          }
        ],
        totalAmount: (createdProducts[6].price * 3) + createdProducts[12].price,
        status: 'pending',
        paymentMethod: 'cash',
        shippingAddress: {
          street: '321 Elm St',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          country: 'USA'
        },
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        orderNumber: 'ORD-005',
        user: customers[4]._id, // David Rodriguez
        items: [
          {
            product: createdProducts[14]._id, // JavaScript Book
            quantity: 1,
            price: createdProducts[14].price,
            name: createdProducts[14].name
          }
        ],
        totalAmount: createdProducts[14].price,
        status: 'cancelled',
        paymentMethod: 'card',
        shippingAddress: {
          street: '654 Maple Dr',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          country: 'USA'
        },
        createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
        cancelledAt: new Date(Date.now() - 86400000 * 4) // 4 days ago
      }
    ];

    await Order.insertMany(sampleOrders);

    console.log('✅ Comprehensive seed data created successfully!');
    console.log('');
    console.log('📊 SUMMARY:');
    console.log(`👥 Users: 1 admin + ${customers.length} customers`);
    console.log(`📦 Products: ${products.length} items across ${[...new Set(products.map(p => p.category))].length} categories`);
    console.log(`🌐 IoT Devices: ${iotDevices.length} devices (${[...new Set(iotDevices.map(d => d.type))].length} types)`);
    console.log(`📈 IoT Readings: ${iotReadings.length} readings with ${iotReadings.filter(r => r.alert.isTriggered).length} active alerts`);
    console.log(`📋 Orders: ${sampleOrders.length} orders with various statuses`);
    console.log('');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('Admin: admin@example.com / password123');
    console.log('Customers: john@example.com, sarah@example.com, mike@example.com, emily@example.com, david@example.com / password123');
    console.log('');
    console.log('🧪 TEST SCENARIOS COVERED:');
    console.log('• Low stock products (Gaming Laptop: 3 units, Resistance Bands: 1 unit)');
    console.log('• Out of stock products (Smartphone, Denim Jeans, Phone Case)');
    console.log('• Temperature alerts (Zone B: 36.8°C, Cold Storage: 12.5°C)');
    console.log('• Humidity alerts (Zone C: 25%)');
    console.log('• Critical inventory alerts (Resistance Bands: 1 unit)');
    console.log('• Device status variations (active, maintenance, error, offline)');
    console.log('• Order statuses (pending, processing, shipped, delivered, cancelled)');
    console.log('• All IoT sensor types (temperature, humidity, RFID, weight, motion, camera, barcode)');
    console.log('');
    console.log('🚀 Ready to test all features!');

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