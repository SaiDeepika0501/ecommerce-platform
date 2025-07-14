import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    inventory: {
      quantity: '',
      sku: '',
      location: 'Warehouse A'
    },
    images: [{ url: '', alt: '' }],
    specifications: [{ key: '', value: '' }]
  });

  const categories = ['Electronics', 'Clothing', 'Sports', 'Home', 'Books', 'Beauty', 'Automotive'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products || []);
    } catch (error) {
      setError('Error fetching products');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...formData.images];
    newImages[index][field] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', alt: '' }]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }));
  };

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login as admin to manage products');
        return;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        inventory: {
          ...formData.inventory,
          quantity: parseInt(formData.inventory.quantity)
        },
        images: formData.images.filter(img => img.url),
        specifications: formData.specifications.filter(spec => spec.key && spec.value)
      };

      if (editingProduct) {
        await axios.put(
          `http://localhost:5000/api/products/${editingProduct._id}`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Product updated successfully!');
      } else {
        await axios.post(
          'http://localhost:5000/api/products',
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Product created successfully!');
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      alert('Error saving product: ' + (error.response?.data?.message || error.message));
      console.error('Error:', error);
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      inventory: {
        quantity: product.inventory.quantity.toString(),
        sku: product.inventory.sku || '',
        location: product.inventory.location || 'Warehouse A'
      },
      images: product.images.length > 0 ? product.images : [{ url: '', alt: '' }],
      specifications: product.specifications.length > 0 ? product.specifications : [{ key: '', value: '' }]
    });
    setShowForm(true);
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      alert('Error deleting product: ' + (error.response?.data?.message || error.message));
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Electronics',
      inventory: {
        quantity: '',
        sku: '',
        location: 'Warehouse A'
      },
      images: [{ url: '', alt: '' }],
      specifications: [{ key: '', value: '' }]
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-management">
      <div className="header">
        <h1>Product Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {showForm && (
        <div className="product-form-container">
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Inventory</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="inventory.quantity"
                    value={formData.inventory.quantity}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    name="inventory.sku"
                    value={formData.inventory.sku}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <select
                    name="inventory.location"
                    value={formData.inventory.location}
                    onChange={handleInputChange}
                  >
                    <option value="Warehouse A">Warehouse A</option>
                    <option value="Warehouse B">Warehouse B</option>
                    <option value="Store Front">Store Front</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Product Images</h3>
              {formData.images.map((image, index) => (
                <div key={index} className="image-group">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Image URL</label>
                      <input
                        type="url"
                        value={image.url}
                        onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="form-group">
                      <label>Alt Text</label>
                      <input
                        type="text"
                        value={image.alt}
                        onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                        placeholder="Description of the image"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="btn btn-danger btn-small"
                      disabled={formData.images.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addImage} className="btn btn-secondary">
                Add Image
              </button>
            </div>

            <div className="form-section">
              <h3>Specifications</h3>
              {formData.specifications.map((spec, index) => (
                <div key={index} className="spec-group">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Specification</label>
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                        placeholder="e.g., Weight, Dimensions"
                      />
                    </div>
                    <div className="form-group">
                      <label>Value</label>
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                        placeholder="e.g., 500g, 20x15x5 cm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="btn btn-danger btn-small"
                      disabled={formData.specifications.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addSpecification} className="btn btn-secondary">
                Add Specification
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-list">
        <h2>Existing Products ({products.length})</h2>
        {products.length === 0 ? (
          <p>No products found. Create your first product!</p>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  {product.images && product.images[0] ? (
                    <img 
                      src={product.images[0].url} 
                      alt={product.images[0].alt || product.name}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/200x150/cccccc/666666?text=${encodeURIComponent(product.name)}`;
                      }}
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-details">
                    <span className="price">${product.price}</span>
                    <span className="category">{product.category}</span>
                    <span className="stock">Stock: {product.inventory.quantity}</span>
                  </div>
                  <div className="product-actions">
                    <button 
                      onClick={() => editProduct(product)}
                      className="btn btn-secondary btn-small"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteProduct(product._id)}
                      className="btn btn-danger btn-small"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement; 