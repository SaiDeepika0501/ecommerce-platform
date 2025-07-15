import React, { useState, useEffect } from 'react';
import { formatINR } from './utils/currency';
import './OrderManagement.css';

const OrderManagement = ({ stats, onRefresh }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [orderStats, setOrderStats] = useState({
    all: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, activeStatusTab, searchTerm, sortBy, sortOrder]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Handle both array format and paginated format
        const ordersData = Array.isArray(data) ? data : (data.orders || []);
        setOrders(ordersData);
        calculateOrderStats(ordersData);
      } else {
        console.error('Failed to fetch orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
    setLoading(false);
  };

  const calculateOrderStats = (ordersData) => {
    const stats = {
      all: ordersData.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    ordersData.forEach(order => {
      const status = order.status?.toLowerCase() || 'pending';
      if (stats.hasOwnProperty(status)) {
        stats[status]++;
      }
    });

    setOrderStats(stats);
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (activeStatusTab !== 'all') {
      filtered = filtered.filter(order => 
        order.status?.toLowerCase() === activeStatusTab
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort orders
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'orderNumber':
          valueA = a.orderNumber || '';
          valueB = b.orderNumber || '';
          break;
        case 'totalAmount':
          valueA = a.totalAmount || 0;
          valueB = b.totalAmount || 0;
          break;
        case 'createdAt':
        default:
          valueA = new Date(a.createdAt);
          valueB = new Date(b.createdAt);
          break;
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders(); // Refresh the list
        if (onRefresh) onRefresh();
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchOrders(); // Refresh the list
        if (onRefresh) onRefresh();
      } else {
        alert('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: '#ffc107',
      processing: '#17a2b8',
      shipped: '#007bff',
      delivered: '#28a745',
      cancelled: '#dc3545'
    };
    return statusColors[status?.toLowerCase()] || '#6c757d';
  };

  const statusTabs = [
    { key: 'all', label: 'All Orders', count: orderStats.all },
    { key: 'pending', label: 'Pending', count: orderStats.pending },
    { key: 'processing', label: 'Processing', count: orderStats.processing },
    { key: 'shipped', label: 'Shipped', count: orderStats.shipped },
    { key: 'delivered', label: 'Delivered', count: orderStats.delivered },
    { key: 'cancelled', label: 'Cancelled', count: orderStats.cancelled }
  ];

  return (
    <div className="order-management">
      <div className="management-header">
        <h2>📋 Order Management</h2>
        <button 
          onClick={fetchOrders} 
          className="refresh-btn" 
          disabled={loading}
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-number">{orderStats.all}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{orderStats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card processing">
          <div className="stat-number">{orderStats.processing}</div>
          <div className="stat-label">Processing</div>
        </div>
        <div className="stat-card delivered">
          <div className="stat-number">{orderStats.delivered}</div>
          <div className="stat-label">Delivered</div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="status-tabs">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            className={`status-tab ${activeStatusTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveStatusTab(tab.key)}
            style={{
              '--status-color': tab.key !== 'all' ? getStatusColor(tab.key) : '#007bff'
            }}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search and Sort Controls */}
      <div className="controls-section">
        <div className="search-section">
          <input
            type="text"
            placeholder="🔍 Search by order number, customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="sort-section">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="orderNumber">Sort by Order Number</option>
            <option value="totalAmount">Sort by Amount</option>
          </select>
          
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-direction"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-data">
            {activeStatusTab === 'all' ? 'No orders found' : `No ${activeStatusTab} orders found`}
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td className="order-number">{order.orderNumber}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{order.user?.name || 'N/A'}</div>
                      <div className="customer-email">{order.user?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td className="amount">{formatINR(order.totalAmount)}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <select 
                        value={order.status || 'pending'}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button 
                        onClick={() => deleteOrder(order._id)}
                        className="delete-btn"
                        title="Delete Order"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrderManagement; 