import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Products.css';

const Products = () => {
  // Products component loaded via module federation
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [socket, setSocket] = useState(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(0); // Force re-renders

  // Initialize component - simplified for module federation
  useEffect(() => {
    console.log('📦 Products: Component mounted successfully via module federation');
    // Fetch products after component mounts
    fetchProducts();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      console.log('📦 Products: Fetching products...');
      setLoading(true);
      setError(''); // Clear any previous errors
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      const response = await axios.get(`http://localhost:5000/api/products?${params}`, {
        timeout: 10000, // 10 second timeout
      });
      
      console.log('📦 Products: Products fetched successfully:', response.data.products.length);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('📦 Products: Error fetching products:', error);
      setError('Error fetching products. Please try again.');
      setProducts([]); // Reset products on error
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  // Debounced search effect for search and category changes
  useEffect(() => {
    // Skip initial load as it's handled in the mount effect
    if (search || category) {
      const delayedSearch = setTimeout(() => {
        fetchProducts();
      }, 300); // 300ms delay

      return () => clearTimeout(delayedSearch);
    }
  }, [search, category, fetchProducts]);

  // Refetch products when real-time updates occur - temporarily disabled
  // useEffect(() => {
  //   if (realTimeUpdates > 0) {
  //     fetchProducts();
  //   }
  // }, [realTimeUpdates, fetchProducts]);

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to cart');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/cart/add',
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert('Item added to cart successfully!');
        // Emit inventory update event
        if (socket) {
          socket.emit('inventory-update', { productId, action: 'add-to-cart' });
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Please login to add items to cart');
      } else {
        alert(error.response?.data?.message || 'Error adding item to cart');
      }
    }
  };

  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];

  if (loading) {
    return (
      <div className="products-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={() => fetchProducts()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <header className="products-header">
        <h1>Our Products</h1>
        <div className="real-time-indicator">
          <span className={`status-dot ${socket ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">
            {socket ? '🔴 Live Updates' : '⚪ Offline'}
          </span>
        </div>
      </header>

      <div className="products-filters">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-section">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              <img
                src={product.images?.[0]?.url || '/api/placeholder/200/200'}
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/api/placeholder/200/200';
                }}
              />
              <div className="product-status">
                <span className={`inventory-badge ${product.inventory.quantity <= product.inventory.lowStockThreshold ? 'low-stock' : 'in-stock'}`}>
                  {product.inventory.quantity <= 0 ? 'Out of Stock' : 
                   product.inventory.quantity <= product.inventory.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                </span>
              </div>
            </div>
            
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              
              <div className="product-details">
                <div className="product-price">
                  <span className="current-price">${product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="original-price">${product.originalPrice}</span>
                  )}
                </div>
                
                <div className="product-inventory">
                  <span className="stock-count">
                    Stock: {product.inventory.quantity}
                  </span>
                  <span className="sku">SKU: {product.inventory.sku}</span>
                </div>
              </div>

              <div className="product-actions">
                <button
                  className="add-to-cart-btn"
                  onClick={() => addToCart(product._id)}
                  disabled={product.inventory.quantity <= 0}
                >
                  {product.inventory.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="no-products">
          <p>No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Products; 