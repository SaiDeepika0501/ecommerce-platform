const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id, isActive: true })
      .populate('items.product', 'name price images');
    
    if (!cart) {
      return res.json({ items: [], totalAmount: 0 });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check inventory
    if (product.inventory.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient inventory' });
    }
    
    let cart = await Cart.findOne({ user: req.user._id, isActive: true });
    
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [{
          product: productId,
          quantity,
          price: product.price
        }]
      });
    } else {
      // Check if item already exists in cart
      const existingItem = cart.items.find(item => 
        item.product.toString() === productId
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          price: product.price
        });
      }
    }
    
    await cart.save();
    await cart.populate('items.product', 'name price images');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update cart item quantity
router.put('/update/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user._id, isActive: true });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    if (quantity <= 0) {
      cart.items.pull(itemId);
    } else {
      item.quantity = quantity;
    }
    
    await cart.save();
    await cart.populate('items.product', 'name price images');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id, isActive: true });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate('items.product', 'name price images');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear cart
router.delete('/clear', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id, isActive: true });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    
    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 