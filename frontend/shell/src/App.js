import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

// Create fallback component for failed module loads
const createFallbackComponent = (moduleName) => () => (
  <div style={{
    padding: '20px',
    textAlign: 'center',
    border: '1px solid #dc3545',
    borderRadius: '8px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    margin: '20px'
  }}>
    <h3>⚠️ {moduleName} Service Unavailable</h3>
    <p>Unable to load the {moduleName.toLowerCase()} module.</p>
    <p>Please check if the service is running and try again.</p>
    <button
      onClick={() => window.location.reload()}
      style={{
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '10px'
      }}
    >
      Reload Page
    </button>
  </div>
);

// Simple React.lazy imports
const Products = React.lazy(() => 
  import('products/Products')
    .catch(() => ({ default: createFallbackComponent('Products') }))
);

const Cart = React.lazy(() => 
  import('cart/Cart')
    .catch(() => ({ default: createFallbackComponent('Cart') }))
);

const UserProfile = React.lazy(() => 
  import('users/UserProfile')
    .catch(() => ({ default: createFallbackComponent('User Profile') }))
);

const AdminDashboard = React.lazy(() => 
  import('admin/AdminDashboard')
    .catch(() => ({ default: createFallbackComponent('Admin Dashboard') }))
);

const Orders = React.lazy(() => 
  import('orders/Orders')
    .catch(() => ({ default: createFallbackComponent('Orders') }))
);

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple app initialization
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading E-commerce Platform...</p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
            <div className="App">
              <Header />
              <main className="main-content">
                <ErrorBoundary>
                  <React.Suspense fallback={
                    <div className="loading">
                      <div className="spinner"></div>
                      <p>Loading module...</p>
                    </div>
                  }>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/products/*" element={
                        <ErrorBoundary>
                          <Products />
                        </ErrorBoundary>
                      } />
                      <Route path="/cart" element={
                        <ErrorBoundary>
                          <Cart />
                        </ErrorBoundary>
                      } />
                      <Route path="/profile" element={
                        <ErrorBoundary>
                          <UserProfile />
                        </ErrorBoundary>
                      } />
                      <Route path="/orders" element={
                        <ErrorBoundary>
                          <Orders />
                        </ErrorBoundary>
                      } />
                      <Route path="/admin/*" element={
                        <ErrorBoundary>
                          <AdminDashboard />
                        </ErrorBoundary>
                      } />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </React.Suspense>
                </ErrorBoundary>
              </main>
              <Footer />
            </div>
          </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App; 