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

  const checkout = async () => {
    try {
      setOrderLoading(true);
      const token = localStorage.getItem('token');
      
      const orderData = {
        shippingAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        },
        paymentMethod: 'card'
      };

      await axios.post(
        'http://localhost:5000/api/orders',
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Order placed successfully!');
      setCart({ items: [], totalAmount: 0 });
    } catch (error) {
      alert('Error placing order');
      console.error('Error:', error);
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