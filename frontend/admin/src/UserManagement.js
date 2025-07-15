import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = ({ stats, onRefresh }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, filterStatus, sortBy, sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      } else {
        console.error('Failed to fetch users');
        // Mock data for demo
        setUsers([
          { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'customer', isActive: true, createdAt: '2024-01-15', lastLogin: '2024-01-20' },
          { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'customer', isActive: true, createdAt: '2024-01-10', lastLogin: '2024-01-18' },
          { _id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'customer', isActive: false, createdAt: '2024-01-05', lastLogin: '2024-01-12' },
          { _id: '4', name: 'Admin User', email: 'admin@example.com', role: 'admin', isActive: true, createdAt: '2024-01-01', lastLogin: '2024-01-20' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Status filter
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'lastLogin') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isActive: !currentStatus } : user
        ));
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId));
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const promoteToAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to promote this user to admin?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'admin' })
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: 'admin' } : user
        ));
        onRefresh();
      }
    } catch (error) {
      console.error('Error promoting user:', error);
    }
  };

  const activeUsers = users.filter(user => user.isActive).length;
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const customerUsers = users.filter(user => user.role === 'customer').length;

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>👥 Users Management</h2>
        <button className="refresh-btn" onClick={fetchUsers} disabled={loading}>
          {loading ? '🔄 Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalUsers || users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{activeUsers}</h3>
            <p>Active Users</p>
          </div>
        </div>
        <div className="stat-card admin">
          <div className="stat-icon">👑</div>
          <div className="stat-info">
            <h3>{adminUsers}</h3>
            <p>Administrators</p>
          </div>
        </div>
        <div className="stat-card customer">
          <div className="stat-icon">🛍️</div>
          <div className="stat-info">
            <h3>{customerUsers}</h3>
            <p>Customers</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="customer">Customers</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="createdAt">Sort by Join Date</option>
            <option value="name">Sort by Name</option>
            <option value="lastLogin">Sort by Last Login</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-toggle"
          >
            {sortOrder === 'asc' ? '⬆️' : '⬇️'}
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id} className={user.isActive ? 'user-active' : 'user-inactive'}>
                <td className="user-info">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? '👑 Admin' : '🛍️ Customer'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? '✅ Active' : '❌ Inactive'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                <td className="user-actions">
                  <button
                    onClick={() => toggleUserStatus(user._id, user.isActive)}
                    className={`action-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                    title={user.isActive ? 'Deactivate User' : 'Activate User'}
                  >
                    {user.isActive ? '🚫' : '✅'}
                  </button>
                  {user.role === 'customer' && (
                    <button
                      onClick={() => promoteToAdmin(user._id)}
                      className="action-btn promote"
                      title="Promote to Admin"
                    >
                      👑
                    </button>
                  )}
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="action-btn delete"
                    title="Delete User"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-results">
            <p>No users found matching your criteria.</p>
          </div>
        )}
      </div>

      <div className="results-info">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
};

export default UserManagement; 