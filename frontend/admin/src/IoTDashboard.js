import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './IoTDashboard.css';

const IoTDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    summary: {},
    recentReadings: [],
    devicesByType: []
  });
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceReadings, setDeviceReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Simulate IoT device
  const [simulation, setSimulation] = useState({
    isRunning: false,
    deviceId: 'TEMP_001',
    sensorType: 'temperature',
    interval: 5000
  });

  useEffect(() => {
    fetchDashboardData();
    fetchDevices();
    fetchAlerts();
    
    // Setup real-time Socket.IO listeners
    if (window.io) {
      const socket = window.io();
      
      socket.on('iot-reading', handleNewReading);
      socket.on('rfid-scan', handleRfidScan);
      socket.on('inventory-update', handleInventoryUpdate);
      
      return () => {
        socket.off('iot-reading');
        socket.off('rfid-scan');
        socket.off('inventory-update');
      };
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/iot/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    }
  };

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/iot/devices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/iot/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setLoading(false);
    }
  };

  const fetchDeviceReadings = async (deviceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/iot/devices/${deviceId}/readings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeviceReadings(response.data);
    } catch (error) {
      console.error('Error fetching device readings:', error);
    }
  };

  const handleNewReading = (data) => {
    console.log('New IoT reading:', data);
    // Update dashboard in real-time
    fetchDashboardData();
    if (selectedDevice && selectedDevice.deviceId === data.deviceId) {
      fetchDeviceReadings(data.deviceId);
    }
  };

  const handleRfidScan = (data) => {
    console.log('RFID scan detected:', data);
    // Show notification or update UI
  };

  const handleInventoryUpdate = (data) => {
    console.log('Inventory updated via IoT:', data);
    // Update inventory displays
  };

  const simulateIoTData = async () => {
    if (!simulation.isRunning) return;

    try {
      const value = (20 + Math.random() * 15).toFixed(1); // Temperature between 20-35°C
      
      await axios.post('http://localhost:5000/api/iot/readings', {
        deviceId: simulation.deviceId,
        sensorType: simulation.sensorType,
        value: parseFloat(value),
        unit: '°C',
        metadata: {
          humidity: (40 + Math.random() * 40).toFixed(1),
          pressure: (1000 + Math.random() * 50).toFixed(1)
        }
      });
      
      console.log(`Simulated ${simulation.sensorType} reading: ${value}°C`);
    } catch (error) {
      console.error('Error sending simulated data:', error);
    }
  };

  useEffect(() => {
    let interval;
    if (simulation.isRunning) {
      interval = setInterval(simulateIoTData, simulation.interval);
    }
    return () => clearInterval(interval);
  }, [simulation]);

  const toggleSimulation = () => {
    setSimulation(prev => ({
      ...prev,
      isRunning: !prev.isRunning
    }));
  };

  const simulateRfidScan = async () => {
    try {
      const rfidTags = ['RFID_001', 'RFID_002', 'RFID_003'];
      const randomTag = rfidTags[Math.floor(Math.random() * rfidTags.length)];
      
      await axios.post('http://localhost:5000/api/iot/rfid/scan', {
        deviceId: 'RFID_READER_01',
        rfidTag: randomTag,
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Zone A'
        }
      });
      
      console.log('RFID scan simulated:', randomTag);
    } catch (error) {
      console.error('Error simulating RFID scan:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'inactive': return '#6c757d';
      case 'maintenance': return '#ffc107';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 'low': return '#17a2b8';
      case 'medium': return '#ffc107';
      case 'high': return '#fd7e14';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) return <div className="loading">Loading IoT Dashboard...</div>;

  return (
    <div className="iot-dashboard">
      <div className="dashboard-header">
        <h1>🌐 IoT Management Dashboard</h1>
        <div className="simulation-controls">
          <button 
            onClick={toggleSimulation}
            className={`simulation-btn ${simulation.isRunning ? 'running' : ''}`}
          >
            {simulation.isRunning ? '⏸️ Stop' : '▶️ Start'} Simulation
          </button>
          <button onClick={simulateRfidScan} className="rfid-btn">
            📱 Simulate RFID Scan
          </button>
        </div>
      </div>

      <div className="tab-navigation">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === 'devices' ? 'active' : ''} 
          onClick={() => setActiveTab('devices')}
        >
          🔧 Devices
        </button>
        <button 
          className={activeTab === 'alerts' ? 'active' : ''} 
          onClick={() => setActiveTab('alerts')}
        >
          🚨 Alerts ({alerts.length})
        </button>
        <button 
          className={activeTab === 'readings' ? 'active' : ''} 
          onClick={() => setActiveTab('readings')}
        >
          📈 Live Data
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-tab">
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Total Devices</h3>
              <div className="value">{dashboardData.summary.totalDevices || 0}</div>
            </div>
            <div className="summary-card online">
              <h3>Online Devices</h3>
              <div className="value">{dashboardData.summary.onlineDevices || 0}</div>
            </div>
            <div className="summary-card offline">
              <h3>Offline Devices</h3>
              <div className="value">{dashboardData.summary.offlineDevices || 0}</div>
            </div>
            <div className="summary-card alerts">
              <h3>Active Alerts</h3>
              <div className="value">{dashboardData.summary.activeAlerts || 0}</div>
            </div>
          </div>

          <div className="dashboard-charts">
            <div className="chart-container">
              <h3>Device Types</h3>
              <div className="device-types">
                {dashboardData.devicesByType.map(type => (
                  <div key={type._id} className="device-type">
                    <span className="type-name">{type._id}</span>
                    <span className="type-count">{type.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="recent-readings">
              <h3>Recent Sensor Readings</h3>
              {dashboardData.recentReadings.map(reading => (
                <div key={reading._id} className="reading-item">
                  <span className="device-name">{reading.deviceId?.name || reading.deviceId}</span>
                  <span className="sensor-type">{reading.sensorType}</span>
                  <span className="value">{reading.value} {reading.unit}</span>
                  <span className="timestamp">
                    {new Date(reading.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'devices' && (
        <div className="devices-tab">
          <div className="devices-grid">
            {devices.map(device => (
              <div 
                key={device._id} 
                className={`device-card ${selectedDevice?._id === device._id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedDevice(device);
                  fetchDeviceReadings(device.deviceId);
                }}
              >
                <div className="device-header">
                  <h4>{device.name}</h4>
                  <div 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(device.status) }}
                  >
                    {device.isOnline ? '🟢' : '🔴'}
                  </div>
                </div>
                <div className="device-info">
                  <p><strong>Type:</strong> {device.type}</p>
                  <p><strong>Location:</strong> {device.location?.warehouse || 'Unknown'}</p>
                  <p><strong>Last Reading:</strong> {device.lastReading?.value} {device.lastReading?.unit}</p>
                  <p><strong>Battery:</strong> {device.batteryLevel || 'N/A'}%</p>
                </div>
              </div>
            ))}
          </div>

          {selectedDevice && (
            <div className="device-details">
              <h3>Device Readings: {selectedDevice.name}</h3>
              <div className="readings-table">
                {deviceReadings.map(reading => (
                  <div key={reading._id} className="reading-row">
                    <span>{reading.sensorType}</span>
                    <span>{reading.value} {reading.unit}</span>
                    <span>{new Date(reading.createdAt).toLocaleString()}</span>
                    {reading.alert?.isTriggered && (
                      <span 
                        className="alert-badge"
                        style={{ backgroundColor: getAlertColor(reading.alert.level) }}
                      >
                        ⚠️ {reading.alert.level}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="alerts-tab">
          <h3>Active IoT Alerts</h3>
          <div className="alerts-list">
            {alerts.map(alert => (
              <div 
                key={alert._id} 
                className="alert-item"
                style={{ borderLeft: `4px solid ${getAlertColor(alert.alert.level)}` }}
              >
                <div className="alert-header">
                  <span className="alert-level">{alert.alert.level.toUpperCase()}</span>
                  <span className="alert-time">
                    {new Date(alert.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="alert-message">{alert.alert.message}</div>
                <div className="alert-details">
                  <span>Device: {alert.deviceId}</span>
                  <span>Value: {alert.value} {alert.unit}</span>
                  {alert.productId && <span>Product: {alert.productId.name}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'readings' && (
        <div className="readings-tab">
          <h3>Live Sensor Data</h3>
          <div className="live-readings">
            {dashboardData.recentReadings.slice(0, 20).map(reading => (
              <div key={reading._id} className="live-reading-card">
                <div className="reading-header">
                  <h4>{reading.deviceInfo?.name || reading.deviceId}</h4>
                  <span className="reading-type">{reading.sensorType}</span>
                </div>
                <div className="reading-value">
                  {reading.value} {reading.unit}
                </div>
                <div className="reading-time">
                  {new Date(reading.createdAt).toLocaleTimeString()}
                </div>
                {reading.metadata && (
                  <div className="reading-metadata">
                    {Object.entries(reading.metadata).map(([key, value]) => (
                      <span key={key}>{key}: {value}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error-message">❌ {error}</div>}
    </div>
  );
};

export default IoTDashboard; 