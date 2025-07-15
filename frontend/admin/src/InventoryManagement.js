import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatINR } from './utils/currency';
import './InventoryManagement.css';

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    lowStockProducts: [],
    outOfStockProducts: 0,
    lowStockCount: 0,
    inStockCount: 0,
    totalValue: 0
  });
  const [activeStockTab, setActiveStockTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    sku: '',
    lowStockThreshold: 10
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, activeStockTab, searchTerm, sortBy, sortOrder]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/products?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        // Handle both array format and paginated format
        let productsData = Array.isArray(response.data) ? response.data : (response.data.products || []);
        
        // Map the backend data structure to frontend expectations
        productsData = productsData.map(product => ({
          ...product,
          // Map inventory object to flat structure for compatibility
          stock: product.inventory?.quantity || product.stock || 0,
          sku: product.inventory?.sku || product.sku || '',
          lowStockThreshold: product.inventory?.lowStockThreshold || product.lowStockThreshold || 10
        }));
        
        setProducts(productsData);
        calculateInventoryStats(productsData);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
    setLoading(false);
  };

  const calculateInventoryStats = (productsData) => {
    const stats = {
      totalProducts: productsData.length,
      lowStockProducts: [],
      outOfStockProducts: 0,
      lowStockCount: 0,
      inStockCount: 0,
      totalValue: 0
    };

    productsData.forEach(product => {
      const stock = product.stock || 0;
      const price = product.price || 0;
      const lowThreshold = product.lowStockThreshold || 10;

      stats.totalValue += stock * price;

      if (stock === 0) {
        stats.outOfStockProducts++;
      } else if (stock <= lowThreshold) {
        stats.lowStockCount++;
        stats.lowStockProducts.push(product);
      } else {
        stats.inStockCount++;
      }
    });

    setInventoryStats(stats);
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by stock status
    if (activeStockTab !== 'all') {
      filtered = filtered.filter(product => {
        const stock = product.stock || 0;
        const lowThreshold = product.lowStockThreshold || 10;

        switch (activeStockTab) {
          case 'in-stock':
            return stock > lowThreshold;
          case 'low-stock':
            return stock > 0 && stock <= lowThreshold;
          case 'out-of-stock':
            return stock === 0;
          default:
            return true;
        }
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name || '';
          valueB = b.name || '';
          break;
        case 'price':
          valueA = a.price || 0;
          valueB = b.price || 0;
          break;
        case 'stock':
          valueA = a.stock || 0;
          valueB = b.stock || 0;
          break;
        case 'category':
          valueA = a.category || '';
          valueB = b.category || '';
          break;
        default:
          valueA = a.name || '';
          valueB = b.name || '';
          break;
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Format the product data to match backend schema
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        inventory: {
          quantity: parseInt(newProduct.stock),
          sku: newProduct.sku,
          lowStockThreshold: parseInt(newProduct.lowStockThreshold)
        }
      };
      
      await axios.post('http://localhost:5000/api/products', productData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        sku: '',
        lowStockThreshold: 10
      });
      setShowAddForm(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateProduct = async (productId, updates) => {
    try {
      const token = localStorage.getItem('token');
      
      // Format updates to match backend schema
      const formattedUpdates = { ...updates };
      
      // If updating stock, format it properly for the backend
      if (updates.stock !== undefined) {
        formattedUpdates.inventory = {
          quantity: parseInt(updates.stock)
        };
        delete formattedUpdates.stock;
      }
      
      await axios.put(`http://localhost:5000/api/products/${productId}`, formattedUpdates, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchProducts();
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const getStockStatus = (product) => {
    const stock = product.stock || 0;
    const lowThreshold = product.lowStockThreshold || 10;

    if (stock === 0) return 'out-of-stock';
    if (stock <= lowThreshold) return 'low-stock';
    return 'in-stock';
  };

  const getStockColor = (status) => {
    const colors = {
      'in-stock': '#28a745',
      'low-stock': '#ffc107',
      'out-of-stock': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const stockTabs = [
    { key: 'all', label: 'All Products', count: inventoryStats.totalProducts },
    { key: 'in-stock', label: 'In Stock', count: inventoryStats.inStockCount },
    { key: 'low-stock', label: 'Low Stock', count: inventoryStats.lowStockCount },
    { key: 'out-of-stock', label: 'Out of Stock', count: inventoryStats.outOfStockProducts }
  ];

  return (
    <div className="inventory-management">
      <div className="inventory-header">
        <h2>📦 Inventory Management</h2>
        <div className="header-actions">
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="add-product-btn"
          >
            ➕ Add Product
          </button>
          <button 
            onClick={fetchProducts} 
            className="refresh-btn" 
            disabled={loading}
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-number">{inventoryStats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card in-stock">
          <div className="stat-number">{inventoryStats.inStockCount}</div>
          <div className="stat-label">In Stock</div>
        </div>
        <div className="stat-card low-stock">
          <div className="stat-number">{inventoryStats.lowStockCount}</div>
          <div className="stat-label">Low Stock</div>
        </div>
        <div className="stat-card out-of-stock">
          <div className="stat-number">{inventoryStats.outOfStockProducts}</div>
          <div className="stat-label">Out of Stock</div>
        </div>
        <div className="stat-card total-value">
          <div className="stat-number">{formatINR(inventoryStats.totalValue)}</div>
          <div className="stat-label">Total Value</div>
        </div>
      </div>

      {/* Stock Status Tabs */}
      <div className="status-tabs">
        {stockTabs.map(tab => (
          <button
            key={tab.key}
            className={`status-tab ${activeStockTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveStockTab(tab.key)}
            style={{
              '--status-color': tab.key !== 'all' ? getStockColor(tab.key) : '#007bff'
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
            placeholder="🔍 Search by name, category, or SKU..."
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
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
          </select>
          
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-direction"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="add-product-form">
          <h3>Add New Product</h3>
          <form onSubmit={handleAddProduct}>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="SKU"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Low Stock Threshold"
                value={newProduct.lowStockThreshold}
                onChange={(e) => setNewProduct({...newProduct, lowStockThreshold: e.target.value})}
              />
            </div>
            <textarea
              placeholder="Product Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              rows="3"
            />
            <div className="form-actions">
              <button type="submit" className="save-btn">Save Product</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">Loading inventory...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-data">
            {activeStockTab === 'all' ? 'No products found' : `No ${activeStockTab.replace('-', ' ')} products found`}
          </div>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product._id}>
                    <td>
                      <div className="product-info">
                        <div className="product-name">{product.name}</div>
                        <div className="product-description">{product.description}</div>
                      </div>
                    </td>
                    <td className="sku">{product.sku || 'N/A'}</td>
                    <td>{product.category}</td>
                    <td className="price">{formatINR(product.price)}</td>
                    <td>
                      {editingProduct === product._id ? (
                        <input
                          type="number"
                          defaultValue={product.stock}
                          onBlur={(e) => handleUpdateProduct(product._id, {stock: parseInt(e.target.value)})}
                          className="stock-input"
                        />
                      ) : (
                        <span className="stock-quantity">{product.stock || 0}</span>
                      )}
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStockColor(stockStatus) }}
                      >
                        {stockStatus.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="value">{formatINR((product.stock || 0) * (product.price || 0))}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => setEditingProduct(editingProduct === product._id ? null : product._id)}
                          className="edit-btn"
                          title="Edit Stock"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="delete-btn"
                          title="Delete Product"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement; 