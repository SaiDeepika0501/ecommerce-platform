import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SensorReadingDetail.css';

const SensorReadingDetail = ({ readingId, onBack }) => {
  const [reading, setReading] = useState(null);
  const [product, setProduct] = useState(null);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (readingId) {
      fetchReadingDetails();
    }
  }, [readingId]);

  const fetchReadingDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Get authentication token
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch reading details
      const readingResponse = await axios.get(`http://localhost:5000/api/iot/readings/${readingId}`, { headers });
      const readingData = readingResponse.data;
      setReading(readingData);

      // If it's an RFID reading, check for product details
      if (readingData.sensorType === 'rfid') {
        // First check if product is already populated in the reading
        if (readingData.productId && typeof readingData.productId === 'object' && readingData.productId.name) {
          console.log('Product found in reading data:', readingData.productId);
          // Fetch full product details using the product ID
          try {
            const productResponse = await axios.get(`http://localhost:5000/api/products/${readingData.productId._id}`, { headers });
            setProduct(productResponse.data);
            console.log('Full product details loaded:', productResponse.data);
          } catch (productError) {
            console.log('Could not fetch full product details, using basic info');
            // Fallback to the basic product info from the reading
            setProduct({
              _id: readingData.productId._id,
              name: readingData.productId.name,
              inventory: { quantity: 'Unknown', sku: 'Unknown' }
            });
          }
        } else {
          // Fallback: try to fetch product by RFID tag
          const rfidTag = readingData.metadata?.rfidTag || readingData.value || readingData.rfidTag;
          
          if (rfidTag) {
            try {
              console.log('Fetching product for RFID tag:', rfidTag);
              const productResponse = await axios.get(`http://localhost:5000/api/products/rfid/${rfidTag}`, { headers });
              setProduct(productResponse.data);
              console.log('Product found by RFID lookup:', productResponse.data);
            } catch (productError) {
              console.log('Product not found for RFID tag:', rfidTag, productError.message);
            }
          } else {
            console.log('No RFID tag or product found in reading data:', readingData);
          }
        }
      }

      // Fetch device details
      if (readingData.deviceId) {
        try {
          const deviceResponse = await axios.get(`http://localhost:5000/api/iot/devices/${readingData.deviceId}`, { headers });
          setDevice(deviceResponse.data);
        } catch (deviceError) {
          console.log('Device not found:', readingData.deviceId);
        }
      }

    } catch (err) {
      setError('Failed to fetch reading details: ' + err.message);
      console.error('Error fetching reading details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value, unit) => {
    if (typeof value === 'number') {
      return `${value.toFixed(2)} ${unit || ''}`;
    }
    return value || 'N/A';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Not available';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'success',
      warning: 'warning',
      critical: 'danger',
      offline: 'secondary',
      maintenance: 'info'
    };
    return statusColors[status] || 'secondary';
  };

  const getSeverityBadge = (severity) => {
    const severityColors = {
      low: 'info',
      medium: 'warning',
      high: 'danger',
      critical: 'danger'
    };
    return severityColors[severity] || 'secondary';
  };

  if (loading) {
    return (
      <div className="sensor-detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading sensor reading details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sensor-detail-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!reading) {
    return (
      <div className="sensor-detail-container">
        <div className="not-found-message">
          <h3>Reading Not Found</h3>
          <p>The requested sensor reading could not be found.</p>
          <button className="btn btn-primary" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sensor-detail-container">
      {/* Header */}
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <div className="header-info">
          <h1>Sensor Reading Details</h1>
          <p className="reading-id">ID: {reading._id}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="detail-grid">
        
        {/* Basic Information Card */}
        <div className="detail-card">
          <h2>📊 Basic Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Sensor Type</label>
              <span className={`sensor-type-badge ${reading.sensorType}`}>
                {reading.sensorType?.toUpperCase()}
              </span>
            </div>
            <div className="info-item">
              <label>Reading Value</label>
              <span className="reading-value">
                {formatValue(reading.value, reading.unit)}
              </span>
            </div>
            <div className="info-item">
              <label>Timestamp</label>
              <span>{formatTimestamp(reading.createdAt || reading.timestamp)}</span>
            </div>
            <div className="info-item">
              <label>Location</label>
              <span>
                {reading.location ? 
                  (typeof reading.location === 'object' ? 
                    `${reading.location.warehouse || 'Unknown'}, ${reading.location.zone || 'Unknown'}` : 
                    reading.location
                  ) : 'Not specified'
                }
              </span>
            </div>
            {reading.severity && (
              <div className="info-item">
                <label>Severity</label>
                <span className={`badge badge-${getSeverityBadge(reading.severity)}`}>
                  {reading.severity?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Business Impact & Actions Card */}
        <div className="detail-card impact-card">
          <h2>📊 Business Impact & Actions</h2>
          
          {/* RFID-specific actions */}
          {reading.sensorType === 'rfid' && (
            <div className="impact-section">
              <h3>🏭 Inventory Management</h3>
              
              {/* Product Identification */}
              {product ? (
                <div className="affected-product">
                  <div className="product-header">
                    <h4>📦 Affected Product</h4>
                    <div className="product-info">
                      <strong>{product.name}</strong>
                      <span className="product-sku">SKU: {product.inventory?.sku || 'N/A'}</span>
                      <span className="rfid-scanned">RFID: {reading.value}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="affected-product">
                  <div className="product-header">
                    <h4>📦 RFID Scan Details</h4>
                    <div className="product-info">
                      <strong>RFID Tag: {reading.value}</strong>
                      <span className="no-product">⚠️ Product not found in inventory system</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="impact-grid">
                <div className="impact-item">
                  <label>Transaction Type</label>
                  <span className={`action-badge ${reading.metadata?.action === 'outbound' || reading.value?.toLowerCase().includes('out') ? 'outbound' : 'inbound'}`}>
                    {reading.metadata?.action === 'outbound' || reading.value?.toLowerCase().includes('out') ? '📤 Outbound (Item Removed)' : '📥 Inbound (Item Added)'}
                  </span>
                </div>
                <div className="impact-item">
                  <label>Quantity Changed</label>
                  <span className="quantity-change">
                    {reading.metadata?.quantity || 
                     (reading.alert?.message?.match(/(\d+)/) && reading.alert.message.match(/(\d+)/)[1]) || 
                     'N/A'} units
                  </span>
                </div>
                <div className="impact-item">
                  <label>Transaction Time</label>
                  <span className="transaction-time">
                    {formatTimestamp(reading.createdAt || reading.timestamp)}
                  </span>
                </div>
                <div className="impact-item">
                  <label>Processing Status</label>
                  <span className={`processing-status ${reading.processed ? 'completed' : 'pending'}`}>
                    {reading.processed ? '✅ Processed' : '⏳ Processing'}
                  </span>
                </div>
                {product && (
                  <>
                    <div className="impact-item">
                      <label>Previous Stock</label>
                      <span className="previous-stock">
                        {reading.metadata?.previousStock !== undefined ? `${reading.metadata.previousStock} units` : 'N/A'}
                      </span>
                    </div>
                    <div className="impact-item">
                      <label>Current Stock Level</label>
                      <span className={`stock-level ${product.inventory?.quantity <= (product.inventory?.lowStockThreshold || 10) ? 'low' : 'normal'}`}>
                        {product.inventory?.quantity || 0} units
                      </span>
                    </div>
                    <div className="impact-item">
                      <label>Stock Status</label>
                      <span className={`status-badge ${product.inventory?.quantity <= (product.inventory?.lowStockThreshold || 10) ? 'warning' : 'normal'}`}>
                        {product.inventory?.quantity <= (product.inventory?.lowStockThreshold || 10) ? '⚠️ Low Stock Alert' : '✅ Stock Normal'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Temperature/Humidity specific actions */}
          {(reading.sensorType === 'temperature' || reading.sensorType === 'humidity') && (
            <div className="impact-section">
              <h3>🌡️ Environmental Monitoring</h3>
              <div className="impact-grid">
                <div className="impact-item">
                  <label>Threshold Status</label>
                  <span className={`threshold-badge ${reading.alert?.isTriggered ? 'violation' : 'normal'}`}>
                    {reading.alert?.isTriggered ? '🚨 Threshold Violation' : '✅ Within Limits'}
                  </span>
                </div>
                {reading.alert?.isTriggered && (
                  <>
                    <div className="impact-item">
                      <label>Alert Level</label>
                      <span className={`alert-level ${reading.alert.level}`}>
                        {reading.alert.level?.toUpperCase()}
                      </span>
                    </div>
                    <div className="impact-item">
                      <label>Alert Message</label>
                      <span className="alert-message">
                        {reading.alert.message || `${reading.sensorType} reading outside normal range`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* General impact and actions */}
          <div className="impact-section">
            <h3>⚡ Automated Actions</h3>
            <div className="actions-list">
              {reading.processed ? (
                <>
                  <div className="action-item completed">
                    <span className="action-icon">✅</span>
                    <div className="action-details">
                      <strong>Data Processing Complete</strong>
                      <p>Sensor reading has been processed and integrated into the system</p>
                    </div>
                  </div>
                  
                                     {reading.sensorType === 'rfid' && product && (
                     <div className="action-item completed">
                       <span className="action-icon">📦</span>
                       <div className="action-details">
                         <strong>Inventory Updated for {product.name}</strong>
                         <p>
                           {reading.metadata?.action === 'outbound' || reading.value?.toLowerCase().includes('out') 
                             ? `Removed ${reading.metadata?.quantity || 'unknown'} units from inventory.`
                             : `Added ${reading.metadata?.quantity || 'unknown'} units to inventory.`
                           }
                           {reading.metadata?.previousStock !== undefined && reading.metadata?.quantity ? 
                             ` Stock updated from ${reading.metadata.previousStock} to ${product.inventory?.quantity || 0} units.` :
                             ` Current stock: ${product.inventory?.quantity || 0} units.`
                           }
                         </p>
                       </div>
                     </div>
                   )}
                  
                  {reading.alert?.isTriggered && (
                    <>
                      <div className="action-item completed">
                        <span className="action-icon">🔔</span>
                        <div className="action-details">
                          <strong>Alert Notification Sent</strong>
                          <p>Operations team has been notified of the threshold violation</p>
                        </div>
                      </div>
                      
                      {reading.alert.level === 'critical' && (
                        <div className="action-item completed">
                          <span className="action-icon">🚨</span>
                          <div className="action-details">
                            <strong>Emergency Protocol Activated</strong>
                            <p>Critical alert triggered immediate response procedures</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="action-item pending">
                  <span className="action-icon">⏳</span>
                  <div className="action-details">
                    <strong>Processing Pending</strong>
                    <p>This sensor reading is awaiting system processing</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommended actions */}
          <div className="impact-section">
            <h3>💡 Recommended Actions</h3>
            <div className="recommendations">
                             {reading.sensorType === 'rfid' && product && product.inventory?.quantity <= (product.inventory?.lowStockThreshold || 10) && (
                 <div className="recommendation urgent">
                   <span className="rec-icon">🛒</span>
                   <div className="rec-details">
                     <strong>Urgent: Restock {product.name}</strong>
                     <p>This RFID scan shows {product.name} is now at {product.inventory?.quantity || 0} units, below the {product.inventory?.lowStockThreshold || 10} unit threshold. Immediate reorder recommended.</p>
                   </div>
                 </div>
               )}
              
              {reading.alert?.isTriggered && reading.alert.level === 'high' && (
                <div className="recommendation urgent">
                  <span className="rec-icon">🔍</span>
                  <div className="rec-details">
                    <strong>Investigation Needed</strong>
                    <p>High-level alert requires immediate investigation by operations team.</p>
                  </div>
                </div>
              )}
              
              {reading.sensorType === 'temperature' && !reading.alert?.isTriggered && (
                <div className="recommendation normal">
                  <span className="rec-icon">📋</span>
                  <div className="rec-details">
                    <strong>Continue Monitoring</strong>
                    <p>Temperature levels are normal. Continue regular monitoring schedule.</p>
                  </div>
                </div>
              )}
              
                             {reading.sensorType === 'rfid' && product && product.inventory?.quantity > (product.inventory?.lowStockThreshold || 10) * 2 && (
                 <div className="recommendation info">
                   <span className="rec-icon">📈</span>
                   <div className="rec-details">
                     <strong>Storage Optimization for {product.name}</strong>
                     <p>{product.name} has {product.inventory?.quantity || 0} units in stock, well above the {product.inventory?.lowStockThreshold || 10} unit threshold. Consider optimizing storage space or reducing future orders.</p>
                   </div>
                 </div>
               )}
               
               {reading.sensorType === 'rfid' && !product && (
                 <div className="recommendation urgent">
                   <span className="rec-icon">❗</span>
                   <div className="rec-details">
                     <strong>Unregistered RFID Tag</strong>
                     <p>RFID tag {reading.value} is not registered in the inventory system. Please verify the product and add it to the database.</p>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Device Information Card */}
        {device && (
          <div className="detail-card">
            <h2>🔧 Device Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Device ID</label>
                <span>{device.deviceId}</span>
              </div>
              <div className="info-item">
                <label>Device Name</label>
                <span>{device.name}</span>
              </div>
              <div className="info-item">
                <label>Status</label>
                <span className={`badge badge-${getStatusBadge(device.status)}`}>
                  {device.status?.toUpperCase()}
                </span>
              </div>
              <div className="info-item">
                <label>Device Type</label>
                <span>{device.type}</span>
              </div>
              <div className="info-item">
                <label>Last Maintenance</label>
                <span>{device.lastMaintenance ? formatTimestamp(device.lastMaintenance) : 'Never'}</span>
              </div>
              <div className="info-item">
                <label>Installation Date</label>
                <span>{device.installationDate ? formatTimestamp(device.installationDate) : 'Not specified'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Product Information Card (for RFID readings) */}
        {product && (
          <div className="detail-card product-card">
            <h2>📦 Product Information</h2>
            <div className="product-info">
              <div className="product-header">
                {product.images && product.images.length > 0 && (
                  <img src={product.images[0].url} alt={product.images[0].alt || product.name} className="product-image" />
                )}
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-meta">
                    <span className="price">${product.price?.toFixed(2)}</span>
                    <span className="category">{product.category}</span>
                    {product.rating && product.rating.count > 0 && (
                      <span className="rating">
                        ⭐ {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
                      </span>
                    )}
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div className="product-tags">
                      {product.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="product-stats">
                <div className="stat-section">
                  <h4>Inventory Details</h4>
                  <div className="stat-grid">
                    <div className="stat-item">
                      <label>SKU</label>
                      <span>{product.inventory?.sku || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <label>Current Stock</label>
                      <span className={`stock ${product.inventory?.quantity <= (product.inventory?.lowStockThreshold || 10) ? 'low' : 'normal'}`}>
                        {product.inventory?.quantity || 0} units
                      </span>
                    </div>
                    <div className="stat-item">
                      <label>Low Stock Threshold</label>
                      <span>{product.inventory?.lowStockThreshold || 10} units</span>
                    </div>
                    <div className="stat-item">
                      <label>RFID Tag</label>
                      <span className="rfid-tag">{product.metadata?.rfidTag || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="stat-section">
                  <h4>Physical Properties</h4>
                  <div className="stat-grid">
                    <div className="stat-item">
                      <label>Weight</label>
                      <span>{product.metadata?.unitWeight ? `${product.metadata.unitWeight} kg` : 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <label>Dimensions</label>
                      <span>
                        {product.metadata?.dimensions ? 
                          `${product.metadata.dimensions.length || 0} × ${product.metadata.dimensions.width || 0} × ${product.metadata.dimensions.height || 0} cm` : 
                          'N/A'
                        }
                      </span>
                    </div>
                    <div className="stat-item">
                      <label>Status</label>
                      <span className={`status ${product.isActive ? 'active' : 'inactive'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <label>Added</label>
                      <span>{formatTimestamp(product.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="stat-section">
                    <h4>Specifications</h4>
                    <div className="stat-grid">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="stat-item">
                          <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RFID Metadata Card */}
        {reading.sensorType === 'rfid' && reading.metadata && (
          <div className="detail-card rfid-card">
            <h2>🏷️ RFID Scan Details</h2>
            <div className="rfid-details">
              {reading.metadata.rfidTag && (
                <div className="info-item">
                  <label>RFID Tag</label>
                  <span className="rfid-tag">{reading.metadata.rfidTag}</span>
                </div>
              )}
              {reading.metadata.action && (
                <div className="info-item">
                  <label>Action</label>
                  <span className={`action-badge ${reading.metadata.action}`}>
                    {reading.metadata.action?.toUpperCase()}
                  </span>
                </div>
              )}
              {reading.metadata.quantity && (
                <div className="info-item">
                  <label>Quantity</label>
                  <span className="quantity">{reading.metadata.quantity} units</span>
                </div>
              )}
              {reading.metadata.previousStock !== undefined && (
                <div className="info-item">
                  <label>Previous Stock</label>
                  <span>{reading.metadata.previousStock} units</span>
                </div>
              )}
              {reading.metadata.currentStock !== undefined && (
                <div className="info-item">
                  <label>Current Stock</label>
                  <span>{reading.metadata.currentStock} units</span>
                </div>
              )}
              {reading.metadata.productName && (
                <div className="info-item">
                  <label>Product</label>
                  <span>{reading.metadata.productName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full Metadata Card */}
        <div className="detail-card metadata-card">
          <h2>🔍 Complete Metadata</h2>
          <div className="metadata-content">
            <pre className="metadata-json">
              {JSON.stringify(reading.metadata || {}, null, 2)}
            </pre>
          </div>
        </div>

        {/* Additional Sensor Data */}
        {reading.sensorType !== 'rfid' && (
          <div className="detail-card sensor-data-card">
            <h2>📈 Sensor Data</h2>
            <div className="sensor-data">
              <div className="data-visualization">
                <div className="gauge">
                  <div className="gauge-value">
                    {formatValue(reading.value, reading.unit)}
                  </div>
                  <div className="gauge-label">{reading.sensorType}</div>
                </div>
              </div>
              
              {reading.metadata && Object.keys(reading.metadata).length > 0 && (
                <div className="additional-data">
                  <h4>Additional Parameters</h4>
                  {Object.entries(reading.metadata).map(([key, value]) => (
                    <div key={key} className="info-item">
                      <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                      <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorReadingDetail; 