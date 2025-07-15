import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { success, error: showError } = useNotification();

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [], totalAmount: 0 });
    }
  }, [isAuthenticated]);

  // Expose cart functions globally for micro-frontends
  useEffect(() => {
    window.cartAPI = {
      addToCart: addToCart,
      updateQuantity: updateCartItem,
      removeFromCart: removeFromCart,
      refreshCart: fetchCart,
      fetchCart: fetchCart,
      getCartCount: getCartItemCount,
      getCart: () => cart
    };
    
    return () => {
      delete window.cartAPI;
    };
  }, [cart]);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      showError('Please login to add items to cart');
      throw new Error('Please login to add items to cart');
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/cart/add', {
        productId,
        quantity
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCart(response.data);
      success('Item added to cart!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add item to cart';
      showError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/cart/update/${itemId}`, {
        quantity
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCart(response.data);
      success('Cart updated successfully');
    } catch (error) {
      console.error('Error updating cart item:', error);
      showError('Error updating cart item');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/cart/remove/${itemId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCart(response.data);
      success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      showError('Error removing item from cart');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/cart/clear', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCart({ items: [], totalAmount: 0 });
      success('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      showError('Error clearing cart');
    } finally {
      setLoading(false);
    }
  };

  const getCartItemCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
    cartItemCount: getCartItemCount()
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 