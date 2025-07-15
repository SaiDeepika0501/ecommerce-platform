import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import './Toast.css';

const Toast = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`toast toast-${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="toast-content">
            <span className="toast-icon">
              {getToastIcon(notification.type)}
            </span>
            <span className="toast-message">
              {notification.message}
            </span>
            <button 
              className="toast-close"
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
            >
              ×
            </button>
          </div>
          <div className="toast-progress">
            <div 
              className="toast-progress-bar"
              style={{ 
                animationDuration: `${notification.duration}ms`,
                animationName: 'toast-progress'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast; 