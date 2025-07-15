import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatINR } from './utils/currency';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [cart, setCart] = useState({ items: [] });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [search, category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      const response = await axios.get(`http://localhost:5000/api/products?${params}`);
      setProducts(response.data.products);
    } catch (error) {
      setError('Error fetching products');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const getProductQuantityInCart = (productId) => {
    const cartItem = cart.items.find(item => item.product._id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const addToCart = async (productId) => {
    try {
      // Wait a moment for the global auth API to be available
      let retries = 0;
      while (!window.authAPI && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      // Check authentication status using global API
      const isAuthenticated = window.authAPI?.isAuthenticated || false;
      const token = localStorage.getItem('token');
      
      if (!isAuthenticated || !token) {
        if (window.notificationAPI) {
          window.notificationAPI.error('Please login to add items to cart');
        } else {
          alert('Please login to add items to cart');
        }
        return;
      }

      // Try to use the global cart API first
      if (window.cartAPI) {
        try {
          await window.cartAPI.addToCart(productId);
          fetchCart(); // Refresh local cart state
          return;
        } catch (error) {
          console.log('Global cart API failed, falling back to direct API call:', error);
        }
      }

      // Fallback to direct API call
      const response = await axios.post('http://localhost:5000/api/cart/add', 
        { productId, quantity: 1 },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data) {
        fetchCart(); // Refresh local cart state
        if (window.notificationAPI) {
          window.notificationAPI.success('Product added to cart!');
        }

        // Trigger cart update if global cart API exists
        if (window.cartAPI && window.cartAPI.fetchCart) {
          window.cartAPI.fetchCart();
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      const errorMessage = error.response?.data?.message || 'Error adding product to cart';
      
      if (window.notificationAPI) {
        window.notificationAPI.error(errorMessage);
      } else {
        alert(errorMessage);
      }
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity === 0) {
      return removeFromCart(productId);
    }

    try {
      const token = localStorage.getItem('token');
      const cartItem = cart.items.find(item => item.product._id === productId);
      
      if (!cartItem) return;

      const response = await axios.put(`http://localhost:5000/api/cart/update/${cartItem._id}`, {
        quantity: newQuantity
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setCart(response.data);
      
      // Update global cart if available
      if (window.cartAPI && window.cartAPI.fetchCart) {
        window.cartAPI.fetchCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      if (window.notificationAPI) {
        window.notificationAPI.error('Error updating quantity');
      }
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const cartItem = cart.items.find(item => item.product._id === productId);
      
      if (!cartItem) return;

      const response = await axios.delete(`http://localhost:5000/api/cart/remove/${cartItem._id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setCart(response.data);
      
      // Update global cart if available
      if (window.cartAPI && window.cartAPI.fetchCart) {
        window.cartAPI.fetchCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      if (window.notificationAPI) {
        window.notificationAPI.error('Error removing item');
      }
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setShowProductModal(false);
  };

  const categories = ['Electronics', 'Clothing', 'Sports', 'Home'];

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="products-container">
      <h1>Products</h1>
      
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
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

      <div className="products-grid">
        {products.map(product => {
          const quantityInCart = getProductQuantityInCart(product._id);
          return (
            <div key={product._id} className="product-card">
              <div className="product-image" onClick={() => openProductModal(product)}>
                <img src={product.images[0]?.url || '/placeholder.jpg'} alt={product.name} />
                <div className="click-overlay">
                  <span>Click to view details</span>
                </div>
              </div>
              <div className="product-info">
                <h3 onClick={() => openProductModal(product)} className="product-title-clickable">
                  {product.name}
                </h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">{formatINR(product.price)}</div>
                <div className="product-stock">
                  Stock: {product.inventory.quantity}
                </div>
                
                {/* Quantity Controls */}
                <div className="quantity-controls">
                  {quantityInCart === 0 ? (
                    <button 
                      onClick={() => addToCart(product._id)}
                      className="add-to-cart-btn"
                      disabled={product.inventory.quantity === 0}
                    >
                      {product.inventory.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  ) : (
                    <div className="quantity-adjuster">
                      <button 
                        onClick={() => updateQuantity(product._id, quantityInCart - 1)}
                        className="quantity-btn minus"
                      >
                        -
                      </button>
                      <span className="quantity-display">{quantityInCart}</span>
                      <button 
                        onClick={() => updateQuantity(product._id, quantityInCart + 1)}
                        className="quantity-btn plus"
                        disabled={quantityInCart >= product.inventory.quantity}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="no-products">
          <p>No products found. Try adjusting your search or category filter.</p>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="modal-overlay" onClick={closeProductModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeProductModal}>×</button>
            <div className="modal-content">
              <div className="modal-image">
                <img src={selectedProduct.images[0]?.url || '/placeholder.jpg'} alt={selectedProduct.name} />
              </div>
              <div className="modal-details">
                <h2>{selectedProduct.name}</h2>
                <p className="modal-description">{selectedProduct.description}</p>
                <div className="modal-price">{formatINR(selectedProduct.price)}</div>
                <div className="modal-category">Category: {selectedProduct.category}</div>
                <div className="modal-stock">Stock: {selectedProduct.inventory.quantity}</div>
                
                {/* Quantity Controls in Modal */}
                <div className="modal-quantity-controls">
                  {getProductQuantityInCart(selectedProduct._id) === 0 ? (
                    <button 
                      onClick={() => {
                        addToCart(selectedProduct._id);
                        closeProductModal();
                      }}
                      className="modal-add-to-cart-btn"
                      disabled={selectedProduct.inventory.quantity === 0}
                    >
                      {selectedProduct.inventory.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  ) : (
                    <div className="modal-quantity-adjuster">
                      <button 
                        onClick={() => updateQuantity(selectedProduct._id, getProductQuantityInCart(selectedProduct._id) - 1)}
                        className="quantity-btn minus"
                      >
                        -
                      </button>
                      <span className="quantity-display">{getProductQuantityInCart(selectedProduct._id)}</span>
                      <button 
                        onClick={() => updateQuantity(selectedProduct._id, getProductQuantityInCart(selectedProduct._id) + 1)}
                        className="quantity-btn plus"
                        disabled={getProductQuantityInCart(selectedProduct._id) >= selectedProduct.inventory.quantity}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products; 