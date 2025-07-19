import React, { useState, useEffect } from 'react';
import UserManagement from './UserManagement';
import OrderManagement from './OrderManagement';
import InventoryManagement from './InventoryManagement';
import IoTDashboard from './IoTDashboard';
import { formatINR } from './utils/currency';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // Get initial tab from URL parameter
  const getInitialTab = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (['users', 'orders', 'inventory', 'iot'].includes(tabParam)) {
      return tabParam;
    }
    return 'users'; // Default tab
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch users stats - correct endpoint
      const usersResponse = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const users = usersResponse.ok ? await usersResponse.json() : [];
      
      // Fetch orders stats - correct endpoint
      const ordersResponse = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let orders = [];
      if (ordersResponse.ok) {
        const orderData = await ordersResponse.json();
        // Handle both array format and paginated format
        orders = Array.isArray(orderData) ? orderData : (orderData.orders || []);
      }
      
      // Fetch products stats - correct endpoint and handle pagination
      const productsResponse = await fetch('http://localhost:5000/api/products?limit=1000'); // Get all products
      let products = [];
      if (productsResponse.ok) {
        const productData = await productsResponse.json();
        // Handle both array format and paginated format
        products = Array.isArray(productData) ? productData : (productData.products || []);
      }
      
      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const lowStockProducts = products.filter(product => {
        const stock = product.stock || product.inventory?.quantity || 0;
        const threshold = product.lowStockThreshold || product.inventory?.lowStockThreshold || 10;
        return stock > 0 && stock <= threshold;
      });
      const outOfStockProducts = products.filter(product => {
        const stock = product.stock || product.inventory?.quantity || 0;
        return stock === 0;
      });
      
      setStats({
        totalUsers: users.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL parameter without page reload
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement stats={stats} onRefresh={fetchDashboardStats} />;
      case 'orders':
        return <OrderManagement stats={stats} onRefresh={fetchDashboardStats} />;
      case 'inventory':
        return <InventoryManagement stats={stats} onRefresh={fetchDashboardStats} />;
      case 'iot':
        return <IoTDashboard />;
      default:
        return <UserManagement stats={stats} onRefresh={fetchDashboardStats} />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-info">
          <span>Welcome, Admin</span>
          <button className="refresh-dashboard" onClick={fetchDashboardStats}>
            🔄 Refresh
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          👥 Users Management
          <span className="tab-badge">{stats.totalUsers}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => handleTabChange('orders')}
        >
          📋 Orders Management
          <span className="tab-badge">{stats.totalOrders}</span>
          {stats.pendingOrders > 0 && (
            <span className="alert-badge">{stats.pendingOrders}</span>
          )}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => handleTabChange('inventory')}
        >
          📦 Inventory Management
          <span className="tab-badge">{stats.totalProducts}</span>
          {stats.lowStockCount > 0 && (
            <span className="warning-badge">{stats.lowStockCount}</span>
          )}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'iot' ? 'active' : ''}`}
          onClick={() => handleTabChange('iot')}
        >
          🌐 IoT Management
        </button>
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard; 