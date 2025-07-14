import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view your orders');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        setError('Please login to view your orders');
      } else {
        setError('Error fetching orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#17a2b8';
      case 'processing': return '#6f42c1';
      case 'shipped': return '#fd7e14';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDelivery = (order) => {
    const orderDate = new Date(order.createdAt);
    const deliveryDate = new Date(orderDate);
    
    // Add estimated delivery days based on status
    const deliveryDays = order.status === 'delivered' ? 0 : 
                        order.status === 'shipped' ? 2 : 
                        order.status === 'processing' ? 4 : 7;
    
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
    
    return deliveryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchOrders}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <header className="orders-header">
        <h1>Your Orders</h1>
        <div className="real-time-indicator">
          <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">
            {connected ? '🔴 Live Updates' : '⚪ Offline'}
          </span>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h2>No orders yet</h2>
          <p>When you place your first order, it will appear here.</p>
          <button 
            className="continue-shopping-btn"
            onClick={() => window.location.href = '/products'}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3 className="order-number">Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="order-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              <div className="order-content">
                <div className="order-items">
                  <h4>Items ({order.items.length})</h4>
                  <div className="items-grid">
                    {order.items.map((item, index) => (
                      <div key={index} className="item-summary">
                        <div className="item-image">
                          <img
                            src={item.product?.images?.[0]?.url || '/api/placeholder/60/60'}
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = '/api/placeholder/60/60';
                            }}
                          />
                        </div>
                        <div className="item-details">
                          <p className="item-name">{item.name}</p>
                          <p className="item-quantity">Qty: {item.quantity}</p>
                          <p className="item-price">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="order-footer">
                <div className="delivery-info">
                  <h4>Delivery Information</h4>
                  <p className="delivery-address">
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p className="delivery-estimate">
                    {order.status === 'delivered' ? 
                      `Delivered on ${formatDate(order.updatedAt)}` : 
                      `Estimated delivery: ${getEstimatedDelivery(order)}`
                    }
                  </p>
                </div>

                <div className="order-actions">
                  <button 
                    className="track-order-btn"
                    onClick={() => alert(`Tracking Order #${order._id.slice(-8).toUpperCase()}`)}
                  >
                    Track Order
                  </button>
                  {order.status === 'delivered' && (
                    <button 
                      className="reorder-btn"
                      onClick={() => alert('Reorder functionality coming soon!')}
                    >
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders; 