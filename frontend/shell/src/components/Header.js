import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1 spellCheck={false}>E-Commerce</h1>
          </Link>
          
          <nav className="nav">
            <Link to="/products" className="nav-link">Products</Link>
            {isAuthenticated && (
              <>
                <Link to="/orders" className="nav-link">Orders</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nav-link admin-link">Admin</Link>
                )}
              </>
            )}
          </nav>
          
          <div className="header-actions">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="cart-link">
                  Cart
                  {cartItemCount > 0 && (
                    <span className="cart-badge">{cartItemCount}</span>
                  )}
                </Link>
                <span className="user-name">Hello, {user?.name}</span>
                <button onClick={handleLogout} className="btn btn-outline">
                  Logout
                </button>
              </>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 