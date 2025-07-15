import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const connectionRef = useRef(null);
  const lastConnectTime = useRef(0);

  useEffect(() => {
    // Prevent rapid reconnections
    const now = Date.now();
    if (now - lastConnectTime.current < 1000) {
      return;
    }

    if (isAuthenticated && !connectionRef.current) {
      lastConnectTime.current = now;
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket'],
        upgrade: false,
        rememberUpgrade: false
      });
      
      connectionRef.current = newSocket;

      newSocket.on('connect', () => {
        setConnected(true);
        if (process.env.NODE_ENV === 'development') {
          console.log('🔌 Connected to server');
        }
        
        // Join user-specific room
        if (user?._id) {
          newSocket.emit('join-room', user._id);
        }
      });

      newSocket.on('disconnect', () => {
        setConnected(false);
        if (process.env.NODE_ENV === 'development') {
          console.log('🔌 Disconnected from server');
        }
      });

      newSocket.on('inventory-updated', (data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('📦 Inventory updated:', data);
        }
        // Handle inventory updates
      });

      newSocket.on('order-status-updated', (data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('📋 Order status updated:', data);
        }
        // Handle order status updates
      });

      setSocket(newSocket);

      return () => {
        if (connectionRef.current) {
          connectionRef.current.close();
          connectionRef.current = null;
        }
      };
    } else if (!isAuthenticated && connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
      setSocket(null);
      setConnected(false);
    }
  }, [isAuthenticated, user?._id]); // Only depend on auth state and user ID

  const value = {
    socket,
    connected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 