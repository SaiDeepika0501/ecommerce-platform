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

  useEffect(() => {
    fetchProducts();
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

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to cart');
        return;
      }

      await axios.post(
        'http://localhost:5000/api/cart/add',
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Item added to cart!');
    } catch (error) {
      alert('Error adding item to cart');
      console.error('Error:', error);
    }
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
        {products.map(product => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              <img src={product.images[0]?.url || '/placeholder.jpg'} alt={product.name} />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-price">{formatINR(product.price)}</div>
              <div className="product-stock">
                Stock: {product.inventory.quantity}
              </div>
              <button 
                onClick={() => addToCart(product._id)}
                className="add-to-cart-btn"
                disabled={product.inventory.quantity === 0}
              >
                {product.inventory.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="no-products">
          <p>No products found. Try adjusting your search or category filter.</p>
        </div>
      )}
    </div>
  );
};

export default Products; 