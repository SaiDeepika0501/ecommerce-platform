import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Enhanced bootstrap with better error handling for module federation
const bootstrap = async () => {
  try {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    // Bootstrap error occurred
    // Fallback rendering
    document.getElementById('root').innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h2>⚠️ Application Loading Error</h2>
        <p>Unable to load the application. Please refresh the page.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
};

bootstrap(); 