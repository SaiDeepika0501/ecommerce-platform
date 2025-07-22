import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Modular E-Commerce</h3>
            <p>Built with micro-frontends and modern technologies</p>
          </div>
          
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>Micro-frontends architecture</li>
              <li>Real-time inventory tracking</li>
              <li>IoT integration ready</li>
              <li>Independent deployments</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Technology Stack</h4>
            <ul>
              <li>React & Webpack Module Federation</li>
              <li>Node.js & Express</li>
              <li>MongoDB & Socket.IO</li>
              <li>Microservices Architecture</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Modular E-Commerce Platform. Built for scalability and modern integration.</p>
          <p className="dev-credits">🎓 Student Project by <strong>Sai Deepika</strong> & <strong>Uha Smitha</strong></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 