import React, { useState, useEffect } from 'react';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import UserManagement from './UserManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch products count
      const productsResponse = await fetch('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const productsData = await productsResponse.json();
      
      // Fetch orders count
      const ordersResponse = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersResponse.json();

      setStats({
        totalProducts: productsData.products?.length || 0,
        totalUsers: 156, // Mock data
        totalOrders: ordersData.length || 0,
        totalRevenue: ordersData.reduce((sum, order) => sum + order.total, 0) || 0
      });
    } catch (error) {
      // Silently handle error in production
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'users':
        return <UserManagement />;
      default:
        return <DashboardOverview stats={stats} />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 Products
          </button>
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📋 Orders
          </button>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
        </nav>
      </div>
      <div className="admin-content">
        {renderActiveTab()}
      </div>
    </div>
  );
};

const DashboardOverview = ({ stats }) => (
  <div className="dashboard-overview">
    <h1>Dashboard Overview</h1>
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">📦</div>
        <div className="stat-content">
          <div className="stat-number">{stats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-content">
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📋</div>
        <div className="stat-content">
          <div className="stat-number">{stats.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-content">
          <div className="stat-number">${stats.totalRevenue.toFixed(2)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
      </div>
    </div>
    <div className="recent-activity">
      <h2>Recent Activity</h2>
      <div className="activity-list">
        <div className="activity-item">
          <span className="activity-time">2 hours ago</span>
          <span className="activity-text">New order #1001 received</span>
        </div>
        <div className="activity-item">
          <span className="activity-time">4 hours ago</span>
          <span className="activity-text">Product inventory updated</span>
        </div>
        <div className="activity-item">
          <span className="activity-time">6 hours ago</span>
          <span className="activity-text">New user registered</span>
        </div>
      </div>
    </div>
  </div>
);



export default AdminDashboard; 