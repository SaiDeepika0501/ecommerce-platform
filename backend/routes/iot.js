const express = require('express');
const router = express.Router();
const IoTDevice = require('../models/IoTDevice');
const IoTReading = require('../models/IoTReading');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { protect, admin } = auth;

// Get all IoT devices
router.get('/devices', protect, async (req, res) => {
  try {
    const devices = await IoTDevice.find()
      .populate('productId', 'name price')
      .sort({ createdAt: -1 });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get device by ID
router.get('/devices/:deviceId', protect, async (req, res) => {
  try {
    const device = await IoTDevice.findOne({ deviceId: req.params.deviceId })
      .populate('productId', 'name price inventory');
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new IoT device
router.post('/devices', protect, async (req, res) => {
  try {
    const device = new IoTDevice(req.body);
    await device.save();
    res.status(201).json(device);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update device status
router.patch('/devices/:deviceId/status', protect, async (req, res) => {
  try {
    const { status, isOnline, batteryLevel } = req.body;
    
    const device = await IoTDevice.findOneAndUpdate(
      { deviceId: req.params.deviceId },
      { 
        status, 
        isOnline, 
        batteryLevel,
        'lastReading.timestamp': new Date()
      },
      { new: true }
    );
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit sensor reading (for IoT devices)
router.post('/readings', async (req, res) => {
  try {
    const { deviceId, sensorType, value, unit, metadata, productId } = req.body;
    
    // Find the device
    const device = await IoTDevice.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    // Create reading
    const reading = new IoTReading({
      deviceId,
      sensorType,
      value,
      unit,
      location: device.location,
      productId: productId || device.productId,
      metadata
    });
    
    // Check for alerts
    if (device.alertThresholds) {
      const numValue = parseFloat(value);
      if (numValue < device.alertThresholds.min || numValue > device.alertThresholds.max) {
        reading.alert = {
          isTriggered: true,
          level: numValue < device.alertThresholds.min ? 'low' : 'high',
          message: `${sensorType} reading ${value}${unit} is outside threshold range`
        };
      }
    }
    
    await reading.save();
    
    // Update device's last reading
    device.lastReading = {
      value,
      timestamp: new Date(),
      unit
    };
    device.isOnline = true;
    await device.save();
    
    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('iot-reading', {
        deviceId,
        sensorType,
        value,
        unit,
        timestamp: reading.createdAt,
        alert: reading.alert
      });
    }
    
    res.status(201).json(reading);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get readings for a device
router.get('/devices/:deviceId/readings', protect, async (req, res) => {
  try {
    const { limit = 50, startDate, endDate } = req.query;
    
    let query = { deviceId: req.params.deviceId };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const readings = await IoTReading.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('productId', 'name');
    
    res.json(readings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all IoT readings with filtering
router.get('/readings', protect, async (req, res) => {
  try {
    const { 
      limit = 50, 
      startDate, 
      endDate, 
      deviceType, 
      deviceId, 
      alertsOnly 
    } = req.query;
    
    let query = {};
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Filter by device type (sensor type)
    if (deviceType && deviceType !== 'all') {
      query.sensorType = deviceType;
    }
    
    // Filter by specific device
    if (deviceId && deviceId !== 'all') {
      query.deviceId = deviceId;
    }
    
    // Filter by alerts only
    if (alertsOnly === 'true') {
      query['alert.isTriggered'] = true;
    }
    
    const readings = await IoTReading.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('productId', 'name');
    
    // Manually lookup device info for readings
    for (let reading of readings) {
      const device = await IoTDevice.findOne({ deviceId: reading.deviceId });
      reading.deviceInfo = device ? { name: device.name, type: device.type } : null;
    }
    
    res.json(readings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active alerts
router.get('/alerts', protect, async (req, res) => {
  try {
    const alerts = await IoTReading.find({ 'alert.isTriggered': true })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('productId', 'name');
    
    // Manually lookup device info for alerts
    for (let alert of alerts) {
      const device = await IoTDevice.findOne({ deviceId: alert.deviceId });
      alert.deviceInfo = device ? { name: device.name, type: device.type } : null;
    }
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get IoT dashboard data
router.get('/dashboard', protect, async (req, res) => {
  try {
    const totalDevices = await IoTDevice.countDocuments();
    const onlineDevices = await IoTDevice.countDocuments({ isOnline: true });
    const activeAlerts = await IoTReading.countDocuments({ 'alert.isTriggered': true });
    
    const recentReadings = await IoTReading.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('productId', 'name');
    
    // Manually lookup device info for readings
    for (let reading of recentReadings) {
      const device = await IoTDevice.findOne({ deviceId: reading.deviceId });
      reading.deviceInfo = device ? { name: device.name, type: device.type } : null;
    }
    
    const devicesByType = await IoTDevice.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    res.json({
      summary: {
        totalDevices,
        onlineDevices,
        offlineDevices: totalDevices - onlineDevices,
        activeAlerts
      },
      recentReadings,
      devicesByType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RFID product scan simulation
router.post('/rfid/scan', async (req, res) => {
  try {
    const { deviceId, rfidTag, location } = req.body;
    
    // Find product by RFID tag (assuming it's stored in product description or custom field)
    const product = await Product.findOne({ 
      $or: [
        { 'metadata.rfidTag': rfidTag },
        { description: { $regex: rfidTag, $options: 'i' } }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found for RFID tag' });
    }
    
    // Create RFID reading
    const reading = new IoTReading({
      deviceId,
      sensorType: 'rfid',
      value: rfidTag,
      unit: 'tag',
      location,
      productId: product._id,
      metadata: {
        scanType: 'product_identification',
        productName: product.name
      }
    });
    
    await reading.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('rfid-scan', {
        deviceId,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price
        },
        location,
        timestamp: reading.createdAt
      });
    }
    
    res.json({
      success: true,
      product,
      reading
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Smart inventory weight monitoring
router.post('/weight/update', async (req, res) => {
  try {
    const { deviceId, weight, productId, shelfId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Calculate estimated quantity based on weight
    const unitWeight = product.metadata?.unitWeight || 1; // kg
    const estimatedQuantity = Math.floor(weight / unitWeight);
    
    // Create weight reading
    const reading = new IoTReading({
      deviceId,
      sensorType: 'weight',
      value: weight,
      unit: 'kg',
      productId,
      metadata: {
        shelfId,
        estimatedQuantity,
        unitWeight
      }
    });
    
    // Check for low stock alert
    if (estimatedQuantity < product.inventory.lowStockThreshold) {
      reading.alert = {
        isTriggered: true,
        level: estimatedQuantity === 0 ? 'critical' : 'medium',
        message: `Low stock detected: ${estimatedQuantity} units remaining`
      };
    }
    
    await reading.save();
    
    // Update product inventory if significantly different
    const inventoryDiff = Math.abs(product.inventory.quantity - estimatedQuantity);
    if (inventoryDiff > 5) { // Only update if difference is significant
      product.inventory.quantity = estimatedQuantity;
      product.inventory.lastUpdated = new Date();
      await product.save();
      
      // Emit inventory update
      const io = req.app.get('io');
      if (io) {
        io.emit('inventory-update', {
          productId: product._id,
          newQuantity: estimatedQuantity,
          method: 'iot_weight_sensor'
        });
      }
    }
    
    res.json({
      success: true,
      weight,
      estimatedQuantity,
      reading
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 