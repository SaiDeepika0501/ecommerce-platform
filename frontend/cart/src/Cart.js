import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { formatINR } from './utils/currency';
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
    } catch (error) {
      setError('Error fetching cart');
      console.error('Error:', error);
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
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      setCart(response.data);
      
      // Show success notification
      if (window.notificationAPI) {
        window.notificationAPI.success('Cart updated successfully');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      
      const errorMessage = error.response?.data?.message || 'Error updating cart';
      
      // Show error notification
      if (window.notificationAPI) {
        window.notificationAPI.error(errorMessage);
      } else {
        alert(errorMessage);
      }
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:5000/api/cart/remove/${itemId}`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      setCart(response.data);
      
      // Show success notification
      if (window.notificationAPI) {
        window.notificationAPI.success('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      
      const errorMessage = error.response?.data?.message || 'Error removing item';
      
      // Show error notification
      if (window.notificationAPI) {
        window.notificationAPI.error(errorMessage);
      } else {
        alert(errorMessage);
      }
    }
  };

  const checkout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/orders',
        {},
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Clear cart after successful order
      setCart({ items: [], totalAmount: 0 });
      
      // Show success notification
      if (window.notificationAPI) {
        window.notificationAPI.success('Order placed successfully!');
      } else {
        alert('Order placed successfully!');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      
      const errorMessage = error.response?.data?.message || 'Error placing order';
      
      // Show error notification
      if (window.notificationAPI) {
        window.notificationAPI.error(errorMessage);
      } else {
        alert(errorMessage);
      }
    }
  };

  if (loading) return <div className="loading">Loading cart...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      
      {cart.items.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <a href="/products" className="btn btn-primary">Continue Shopping</a>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item._id} className="cart-item">
                <div className="item-info">
                  <h3>{item.product.name}</h3>
                  <p className="item-price">{formatINR(item.price)}</p>
                </div>
                <div className="item-controls">
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => removeItem(item._id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>Total: {formatINR(cart.totalAmount)}</h3>
            <button 
              onClick={checkout}
              className="checkout-btn"
              disabled={orderLoading}
            >
              {orderLoading ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 