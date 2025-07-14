const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Get inventory status
router.get('/status', protect, admin, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lt: ['$inventory.quantity', '$inventory.lowStockThreshold'] }
    });
    
    const totalProducts = await Product.countDocuments();
    const outOfStockProducts = await Product.countDocuments({
      'inventory.quantity': 0
    });
    
    res.json({
      totalProducts,
      outOfStockProducts,
      lowStockProducts,
      lowStockCount: lowStockProducts.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update inventory (for IoT integration)
router.post('/update', protect, admin, async (req, res) => {
  try {
    const { sku, quantity, operation = 'set' } = req.body;
    
    const product = await Product.findOne({ 'inventory.sku': sku });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (operation === 'set') {
      product.inventory.quantity = quantity;
    } else if (operation === 'add') {
      product.inventory.quantity += quantity;
    } else if (operation === 'subtract') {
      product.inventory.quantity = Math.max(0, product.inventory.quantity - quantity);
    }
    
    await product.save();
    
    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit('inventory-updated', {
        productId: product._id,
        sku: product.inventory.sku,
        quantity: product.inventory.quantity,
        isLowStock: product.inventory.quantity <= product.inventory.lowStockThreshold
      });
    }
    
    res.json({
      message: 'Inventory updated',
      product: {
        id: product._id,
        name: product.name,
        sku: product.inventory.sku,
        quantity: product.inventory.quantity
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk inventory update (for IoT systems)
router.post('/bulk-update', protect, admin, async (req, res) => {
  try {
    const { updates } = req.body; // Array of {sku, quantity, operation}
    
    const results = [];
    
    for (const update of updates) {
      const { sku, quantity, operation = 'set' } = update;
      
      const product = await Product.findOne({ 'inventory.sku': sku });
      if (!product) {
        results.push({ sku, error: 'Product not found' });
        continue;
      }
      
      if (operation === 'set') {
        product.inventory.quantity = quantity;
      } else if (operation === 'add') {
        product.inventory.quantity += quantity;
      } else if (operation === 'subtract') {
        product.inventory.quantity = Math.max(0, product.inventory.quantity - quantity);
      }
      
      await product.save();
      
      results.push({
        sku,
        success: true,
        newQuantity: product.inventory.quantity
      });
      
      // Emit socket event for each update
      if (req.io) {
        req.io.emit('inventory-updated', {
          productId: product._id,
          sku: product.inventory.sku,
          quantity: product.inventory.quantity,
          isLowStock: product.inventory.quantity <= product.inventory.lowStockThreshold
        });
      }
    }
    
    res.json({
      message: 'Bulk inventory update completed',
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 