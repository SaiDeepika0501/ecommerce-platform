import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      <div className="container">
        <div className="hero-section">
          <h1>Welcome to Modular E-Commerce</h1>
          <p>Experience the future of scalable online shopping with our micro-frontend architecture</p>
          {!isAuthenticated && (
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-outline">Login</Link>
            </div>
          )}
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>🏗️ Micro-Frontend Architecture</h3>
            <p>Independent development and deployment of each feature, enabling teams to work autonomously</p>
          </div>
          
          <div className="feature-card">
            <h3>📦 Product Management</h3>
            <p>Comprehensive product catalog with advanced search and filtering capabilities</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
          
          <div className="feature-card">
            <h3>🛒 Smart Shopping Cart</h3>
            <p>Real-time cart management with inventory validation and seamless checkout</p>
            {isAuthenticated && (
              <Link to="/cart" className="btn btn-primary">View Cart</Link>
            )}
          </div>
          
          <div className="feature-card">
            <h3>📊 Order Management</h3>
            <p>Complete order tracking from placement to delivery with real-time updates</p>
            {isAuthenticated && (
              <Link to="/orders" className="btn btn-primary">My Orders</Link>
            )}
          </div>
          
          <div className="feature-card">
            <h3>⚡ Real-time Updates</h3>
            <p>Live inventory tracking and order status updates using WebSocket connections</p>
          </div>
          
          <div className="feature-card">
            <h3>🔌 IoT Integration</h3>
            <p>Ready for integration with IoT devices for automated inventory management</p>
          </div>
        </div>

        <div className="tech-stack">
          <h2>Built with Modern Technologies</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <h4>Frontend</h4>
              <ul>
                <li>React 18</li>
                <li>Webpack Module Federation</li>
                <li>React Router</li>
                <li>Socket.IO Client</li>
              </ul>
            </div>
            <div className="tech-item">
              <h4>Backend</h4>
              <ul>
                <li>Node.js & Express</li>
                <li>MongoDB & Mongoose</li>
                <li>Socket.IO</li>
                <li>JWT Authentication</li>
              </ul>
            </div>
            <div className="tech-item">
              <h4>Architecture</h4>
              <ul>
                <li>Microservices</li>
                <li>Micro-frontends</li>
                <li>Real-time Communication</li>
                <li>Scalable Design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 