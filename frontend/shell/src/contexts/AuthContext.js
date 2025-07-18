import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios defaults and expose auth state globally
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user info
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }

    // Expose authentication API globally for micro-frontends
    window.authAPI = {
      get isAuthenticated() {
        const token = localStorage.getItem('token');
        return !!(token && user);
      },
      get user() {
        return user;
      },
      get token() {
        return localStorage.getItem('token');
      },
      getAuthHeaders() {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
      }
    };

    // Also expose it on the global object for easier access
    if (typeof window !== 'undefined') {
      window.getAuthStatus = () => ({
        isAuthenticated: !!(localStorage.getItem('token') && user),
        user: user,
        token: localStorage.getItem('token')
      });
    }
  }, [user]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Token might be invalid, clear it
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, ...userData } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(userData);

      // Update global auth API
      window.authAPI = {
        get isAuthenticated() {
          return !!(localStorage.getItem('token') && userData);
        },
        get user() {
          return userData;
        },
        get token() {
          return localStorage.getItem('token');
        },
        getAuthHeaders() {
          return { 'Authorization': `Bearer ${token}` };
        }
      };

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      const { token, ...userInfo } = response.data;
      
      // Store token and auto-login after registration
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userInfo);

      // Update global auth API
      window.authAPI = {
        get isAuthenticated() {
          return !!(localStorage.getItem('token') && userInfo);
        },
        get user() {
          return userInfo;
        },
        get token() {
          return localStorage.getItem('token');
        },
        getAuthHeaders() {
          return { 'Authorization': `Bearer ${token}` };
        }
      };
      
      return { success: true, user: userInfo };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    // Clear token and user data
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);

    // Update global auth API
    window.authAPI = {
      get isAuthenticated() {
        return false;
      },
      get user() {
        return null;
      },
      get token() {
        return null;
      },
      getAuthHeaders() {
        return {};
      }
    };
  };

  const isAuthenticated = !!(user && localStorage.getItem('token'));

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 