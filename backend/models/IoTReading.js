const mongoose = require('mongoose');

const iotReadingSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    ref: 'IoTDevice'
  },
  sensorType: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  unit: String,
  location: {
    warehouse: String,
    zone: String
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  metadata: {
    temperature: Number,
    humidity: Number,
    pressure: Number,
    lightLevel: Number,
    vibration: Number
  },
  alert: {
    isTriggered: {
      type: Boolean,
      default: false
    },
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    message: String
  },
  processed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
iotReadingSchema.index({ deviceId: 1, createdAt: -1 });
iotReadingSchema.index({ productId: 1, createdAt: -1 });
iotReadingSchema.index({ 'alert.isTriggered': 1, createdAt: -1 });

module.exports = mongoose.model('IoTReading', iotReadingSchema); 