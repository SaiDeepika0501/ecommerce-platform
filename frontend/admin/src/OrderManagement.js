import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderManagement.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: '#f39c12' },
    { value: 'confirmed', label: 'Confirmed', color: '#3498db' },
    { value: 'processing', label: 'Processing', color: '#9b59b6' },
    { value: 'shipped', label: 'Shipped', color: '#e67e22' },
    { value: 'delivered', label: 'Delivered', color: '#27ae60' },
    { value: 'cancelled', label: 'Cancelled', color: '#e74c3c' }
  ];

  // Socket.IO setup for real-time updates
  useEffect(() => {
    const initSocket = async () => {
      try {
        const io = await import('socket.io-client');
        const newSocket = io.default('http://localhost:5000');
        
        newSocket.on('connect', () => {
          console.log('🔗 Admin Orders: Connected to server for real-time updates');
        });

        newSocket.on('order-created', (data) => {
          console.log('🛍️ Admin Orders: New order created:', data);
          // Refetch orders when a new order is created
          fetchOrders();
        });

        newSocket.on('order-status-updated', (data) => {
          console.log('📋 Admin Orders: Order status updated:', data);
          // Update specific order in the list
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order._id === data.orderId 
                ? { ...order, status: data.status }
                : order
            )
          );
        });

        newSocket.on('disconnect', () => {
          console.log('🔌 Admin Orders: Disconnected from server');
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    initSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/orders/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setStatusUpdateLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('order-status-updated', { orderId, status: newStatus });
      }
      
      setError('');
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : '#6c757d';
  };

  const getStatusLabel = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateOrderTotal = (order) => {
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const showOrderDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetailsModal = () => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  };

  const handleFilterClick = (filterValue) => {
    setFilter(filterValue);
  };

  // Filter orders based on search term and filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user.firstName && order.user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user.lastName && order.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filter === 'all' || order.status === filter;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="order-management">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-management">
      <div className="order-management-header">
        <h2>Order Management</h2>
        <div className="real-time-indicator">
          <span className={`status-dot ${socket ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">
            {socket ? '🔴 Live Updates' : '⚪ Offline'}
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="order-stats">
        <div 
          className={`stat-card clickable ${filter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          <h3>{orders.length}</h3>
          <p>Total Orders</p>
        </div>
        <div 
          className={`stat-card clickable ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => handleFilterClick('pending')}
        >
          <h3>{orders.filter(o => o.status === 'pending').length}</h3>
          <p>Pending</p>
        </div>
        <div 
          className={`stat-card clickable ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => handleFilterClick('confirmed')}
        >
          <h3>{orders.filter(o => o.status === 'confirmed').length}</h3>
          <p>Confirmed</p>
        </div>
        <div 
          className={`stat-card clickable ${filter === 'processing' ? 'active' : ''}`}
          onClick={() => handleFilterClick('processing')}
        >
          <h3>{orders.filter(o => o.status === 'processing').length}</h3>
          <p>Processing</p>
        </div>
        <div 
          className={`stat-card clickable ${filter === 'shipped' ? 'active' : ''}`}
          onClick={() => handleFilterClick('shipped')}
        >
          <h3>{orders.filter(o => o.status === 'shipped').length}</h3>
          <p>Shipped</p>
        </div>
        <div 
          className={`stat-card clickable ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => handleFilterClick('delivered')}
        >
          <h3>{orders.filter(o => o.status === 'delivered').length}</h3>
          <p>Delivered</p>
        </div>
        <div 
          className={`stat-card clickable ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => handleFilterClick('cancelled')}
        >
          <h3>{orders.filter(o => o.status === 'cancelled').length}</h3>
          <p>Cancelled</p>
        </div>
      </div>

      <div className="order-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Order ID, email, or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Orders</option>
            {orderStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
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
                <td className="order-id">#{order._id.slice(-8).toUpperCase()}</td>
                <td className="customer-info">
                  <div className="customer-details">
                    <span className="customer-name">
                      {order.user.firstName || order.user.lastName 
                        ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
                        : 'Customer'}
                    </span>
                    <span className="customer-email">{order.user.email}</span>
                  </div>
                </td>
                <td className="order-date">{formatDate(order.createdAt)}</td>
                <td className="order-items">{order.items.length} items</td>
                <td className="order-total">${calculateOrderTotal(order).toFixed(2)}</td>
                <td className="order-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="order-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => showOrderDetailsModal(order)}
                  >
                    View
                  </button>
                  <select
                    className="status-select"
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    disabled={statusUpdateLoading}
                  >
                    {orderStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="no-orders">
            <p>No orders found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay" onClick={closeOrderDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details - #{selectedOrder._id.slice(-8).toUpperCase()}</h3>
              <button className="close-btn" onClick={closeOrderDetailsModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="order-details-grid">
                <div className="customer-section">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.user.firstName || selectedOrder.user.lastName 
                    ? `${selectedOrder.user.firstName || ''} ${selectedOrder.user.lastName || ''}`.trim()
                    : 'Customer'}</p>
                  <p><strong>Email:</strong> {selectedOrder.user.email}</p>
                  <p><strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>Status:</strong> 
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedOrder.status), marginLeft: '8px' }}
                    >
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </p>
                </div>

                <div className="shipping-section">
                  <h4>Shipping Address</h4>
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              <div className="order-items-section">
                <h4>Order Items</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="order-summary-section">
                <h4>Order Summary</h4>
                <div className="summary-row">
                  <span>Total Amount:</span>
                  <span className="total-amount">${calculateOrderTotal(selectedOrder).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Payment Method:</span>
                  <span>{selectedOrder.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <select
                className="status-select modal-status-select"
                value={selectedOrder.status}
                onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                disabled={statusUpdateLoading}
              >
                {orderStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <button className="close-modal-btn" onClick={closeOrderDetailsModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement; 