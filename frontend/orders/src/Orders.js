import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatINR } from './utils/currency';
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
        setError('Please log in to view your orders');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/orders/my-orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Ensure response.data is an array
      const ordersData = Array.isArray(response.data) ? response.data : [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'shipped': return '#fd7e14';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDelivery = (order) => {
    if (order.status === 'delivered') return 'Delivered';
    if (order.status === 'cancelled') return 'Cancelled';
    
    const orderDate = new Date(order.createdAt);
    const estimatedDate = new Date(orderDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
    
    return estimatedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>{orders.length} {orders.length === 1 ? 'order' : 'orders'} found</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h3>No orders yet</h3>
          <p>When you place your first order, it will appear here.</p>
          <a href="/products" className="shop-now-button">
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="order-status-container">
                  <span 
                    className="order-status" 
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p className="item-price">{formatINR(item.price)} each</p>
                    </div>
                    <div className="item-total">
                      {formatINR(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-details">
                  <div className="detail-item">
                    <span className="detail-label">Total:</span>
                    <span className="detail-value">{formatINR(order.totalAmount)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment:</span>
                    <span className="detail-value">{order.paymentMethod}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Delivery:</span>
                    <span className="detail-value">{getEstimatedDelivery(order)}</span>
                  </div>
                </div>
                
                {order.shippingAddress && (
                  <div className="shipping-address">
                    <h4>Shipping Address:</h4>
                    <p>
                      {order.shippingAddress.street}, {order.shippingAddress.city}<br/>
                      {order.shippingAddress.state} {order.shippingAddress.zipCode}<br/>
                      {order.shippingAddress.country}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders; 