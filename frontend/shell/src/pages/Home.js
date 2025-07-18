import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { cart, cartItemCount } = useCart();
  const [iotSummary, setIotSummary] = useState(null);
  const [iotLoading, setIotLoading] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Fetch IoT summary for admin users
  useEffect(() => {
    if (isAdmin && isAuthenticated) {
      fetchIotSummary();
    }
  }, [isAdmin, isAuthenticated]);

  const fetchIotSummary = async () => {
    setIotLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [dashboardResponse, alertsResponse, devicesResponse] = await Promise.all([
        fetch('http://localhost:5000/api/iot/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/iot/alerts', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/iot/devices', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [dashboard, alerts, devices] = await Promise.all([
        dashboardResponse.json(),
        alertsResponse.json(),
        devicesResponse.json()
      ]);

      setIotSummary({
        totalDevices: devices.length,
        onlineDevices: devices.filter(d => d.isOnline).length,
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.alert?.level === 'critical').length,
        recentReadings: dashboard.recentReadings?.slice(0, 3) || []
      });
    } catch (error) {
      console.error('Failed to fetch IoT summary:', error);
      setIotSummary(null);
    }
    setIotLoading(false);
  };

  return (
    <div className="home">
      <div className="container">
        <div className="hero-section">
          {!isAuthenticated ? (
            // Not logged in - Marketing message
            <>
              <h1>Welcome to Modular E-Commerce</h1>
              <p>Experience seamless online shopping with our comprehensive e-commerce platform</p>
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary">Get Started</Link>
                <Link to="/login" className="btn btn-outline">Login</Link>
              </div>
            </>
          ) : isAdmin ? (
            // Admin user - Dashboard focus
            <>
              <h1>Welcome back, {user?.name}! 👋</h1>
              <p>Manage your e-commerce platform and monitor IoT infrastructure</p>
              <div className="hero-actions">
                <Link to="/admin" className="btn btn-primary">Admin Dashboard</Link>
                <a href="http://localhost:3005" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  IoT Management
                </a>
              </div>
            </>
          ) : (
            // Customer user - Shopping focus
            <>
              <h1>Hey {user?.name}! 🛍️</h1>
              <p>Ready to discover amazing products? Let's find what you're looking for!</p>
              <div className="hero-actions">
                <Link to="/products" className="btn btn-primary">Browse Products</Link>
                <Link to="/orders" className="btn btn-outline">My Orders</Link>
              </div>
            </>
          )}
        </div>

        {/* Quick Stats for Customers */}
        {isAuthenticated && !isAdmin && (
          <div className="customer-quick-stats">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🛒</div>
                <div className="stat-info">
                  <h3>{cartItemCount}</h3>
                  <p>Items in Cart</p>
                  {cartItemCount > 0 && (
                    <Link to="/cart" className="stat-link">View Cart →</Link>
                  )}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>₹{cart?.totalAmount ? (cart.totalAmount / 100).toFixed(2) : '0.00'}</h3>
                  <p>Cart Total</p>
                  {cart?.totalAmount > 0 && (
                    <Link to="/cart" className="stat-link">Checkout →</Link>
                  )}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>Browse</h3>
                  <p>New Products</p>
                  <Link to="/products" className="stat-link">Shop Now →</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Internship Project Credits - Only for non-authenticated users */}
        {!isAuthenticated && (
          <div className="dev-team-section">
          <div className="dev-team-content">
            <h2>🎓 Student Internship Project</h2>
            <p>This innovative e-commerce platform with IoT integration was developed as an academic internship project under professor guidance</p>
            <div className="dev-team-grid">
              <div className="dev-card">
                <div className="dev-avatar">👩‍🎓</div>
                <h3>Sai Deepika</h3>
                <p>Instrumentation and Control Engineering Student</p>
                <div className="dev-skills">
                  <span className="skill-tag">React</span>
                  <span className="skill-tag">Node.js</span>
                  <span className="skill-tag">IoT Integration</span>
                </div>
              </div>
              <div className="dev-card">
                <div className="dev-avatar">👩‍🎓</div>
                <h3>Sai Pravalika</h3>
                <p>Instrumentation and Control Engineering Student</p>
                <div className="dev-skills">
                  <span className="skill-tag">MongoDB</span>
                  <span className="skill-tag">Frontend Dev</span>
                  <span className="skill-tag">API Design</span>
                </div>
              </div>
            </div>
            <div className="dev-footer">
              <p>📚 Completed under academic supervision as part of internship curriculum</p>
            </div>
          </div>
        </div>
        )}

        {/* IoT Management Summary - Admin Only */}
        {isAdmin && isAuthenticated && (
          <div className="iot-summary-section">
            <h2>📡 IoT Management Overview</h2>
            <p>Real-time monitoring and management of your IoT infrastructure</p>
            
            {iotLoading ? (
              <div className="iot-loading">
                <div className="loading-spinner">🔄</div>
                <p>Loading IoT data...</p>
              </div>
            ) : iotSummary ? (
              <div className="iot-stats-grid">
                <div className="iot-stat-card">
                  <div className="stat-icon">📡</div>
                  <div className="stat-info">
                    <h3>{iotSummary.totalDevices}</h3>
                    <p>Total Devices</p>
                  </div>
                </div>
                
                <div className="iot-stat-card online">
                  <div className="stat-icon">🟢</div>
                  <div className="stat-info">
                    <h3>{iotSummary.onlineDevices}</h3>
                    <p>Online Devices</p>
                  </div>
                </div>
                
                <div className="iot-stat-card alerts">
                  <div className="stat-icon">🚨</div>
                  <div className="stat-info">
                    <h3>{iotSummary.totalAlerts}</h3>
                    <p>Active Alerts</p>
                  </div>
                </div>
                
                <div className="iot-stat-card critical">
                  <div className="stat-icon">🔴</div>
                  <div className="stat-info">
                    <h3>{iotSummary.criticalAlerts}</h3>
                    <p>Critical Issues</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="iot-error">
                <p>⚠️ Unable to load IoT data. Please check your connection.</p>
              </div>
            )}

            {iotSummary?.recentReadings?.length > 0 && (
              <div className="recent-readings">
                <h3>Recent Sensor Readings</h3>
                <div className="readings-grid">
                  {iotSummary.recentReadings.map((reading, index) => (
                    <div key={index} className="reading-card">
                      <div className="reading-device">{reading.deviceInfo?.name || reading.deviceId}</div>
                      <div className="reading-value">
                        {reading.value} {reading.unit}
                      </div>
                      <div className="reading-type">{reading.sensorType}</div>
                      {reading.alert?.isTriggered && (
                        <div className="reading-alert">🚨 {reading.alert.level}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="iot-actions">
              <a 
                href="http://localhost:3005" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                🔧 Open IoT Dashboard
              </a>
              <button 
                onClick={fetchIotSummary}
                className="btn btn-outline"
                disabled={iotLoading}
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default Home; 