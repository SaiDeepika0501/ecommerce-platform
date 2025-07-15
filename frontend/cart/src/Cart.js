import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { formatINR } from './utils/currency';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

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
      setOrderLoading(true);
      const token = localStorage.getItem('token');
      
      // Prepare order data with required fields
      const orderData = {
        paymentMethod,
        shippingAddress: {
          street: shippingAddress.street || 'Default Street',
          city: shippingAddress.city || 'Default City', 
          state: shippingAddress.state || 'Default State',
          zipCode: shippingAddress.zipCode || '000000',
          country: shippingAddress.country || 'India'
        }
      };

      const response = await axios.post(
        'http://localhost:5000/api/orders',
        orderData,
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
        window.notificationAPI.success(`Order placed successfully! Order #${response.data.orderNumber}`);
      } else {
        alert(`Order placed successfully! Order #${response.data.orderNumber}`);
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
    } finally {
      setOrderLoading(false);
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
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Total: {formatINR(cart.totalAmount)}</span>
            </div>
            
            <div className="payment-section">
              <h3>Payment Method</h3>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  💳 Credit/Debit Card
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  💰 PayPal
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  💵 Cash on Delivery
                </label>
              </div>
            </div>

            <div className="shipping-section">
              <h3>Shipping Address</h3>
              <div className="address-form">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                  className="address-input"
                />
                <div className="address-row">
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="address-input"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    className="address-input"
                  />
                </div>
                <div className="address-row">
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                    className="address-input"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                    className="address-input"
                  />
                </div>
              </div>
            </div>
            
            <button 
              onClick={checkout}
              className="checkout-btn"
              disabled={orderLoading}
            >
              {orderLoading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 