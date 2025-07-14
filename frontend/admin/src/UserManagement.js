import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const userRoles = [
    { value: 'customer', label: 'Customer', color: '#3498db' },
    { value: 'admin', label: 'Admin', color: '#e74c3c' },
    { value: 'moderator', label: 'Moderator', color: '#f39c12' }
  ];

  const userStatuses = [
    { value: 'active', label: 'Active', color: '#27ae60' },
    { value: 'inactive', label: 'Inactive', color: '#95a5a6' },
    { value: 'suspended', label: 'Suspended', color: '#e74c3c' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
      
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
      
      setError('');
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      
      setError('');
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from local state
      setUsers(users.filter(user => user._id !== userId));
      
      if (selectedUser && selectedUser._id === userId) {
        setShowUserDetails(false);
        setSelectedUser(null);
      }
      
      setError('');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter || user.status === filter;
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRoleColor = (role) => {
    const roleObj = userRoles.find(r => r.value === role);
    return roleObj ? roleObj.color : '#95a5a6';
  };

  const getStatusColor = (status) => {
    const statusObj = userStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : '#95a5a6';
  };

  const getRoleLabel = (role) => {
    const roleObj = userRoles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const getStatusLabel = (status) => {
    const statusObj = userStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const showUserDetailsModal = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>User Management</h2>
        <button 
          className="refresh-btn"
          onClick={fetchUsers}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="user-filters">
        <div className="filter-group">
          <label>Filter by:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Users</option>
            <optgroup label="Role">
              {userRoles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Status">
              {userStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="search-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="user-stats">
        <div 
          className={`stat-card clickable ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
        <div 
          className={`stat-card clickable ${filter === 'customer' ? 'active' : ''}`}
          onClick={() => setFilter('customer')}
        >
          <h3>{users.filter(u => u.role === 'customer').length}</h3>
          <p>Customers</p>
        </div>
        <div 
          className={`stat-card clickable ${filter === 'admin' ? 'active' : ''}`}
          onClick={() => setFilter('admin')}
        >
          <h3>{users.filter(u => u.role === 'admin').length}</h3>
          <p>Admins</p>
        </div>
        <div 
          className={`stat-card clickable ${filter === 'moderator' ? 'active' : ''}`}
          onClick={() => setFilter('moderator')}
        >
          <h3>{users.filter(u => u.role === 'moderator').length}</h3>
          <p>Moderators</p>
        </div>
        <div 
          className={`stat-card clickable ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          <h3>{users.filter(u => u.status === 'active').length}</h3>
          <p>Active</p>
        </div>
        <div 
          className={`stat-card clickable ${filter === 'inactive' ? 'active' : ''}`}
          onClick={() => setFilter('inactive')}
        >
          <h3>{users.filter(u => u.status === 'inactive').length}</h3>
          <p>Inactive</p>
        </div>
        <div 
          className={`stat-card clickable ${filter === 'suspended' ? 'active' : ''}`}
          onClick={() => setFilter('suspended')}
        >
          <h3>{users.filter(u => u.status === 'suspended').length}</h3>
          <p>Suspended</p>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {user.firstName || ''} {user.lastName || ''}
                      </div>
                      <div className="user-id">ID: {user._id.slice(-8)}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="user-email">{user.email}</span>
                </td>
                <td>
                  <span 
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(user.role) }}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(user.status || 'active') }}
                  >
                    {getStatusLabel(user.status || 'active')}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="view-btn"
                      onClick={() => showUserDetailsModal(user)}
                    >
                      👁️ View
                    </button>
                    <select
                      value={user.status || 'active'}
                      onChange={(e) => updateUserStatus(user._id, e.target.value)}
                      className="status-select"
                      disabled={actionLoading}
                    >
                      {userStatuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className="delete-btn"
                      onClick={() => deleteUser(user._id)}
                      disabled={actionLoading}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-users">
            <p>No users found.</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserDetails(false)}>
          <div className="user-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button 
                className="close-btn"
                onClick={() => setShowUserDetails(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="user-profile-section">
                <div className="profile-avatar">
                  {selectedUser.firstName?.[0]?.toUpperCase()}{selectedUser.lastName?.[0]?.toUpperCase()}
                </div>
                <div className="profile-info">
                  <h4>{selectedUser.firstName || ''} {selectedUser.lastName || ''}</h4>
                  <p>{selectedUser.email}</p>
                  <div className="profile-badges">
                    <span 
                      className="role-badge"
                      style={{ backgroundColor: getRoleColor(selectedUser.role) }}
                    >
                      {getRoleLabel(selectedUser.role)}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedUser.status || 'active') }}
                    >
                      {getStatusLabel(selectedUser.status || 'active')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="user-info-section">
                <h4>User Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>User ID:</label>
                    <span>{selectedUser._id}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="info-item">
                    <label>First Name:</label>
                    <span>{selectedUser.firstName || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <label>Last Name:</label>
                    <span>{selectedUser.lastName || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{selectedUser.phone || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <label>Date Joined:</label>
                    <span>{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className="info-item">
                    <label>Last Login:</label>
                    <span>{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email Verified:</label>
                    <span className={selectedUser.emailVerified ? 'verified' : 'not-verified'}>
                      {selectedUser.emailVerified ? '✅ Verified' : '❌ Not Verified'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedUser.address && (
                <div className="address-section">
                  <h4>Address Information</h4>
                  <div className="address-info">
                    <p>{selectedUser.address.street}</p>
                    <p>{selectedUser.address.city}, {selectedUser.address.state} {selectedUser.address.zipCode}</p>
                    <p>{selectedUser.address.country}</p>
                  </div>
                </div>
              )}

              <div className="user-actions-section">
                <h4>User Actions</h4>
                <div className="action-controls">
                  <div className="control-group">
                    <label>Role:</label>
                    <select
                      value={selectedUser.role}
                      onChange={(e) => updateUserRole(selectedUser._id, e.target.value)}
                      className="role-select"
                      disabled={actionLoading}
                    >
                      {userRoles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="control-group">
                    <label>Status:</label>
                    <select
                      value={selectedUser.status || 'active'}
                      onChange={(e) => updateUserStatus(selectedUser._id, e.target.value)}
                      className="status-control-select"
                      disabled={actionLoading}
                    >
                      {userStatuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="danger-zone">
                    <label>Danger Zone:</label>
                    <button
                      className="delete-user-btn"
                      onClick={() => deleteUser(selectedUser._id)}
                      disabled={actionLoading}
                    >
                      🗑️ Delete User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 