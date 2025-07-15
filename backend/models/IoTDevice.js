const mongoose = require('mongoose');

const iotDeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['temperature', 'humidity', 'rfid', 'weight', 'motion', 'camera', 'barcode'],
    required: true
  },
  location: {
    warehouse: String,
    zone: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'error'],
    default: 'active'
  },
  lastReading: {
    value: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    },
    unit: String
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  alertThresholds: {
    min: Number,
    max: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('IoTDevice', iotDeviceSchema); 