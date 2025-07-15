import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatINR } from './utils/currency';
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserOrders();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your profile');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        address: response.data.address || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
      setEditing(false);
      setError('');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error && !user) {
    return (
      <div className="profile-error">
        <h2>Profile Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/'}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h1>User Profile</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="profile-content">
        <div className="profile-section">
          <div className="section-header">
            <h2>Personal Information</h2>
            <button 
              onClick={() => setEditing(!editing)} 
              className="edit-btn"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address:</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <button type="submit" className="save-btn">Save Changes</button>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <strong>Name:</strong> {user?.name || 'Not provided'}
              </div>
              <div className="info-item">
                <strong>Email:</strong> {user?.email || 'Not provided'}
              </div>
              <div className="info-item">
                <strong>Address:</strong> {user?.address || 'Not provided'}
              </div>
              <div className="info-item">
                <strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>Order History</h2>
          {orders.length === 0 ? (
            <p className="no-orders">No orders found</p>
          ) : (
            <div className="orders-list">
              {orders.slice(0, 5).map((order) => (
                <div key={order._id} className="order-item">
                  <div className="order-header">
                    <span className="order-id">Order #{order._id.slice(-6)}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="order-details">
                    <span className="order-total">{formatINR(order.totalAmount || 0)}</span>
                    <span className={`order-status ${order.status?.toLowerCase()}`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length > 5 && (
                <button className="view-all-orders">View All Orders</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 