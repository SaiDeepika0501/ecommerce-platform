import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

// Lazy load micro-frontends
const Products = React.lazy(() => import('products/Products'));
const Cart = React.lazy(() => import('cart/Cart'));
const UserProfile = React.lazy(() => import('users/UserProfile'));
const Orders = React.lazy(() => import('orders/Orders'));

// Admin module components
const AdminDashboard = React.lazy(() => import('admin/AdminDashboard'));
const UserManagement = React.lazy(() => import('admin/UserManagement'));
const OrderManagement = React.lazy(() => import('admin/OrderManagement'));

// Protected Route Component for Admin
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user?.isAdmin) {
    return (
      <div className="access-denied">
        <div className="container">
          <div className="access-denied-content">
            <h1>🚫 Access Denied</h1>
            <p>You need administrator privileges to access this page.</p>
            <p>Please contact your system administrator if you believe this is an error.</p>
            <div className="demo-info">
              <strong>Demo Admin Account:</strong><br />
              Email: admin@example.com<br />
              Password: password123
            </div>
            <div className="actions">
              <button onClick={() => window.history.back()} className="btn btn-outline">
                Go Back
              </button>
              <a href="/login" className="btn btn-primary">
                Login as Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return children;
};

function AppContent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    setTimeout(() => setLoading(false), 1000);
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
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <React.Suspense fallback={<div className="loading">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products/*" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/orders/*" element={<Orders />} />
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/users" element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } />
              <Route path="/admin/orders" element={
                <AdminRoute>
                  <OrderManagement />
                </AdminRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App; 