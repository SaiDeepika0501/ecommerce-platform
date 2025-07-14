import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view cart');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
      setError('');
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Please login to view cart');
      } else {
        setError('Error fetching cart');
      }
      // Error occurred while fetching cart
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/cart/update/${itemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data);
    } catch (error) {
      alert('Error updating cart');
      console.error('Error:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:5000/api/cart/remove/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data);
    } catch (error) {
      alert('Error removing item');
      console.error('Error:', error);
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete('http://localhost:5000/api/cart/clear', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
    } catch (error) {
      alert('Error clearing cart');
      console.error('Error:', error);
    }
  };

  const checkout = async () => {
    try {
      setOrderLoading(true);
      const token = localStorage.getItem('token');
      
      const shippingAddress = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      };

      const response = await axios.post(
        'http://localhost:5000/api/orders',
        {
          shippingAddress,
          paymentMethod: 'credit_card'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Order placed successfully!');
      setCart({ items: [], totalAmount: 0 });
    } catch (error) {
      alert(error.response?.data?.message || 'Error placing order');
      console.error('Error:', error);
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchCart}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <header className="cart-header">
        <h1>Your Cart</h1>
      </header>

      {cart.items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some products to your cart to get started!</p>
          <button 
            className="continue-shopping-btn"
            onClick={() => window.location.href = '/products'}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item._id} className="cart-item">
                <div className="item-image">
                  <img
                    src={item.product.images?.[0]?.url || '/api/placeholder/100/100'}
                    alt={item.product.name}
                    onError={(e) => {
                      e.target.src = '/api/placeholder/100/100';
                    }}
                  />
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">{item.product.name}</h3>
                  <p className="item-description">{item.product.description}</p>
                  <div className="item-info">
                    <span className="item-price">${item.price}</span>
                    <span className="item-sku">SKU: {item.product.inventory.sku}</span>
                  </div>
                  
                  <div className="inventory-status">
                    <span className={`stock-badge ${item.product.inventory.quantity <= 0 ? 'out-of-stock' : 
                      item.product.inventory.quantity <= item.product.inventory.lowStockThreshold ? 'low-stock' : 'in-stock'}`}>
                      {item.product.inventory.quantity <= 0 ? 'Out of Stock' : 
                       item.product.inventory.quantity <= item.product.inventory.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                    </span>
                    <span className="available-stock">
                      {item.product.inventory.quantity} available
                    </span>
                  </div>
                </div>
                
                <div className="item-actions">
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.inventory.quantity}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="item-total">
                    <span className="total-label">Total:</span>
                    <span className="total-amount">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  
                  <button 
                    className="remove-btn"
                    onClick={() => removeItem(item._id)}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="summary-header">
              <h2>Order Summary</h2>
            </div>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Items ({cart.items.length})</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="cart-actions">
              <button 
                className="clear-cart-btn"
                onClick={clearCart}
                disabled={cart.items.length === 0}
              >
                Clear Cart
              </button>
              <button 
                className="checkout-btn"
                onClick={checkout}
                disabled={orderLoading || cart.items.length === 0}
              >
                {orderLoading ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 