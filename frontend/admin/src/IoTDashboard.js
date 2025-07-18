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
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const [alertHistoryLoading, setAlertHistoryLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [expandedAlertGroups, setExpandedAlertGroups] = useState(new Set());
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  // Overview filtering states
  const [overviewFilter, setOverviewFilter] = useState({
    deviceType: 'all',
    deviceId: 'all', 
    timeRange: 'all',

    limit: 20
  });
  const [filteredReadings, setFilteredReadings] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

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
    
    // Auto-refresh fallback - more frequent when simulation is running
    const refreshInterval = simulation.isRunning ? 10000 : 30000; // 10 seconds if simulation running, 30 seconds otherwise
    const autoRefreshInterval = setInterval(() => {
      if (activeTab === 'readings' || activeTab === 'overview') {
        fetchDashboardData();
      }
      if (activeTab === 'alerts') {
        fetchAlerts();
      }
    }, refreshInterval);
    
    return () => {
      clearInterval(autoRefreshInterval);
    };
  }, [activeTab, simulation.isRunning]);
  
  // Auto-apply filters when they change
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchFilteredReadings();
    }
  }, [overviewFilter, activeTab]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/iot/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
      setLastUpdated(new Date());
      setError(''); // Clear any previous errors
      
      // Also fetch filtered readings for overview
      if (activeTab === 'overview') {
        await fetchFilteredReadings();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchFilteredReadings = async () => {
    try {
      setLoadingFilters(true);
      setError(''); // Clear any previous errors
      const token = localStorage.getItem('token');
      
      // Build query parameters based on filters
      const params = new URLSearchParams();
      params.append('limit', overviewFilter.limit.toString());
      
      if (overviewFilter.timeRange !== 'all') {
        const hours = overviewFilter.timeRange === '1h' ? 1 : 
                     overviewFilter.timeRange === '6h' ? 6 : 
                     overviewFilter.timeRange === '24h' ? 24 : 168; // 7 days
        const startDate = new Date(Date.now() - (hours * 60 * 60 * 1000));
        params.append('startDate', startDate.toISOString());
      }
      
      if (overviewFilter.deviceType !== 'all') {
        params.append('deviceType', overviewFilter.deviceType);
      }
      
      if (overviewFilter.deviceId !== 'all') {
        params.append('deviceId', overviewFilter.deviceId);
      }
      
      console.log('Fetching filtered readings with params:', params.toString());
      
      const response = await axios.get(`http://localhost:5000/api/iot/readings?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Filtered readings response:', response.data);
      setFilteredReadings(response.data || []);
    } catch (error) {
      console.error('Error fetching filtered readings:', error);
      setError(`Failed to load filtered readings: ${error.response?.data?.message || error.message}`);
      setFilteredReadings([]);
    } finally {
      setLoadingFilters(false);
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

  const fetchAlertHistory = async (alert) => {
    setAlertHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Get 7 days of history leading up to the alert
      const alertDate = new Date(alert.createdAt);
      const startDate = new Date(alertDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days before
      const endDate = new Date(alertDate.getTime() + 60 * 60 * 1000); // 1 hour after
      
      const params = new URLSearchParams();
      params.append('deviceId', alert.deviceId);
      params.append('limit', '100');
      params.append('startDate', startDate.toISOString());
      params.append('endDate', endDate.toISOString());
      
      const response = await axios.get(`http://localhost:5000/api/iot/readings?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAlertHistory(response.data || []);
      setSelectedAlert(alert);
    } catch (error) {
      console.error('Error fetching alert history:', error);
      setAlertHistory([]);
    }
    setAlertHistoryLoading(false);
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
      
      // Refresh dashboard data immediately to show new temperature reading
      if (activeTab === 'readings' || activeTab === 'overview') {
        setTimeout(() => {
          fetchDashboardData();
        }, 500); // Wait 0.5 seconds for the reading to be saved
      }
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
      const rfidTags = ['RFID_BUTTON_001', 'RFID_BUTTON_002', 'RFID_BUTTON_003', 'RFID_PRODUCT_SCAN', 'RFID_MANUAL_TEST'];
      const randomTag = rfidTags[Math.floor(Math.random() * rfidTags.length)];
      
      // Use direct readings API since product association might not work
      await axios.post('http://localhost:5000/api/iot/readings', {
        deviceId: 'RFID_READER_01',
        sensorType: 'rfid',
        value: randomTag,
        unit: 'tag',
        metadata: {
          scanType: 'dashboard_simulation',
          timestamp: new Date().toISOString(),
          buttonTriggered: true
        }
      });
      
              console.log('RFID scan simulated via dashboard:', randomTag);
        
        // Refresh dashboard data immediately to show new reading
        setTimeout(() => {
          fetchDashboardData();
        }, 1000); // Wait 1 second for the reading to be saved
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

  // Device type icons and grouping utilities
  const getDeviceTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'temperature': return '🌡️';
      case 'humidity': return '💧';
      case 'rfid': return '📱';
      case 'weight': return '⚖️';
      case 'motion': return '🚶';
      case 'camera': return '📷';
      case 'barcode': return '📊';
      default: return '📡';
    }
  };

  const getDeviceTypeName = (type) => {
    switch (type?.toLowerCase()) {
      case 'temperature': return 'Temperature Sensors';
      case 'humidity': return 'Humidity Sensors';
      case 'rfid': return 'RFID Readers';
      case 'weight': return 'Weight Sensors';
      case 'motion': return 'Motion Sensors';
      case 'camera': return 'Cameras';
      case 'barcode': return 'Barcode Scanners';
      default: return 'Other Devices';
    }
  };

  const groupDevicesByType = (devices) => {
    const grouped = devices.reduce((acc, device) => {
      const type = device.type || 'other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(device);
      return acc;
    }, {});

    // Sort groups by device count (descending) and type name
    return Object.entries(grouped)
      .sort(([typeA, devicesA], [typeB, devicesB]) => {
        if (devicesA.length !== devicesB.length) {
          return devicesB.length - devicesA.length;
        }
        return getDeviceTypeName(typeA).localeCompare(getDeviceTypeName(typeB));
      });
  };

  const getGroupStats = (deviceGroup) => {
    const total = deviceGroup.length;
    const online = deviceGroup.filter(d => d.isOnline).length;
    const offline = total - online;
    
    const withAlerts = deviceGroup.filter(d => 
      d.alertThresholds && d.lastReading?.value && (
        (d.alertThresholds.min !== undefined && d.lastReading.value < d.alertThresholds.min) ||
        (d.alertThresholds.max !== undefined && d.lastReading.value > d.alertThresholds.max)
      )
    ).length;
    
    const goodStatus = deviceGroup.filter(d => 
      d.status === 'active' && d.isOnline && !(
        d.alertThresholds && d.lastReading?.value && (
          (d.alertThresholds.min !== undefined && d.lastReading.value < d.alertThresholds.min) ||
          (d.alertThresholds.max !== undefined && d.lastReading.value > d.alertThresholds.max)
        )
      )
    ).length;
    
    const warningStatus = deviceGroup.filter(d => 
      d.status === 'maintenance' || d.batteryLevel < 20
    ).length;
    
    const errorStatus = deviceGroup.filter(d => 
      d.status === 'error' || !d.isOnline
    ).length;

    return {
      total,
      online,
      offline,
      withAlerts,
      good: goodStatus,
      warning: warningStatus,
      error: errorStatus
    };
  };

  const toggleGroupExpansion = (deviceType) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(deviceType)) {
      newExpandedGroups.delete(deviceType);
    } else {
      newExpandedGroups.add(deviceType);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const toggleAlertGroupExpansion = (groupKey) => {
    const newExpandedGroups = new Set(expandedAlertGroups);
    if (newExpandedGroups.has(groupKey)) {
      newExpandedGroups.delete(groupKey);
    } else {
      newExpandedGroups.add(groupKey);
    }
    setExpandedAlertGroups(newExpandedGroups);
  };

  const groupAlertsByDevice = (alerts) => {
    const deviceLookup = devices.reduce((acc, device) => {
      acc[device.deviceId] = device;
      return acc;
    }, {});

    const grouped = alerts.reduce((acc, alert) => {
      const device = deviceLookup[alert.deviceId];
      
      if (device) {
        // Group by device type for existing devices
        const deviceType = device.type || 'other';
        const groupKey = `${deviceType}_devices`;
        
        if (!acc[groupKey]) {
          acc[groupKey] = {
            type: 'device_type',
            deviceType,
            icon: getDeviceTypeIcon(deviceType),
            name: getDeviceTypeName(deviceType),
            alerts: []
          };
        }
        acc[groupKey].alerts.push({ ...alert, device });
      } else {
        // Group orphaned alerts separately
        const groupKey = 'orphaned';
        if (!acc[groupKey]) {
          acc[groupKey] = {
            type: 'orphaned',
            icon: '⚠️',
            name: 'Orphaned Alerts (Missing Devices)',
            alerts: []
          };
        }
        acc[groupKey].alerts.push({ ...alert, device: null });
      }
      
      return acc;
    }, {});

    // Sort: orphaned first, then by alert count
    return Object.entries(grouped)
      .sort(([keyA, groupA], [keyB, groupB]) => {
        if (keyA === 'orphaned') return -1;
        if (keyB === 'orphaned') return 1;
        return groupB.alerts.length - groupA.alerts.length;
      });
  };

  const navigateToDevice = (alert) => {
    const device = devices.find(d => d.deviceId === alert.deviceId);
    if (device) {
      // Switch to devices tab
      setActiveTab('devices');
      
      // Expand the device group
      const deviceType = device.type || 'other';
      const newExpandedGroups = new Set(expandedGroups);
      newExpandedGroups.add(deviceType);
      setExpandedGroups(newExpandedGroups);
      
      // Select the device
      setTimeout(() => {
        setSelectedDevice(device);
        fetchDeviceReadings(device.deviceId);
      }, 100);
    }
  };

  const handleSeverityFilter = (severity) => {
    if (selectedSeverity === severity) {
      // If clicking the same severity, clear the filter
      setSelectedSeverity(null);
    } else {
      // Set new severity filter
      setSelectedSeverity(severity);
    }
  };

  const getFilteredAlerts = () => {
    if (!selectedSeverity) {
      return alerts; // Show all alerts
    }
    
    if (selectedSeverity === 'orphaned') {
      // Filter orphaned alerts (alerts without corresponding devices)
      return alerts.filter(alert => !devices.find(d => d.deviceId === alert.deviceId));
    }
    
    return alerts.filter(alert => alert.alert.level === selectedSeverity);
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
          <button 
            onClick={() => {
              fetchDashboardData();
              fetchDevices();
              fetchAlerts();
            }} 
            className="refresh-btn"
          >
            🔄 Refresh Data
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
              <div className="readings-header">
                <h3>📈 Sensor Readings History</h3>
                <div className="filter-controls">
                  <select 
                    value={overviewFilter.deviceType} 
                    onChange={(e) => setOverviewFilter({...overviewFilter, deviceType: e.target.value})}
                    className="filter-select"
                  >
                    <option value="all">All Types</option>
                    <option value="temperature">🌡️ Temperature</option>
                    <option value="humidity">💧 Humidity</option>
                    <option value="rfid">📱 RFID</option>
                    <option value="weight">⚖️ Weight</option>
                    <option value="motion">🚶 Motion</option>
                    <option value="camera">📹 Camera</option>
                    <option value="barcode">📊 Barcode</option>
                  </select>
                  
                  <select 
                    value={overviewFilter.timeRange} 
                    onChange={(e) => setOverviewFilter({...overviewFilter, timeRange: e.target.value})}
                    className="filter-select"
                  >
                    <option value="1h">Last Hour</option>
                    <option value="6h">Last 6 Hours</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="all">All Time</option>
                  </select>
                  
                  <select 
                    value={overviewFilter.limit} 
                    onChange={(e) => setOverviewFilter({...overviewFilter, limit: parseInt(e.target.value)})}
                    className="filter-select"
                  >
                    <option value="10">Show 10</option>
                    <option value="20">Show 20</option>
                    <option value="50">Show 50</option>
                    <option value="100">Show 100</option>
                  </select>
                  

                  
                  <button 
                    onClick={fetchFilteredReadings}
                    className="apply-filter-btn"
                    disabled={loadingFilters}
                  >
                    {loadingFilters ? '🔄 Loading...' : '📊 Apply Filters'}
                  </button>
                </div>
              </div>
              
              <div className="readings-count">
                Showing {filteredReadings.length > 0 ? filteredReadings.length : (dashboardData.recentReadings?.length || 0)} readings{overviewFilter.deviceType !== 'all' ? ` (${overviewFilter.deviceType} sensors)` : ''}
              </div>
              
              <div className="readings-list">
                {(() => {
                  // Show loading state
                  if (loadingFilters) {
                    return (
                      <div className="loading-readings">
                        <div className="loading-spinner">🔄</div>
                        <p>Applying filters and loading readings...</p>
                      </div>
                    );
                  }
                  
                  // Always show filtered readings (which includes all readings when no filters)
                  const readingsToShow = filteredReadings.length > 0 ? filteredReadings : (dashboardData.recentReadings || []);
                  const hasFiltersApplied = overviewFilter.deviceType !== 'all' || 
                                           overviewFilter.deviceId !== 'all' || 
                                           overviewFilter.timeRange !== 'all';
                  
                                      if (readingsToShow.length === 0 && hasFiltersApplied) {
                      return (
                        <div className="no-readings">
                          No readings found matching the current filters. Try adjusting your filter criteria.
                        </div>
                      );
                    }
                  
                  return readingsToShow.map(reading => (
                    <div key={reading._id} className={`reading-item ${reading.alert?.isTriggered ? 'has-alert' : ''}`}>
                      <span className="device-name">{reading.deviceInfo?.name || reading.deviceId}</span>
                      <span className="sensor-type">
                        {reading.sensorType}
                        {reading.alert?.isTriggered && (
                          <span className={`alert-badge ${reading.alert.level}`}>
                            🚨 {reading.alert.level}
                          </span>
                        )}
                      </span>
                      <span className="value">{reading.value} {reading.unit}</span>
                      <span className="timestamp">
                        {new Date(reading.createdAt).toLocaleString()}
                      </span>
                      {reading.alert?.isTriggered && (
                        <div className="alert-message">{reading.alert.message}</div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'devices' && (
        <div className="devices-tab">
          {/* Clean Overview Stats */}
          <div className="overview-stats">
            <div className="stat-card">
              <div className="stat-number">{devices.length}</div>
              <div className="stat-label">Total Devices</div>
            </div>
            <div className="stat-card online">
              <div className="stat-number">{devices.filter(d => d.isOnline).length}</div>
              <div className="stat-label">Online</div>
            </div>
            <div className="stat-card offline">
              <div className="stat-number">{devices.filter(d => !d.isOnline).length}</div>
              <div className="stat-label">Offline</div>
            </div>
            <div className="stat-card alerts">
              <div className="stat-number">{devices.filter(d => d.alertThresholds && d.lastReading?.value && (
                (d.alertThresholds.min !== undefined && d.lastReading.value < d.alertThresholds.min) ||
                (d.alertThresholds.max !== undefined && d.lastReading.value > d.alertThresholds.max)
              )).length}</div>
              <div className="stat-label">With Alerts</div>
            </div>
          </div>

          {/* Device Type Cards */}
          <div className="device-type-grid">
            {groupDevicesByType(devices).map(([deviceType, deviceGroup]) => {
              const stats = getGroupStats(deviceGroup);
              
              return (
                <div key={deviceType} className="device-type-card">
                  <div className="device-type-header">
                    <div className="type-info">
                      <span className="type-icon-large">{getDeviceTypeIcon(deviceType)}</span>
                      <div className="type-details">
                        <h3>{getDeviceTypeName(deviceType)}</h3>
                        <p>{stats.total} devices</p>
                      </div>
                    </div>
                    <div className="type-status">
                      <div className={`status-indicator ${stats.online === stats.total ? 'all-online' : stats.online === 0 ? 'all-offline' : 'mixed'}`}>
                        {stats.online}/{stats.total}
                      </div>
                    </div>
                  </div>
                  
                  <div className="device-type-stats">
                    <div className="mini-stat good">
                      <span className="mini-icon">✅</span>
                      <span className="mini-value">{stats.good}</span>
                    </div>
                    <div className="mini-stat warning">
                      <span className="mini-icon">⚠️</span>
                      <span className="mini-value">{stats.warning}</span>
                    </div>
                    <div className="mini-stat error">
                      <span className="mini-icon">❌</span>
                      <span className="mini-value">{stats.error}</span>
                    </div>
                    <div className="mini-stat alert">
                      <span className="mini-icon">🚨</span>
                      <span className="mini-value">{stats.withAlerts}</span>
                    </div>
                  </div>
                  
                  <div className="device-list">
                    {deviceGroup.map(device => (
                      <div 
                        key={device._id} 
                        className={`device-item ${selectedDevice?._id === device._id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedDevice(device);
                          fetchDeviceReadings(device.deviceId);
                        }}
                      >
                        <div className="device-basic-info">
                          <div className="device-name">{device.name}</div>
                          <div className="device-location">{device.location?.zone || device.location?.warehouse || 'Unknown'}</div>
                        </div>
                        
                        <div className="device-status-info">
                          <div className={`connection-status ${device.isOnline ? 'online' : 'offline'}`}>
                            {device.isOnline ? '●' : '○'}
                          </div>
                          
                          {device.lastReading?.value && (
                            <div className="last-reading">
                              {device.lastReading.value} {device.lastReading.unit}
                            </div>
                          )}
                          
                          {device.alertThresholds && device.lastReading?.value && (
                            (device.alertThresholds.min !== undefined && device.lastReading.value < device.alertThresholds.min) ||
                            (device.alertThresholds.max !== undefined && device.lastReading.value > device.alertThresholds.max)
                          ) && (
                            <div className="alert-badge">!</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedDevice && (
            <div className="device-details">
              <div className="device-details-header">
                <h3>Device Readings: {selectedDevice.name}</h3>
                
                {selectedDevice.alertThresholds && (selectedDevice.alertThresholds.min || selectedDevice.alertThresholds.max) && (
                  <div className="device-thresholds-summary">
                    <h4>🚨 Alert Configuration</h4>
                    <div className="threshold-summary">
                      <div className="threshold-item">
                        <span className="threshold-label">Normal Range:</span>
                        <span className="threshold-values">
                          {selectedDevice.alertThresholds.min !== undefined && selectedDevice.alertThresholds.max !== undefined
                            ? `${selectedDevice.alertThresholds.min} - ${selectedDevice.alertThresholds.max} ${selectedDevice.lastReading?.unit || ''}`
                            : selectedDevice.alertThresholds.min !== undefined
                            ? `≥ ${selectedDevice.alertThresholds.min} ${selectedDevice.lastReading?.unit || ''}`
                            : `≤ ${selectedDevice.alertThresholds.max} ${selectedDevice.lastReading?.unit || ''}`
                          }
                        </span>
                      </div>
                      
                      {selectedDevice.lastReading?.value && (
                        <div className="threshold-item">
                          <span className="threshold-label">Current Value:</span>
                          <span className={`current-reading ${
                            (selectedDevice.alertThresholds.min !== undefined && selectedDevice.lastReading.value < selectedDevice.alertThresholds.min) ||
                            (selectedDevice.alertThresholds.max !== undefined && selectedDevice.lastReading.value > selectedDevice.alertThresholds.max)
                              ? 'alert-value' : 'normal-value'
                          }`}>
                            {selectedDevice.lastReading.value} {selectedDevice.lastReading.unit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="readings-table">
                <div className="readings-header">
                  <span>Sensor Type</span>
                  <span>Value</span>
                  <span>Timestamp</span>
                  <span>Status</span>
                </div>
                
                {deviceReadings.map(reading => (
                  <div key={reading._id} className={`reading-row ${
                    selectedDevice.alertThresholds && (
                      (selectedDevice.alertThresholds.min !== undefined && reading.value < selectedDevice.alertThresholds.min) ||
                      (selectedDevice.alertThresholds.max !== undefined && reading.value > selectedDevice.alertThresholds.max)
                    ) ? 'threshold-violation' : ''
                  }`}>
                    <span>{reading.sensorType}</span>
                    <span>{reading.value} {reading.unit}</span>
                    <span>{new Date(reading.createdAt).toLocaleString()}</span>
                    <span>
                      {reading.alert?.isTriggered ? (
                        <span 
                          className="alert-badge"
                          style={{ backgroundColor: getAlertColor(reading.alert.level) }}
                        >
                          🚨 {reading.alert.level}
                        </span>
                      ) : selectedDevice.alertThresholds && (
                        (selectedDevice.alertThresholds.min !== undefined && reading.value < selectedDevice.alertThresholds.min) ||
                        (selectedDevice.alertThresholds.max !== undefined && reading.value > selectedDevice.alertThresholds.max)
                      ) ? (
                        <span className="threshold-warning">⚠️ Outside range</span>
                      ) : (
                        <span className="normal-status">✅ Normal</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="alerts-tab">
          {/* Clean Alert Stats */}
          <div className="alert-overview-stats">
            <div 
              className={`alert-stat-card critical clickable ${selectedSeverity === 'critical' ? 'selected' : ''}`}
              onClick={() => handleSeverityFilter('critical')}
              title="Click to filter critical alerts"
            >
              <div className="alert-stat-number">{alerts.filter(a => a.alert.level === 'critical').length}</div>
              <div className="alert-stat-label">Critical</div>
            </div>
            <div 
              className={`alert-stat-card high clickable ${selectedSeverity === 'high' ? 'selected' : ''}`}
              onClick={() => handleSeverityFilter('high')}
              title="Click to filter high priority alerts"
            >
              <div className="alert-stat-number">{alerts.filter(a => a.alert.level === 'high').length}</div>
              <div className="alert-stat-label">High</div>
            </div>
            <div 
              className={`alert-stat-card medium clickable ${selectedSeverity === 'medium' ? 'selected' : ''}`}
              onClick={() => handleSeverityFilter('medium')}
              title="Click to filter medium priority alerts"
            >
              <div className="alert-stat-number">{alerts.filter(a => a.alert.level === 'medium').length}</div>
              <div className="alert-stat-label">Medium</div>
            </div>
            <div 
              className={`alert-stat-card low clickable ${selectedSeverity === 'low' ? 'selected' : ''}`}
              onClick={() => handleSeverityFilter('low')}
              title="Click to filter low priority alerts"
            >
              <div className="alert-stat-number">{alerts.filter(a => a.alert.level === 'low').length}</div>
              <div className="alert-stat-label">Low</div>
            </div>
            
            {/* Contextual System Issues Card - Only show when orphaned alerts exist */}
            {(() => {
              const orphanedCount = alerts.filter(a => !devices.find(d => d.deviceId === a.deviceId)).length;
              return orphanedCount > 0 ? (
                <div 
                  className={`alert-stat-card system-issues clickable ${selectedSeverity === 'orphaned' ? 'selected' : ''}`}
                  onClick={() => handleSeverityFilter('orphaned')}
                  title="Click to view alerts from missing devices - requires attention"
                >
                  <div className="alert-stat-number">{orphanedCount}</div>
                  <div className="alert-stat-label">System Issues</div>
                  <div className="alert-stat-subtitle">Missing Devices</div>
                </div>
              ) : null;
            })()}
          </div>

          {/* Clean Alert List */}
          <div className="clean-alerts-container">
            <div className="alerts-header">
              <h3>
                {selectedSeverity ? (
                  <>
                    {selectedSeverity === 'orphaned' ? 'System Issues' : selectedSeverity.charAt(0).toUpperCase() + selectedSeverity.slice(1)} Alerts
                    <button 
                      className="clear-filter-btn"
                      onClick={() => setSelectedSeverity(null)}
                      title="Clear filter"
                    >
                      ✕ Show All
                    </button>
                  </>
                ) : (
                  'Recent Alerts'
                )}
              </h3>
              <div className="alert-count">
                {getFilteredAlerts().length} 
                {selectedSeverity === 'orphaned' ? ' system issue' : selectedSeverity ? ` ${selectedSeverity}` : ' total'} alerts
              </div>
            </div>

            <div className="clean-alerts-list">
              {getFilteredAlerts().length === 0 ? (
                <div className="no-alerts">
                  <div className="no-alerts-icon">
                    {selectedSeverity ? '🔍' : '✅'}
                  </div>
                  <div className="no-alerts-text">
                    {selectedSeverity === 'orphaned' ? 'No system issues found' : selectedSeverity ? `No ${selectedSeverity} alerts` : 'No active alerts'}
                  </div>
                  <div className="no-alerts-subtext">
                    {selectedSeverity === 'orphaned'
                      ? 'All alerts are linked to valid devices in the system'
                      : selectedSeverity 
                      ? `No alerts found with ${selectedSeverity} severity level` 
                      : 'All devices are operating within normal parameters'
                    }
                  </div>
                </div>
              ) : (
                getFilteredAlerts().map(alert => {
                  const device = devices.find(d => d.deviceId === alert.deviceId);
                  const isOrphaned = !device;
                  
                  return (
                    <div 
                      key={alert._id} 
                      className={`clean-alert-card ${alert.alert.level} ${isOrphaned ? 'orphaned' : ''}`}
                    >
                      <div className="alert-severity-indicator">
                        <div className={`severity-dot ${alert.alert.level}`}></div>
                      </div>

                      <div className="alert-main-info">
                        <div className="alert-header-clean">
                          <div className="alert-title">
                            {device ? device.name : alert.deviceId}
                            {isOrphaned && <span className="orphaned-badge">Missing Device</span>}
                          </div>
                          <div className="alert-timestamp">
                            {new Date(alert.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="alert-message-clean">
                          {alert.alert.message}
                        </div>

                        <div className="alert-meta-info">
                          <span className="alert-value">
                            📊 {alert.value} {alert.unit}
                          </span>
                          {device && (
                            <span className="alert-location">
                              📍 {device.location?.zone || device.location?.warehouse || 'Unknown'}
                            </span>
                          )}
                          {alert.productId && (
                            <span className="alert-product">
                              📦 {alert.productId.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="alert-actions-clean">
                        <button 
                          className="clean-action-btn history"
                          onClick={() => fetchAlertHistory(alert)}
                          title="View reading history"
                        >
                          📈
                        </button>
                        
                        {device ? (
                          <button 
                            className="clean-action-btn device"
                            onClick={() => navigateToDevice(alert)}
                            title="Go to device"
                          >
                            📡
                          </button>
                        ) : (
                          <button 
                            className="clean-action-btn disabled"
                            disabled
                            title="Device not found"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'readings' && (
        <div className="readings-tab">
          <div className="tab-header">
            <h3>Live Sensor Data</h3>
            <div className="last-updated">
              {refreshing ? (
                <span>🔄 Refreshing...</span>
              ) : (
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
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

      {/* Alert History Modal */}
      {selectedAlert && (
        <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="alert-history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📈 Sensor Reading History</h3>
              <div className="alert-info">
                <span className={`alert-level-badge ${selectedAlert.alert.level}`}>
                  🚨 {selectedAlert.alert.level.toUpperCase()} ALERT
                </span>
                <span className="alert-device">Device: {selectedAlert.deviceId}</span>
                <span className="alert-timestamp">
                  {new Date(selectedAlert.createdAt).toLocaleString()}
                </span>
              </div>
              <button 
                className="close-modal-btn"
                onClick={() => setSelectedAlert(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="alert-details-summary">
                <div className="alert-message">
                  <strong>Alert Message:</strong> {selectedAlert.alert.message}
                </div>
                <div className="alert-trigger-value">
                  <strong>Trigger Value:</strong> {selectedAlert.value} {selectedAlert.unit}
                </div>
              </div>
              
              <div className="history-section">
                <h4>📊 Reading History (7 days leading to alert)</h4>
                
                {alertHistoryLoading ? (
                  <div className="loading-history">🔄 Loading history...</div>
                ) : alertHistory.length > 0 ? (
                  <div className="history-timeline">
                    <div className="timeline-header">
                      <span>Timestamp</span>
                      <span>Value</span>
                      <span>Status</span>
                      <span>Alert Level</span>
                    </div>
                    
                    {alertHistory.map((reading, index) => {
                      const isAlertReading = reading._id === selectedAlert._id;
                      const isOutsideThreshold = reading.alert?.isTriggered;
                      
                      return (
                        <div 
                          key={reading._id} 
                          className={`history-item ${isAlertReading ? 'alert-reading' : ''} ${isOutsideThreshold ? 'threshold-violation' : ''}`}
                        >
                          <span className="timestamp">
                            {new Date(reading.createdAt).toLocaleString()}
                            {isAlertReading && <span className="alert-marker"> ← ALERT TRIGGERED</span>}
                          </span>
                          <span className={`value ${isOutsideThreshold ? 'alert-value' : 'normal-value'}`}>
                            {reading.value} {reading.unit}
                          </span>
                          <span className={`status ${isOutsideThreshold ? 'status-alert' : 'status-normal'}`}>
                            {isOutsideThreshold ? '⚠️ Alert' : '✅ Normal'}
                          </span>
                          <span className="alert-level">
                            {reading.alert?.isTriggered ? (
                              <span className={`level-badge ${reading.alert.level}`}>
                                {reading.alert.level}
                              </span>
                            ) : (
                              <span className="no-alert">-</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-history">No historical data found for this device.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-message">❌ {error}</div>}
    </div>
  );
};

export default IoTDashboard; 