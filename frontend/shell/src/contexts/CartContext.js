import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

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

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [], totalAmount: 0 });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/cart');
      setCart(response.data);
    } catch (error) {
              // Error fetching cart
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/cart/add', {
        productId,
        quantity
      });
      setCart(response.data);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add item to cart' 
      };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await axios.put(`http://localhost:5000/api/cart/update/${itemId}`, {
        quantity
      });
      setCart(response.data);
    } catch (error) {
              // Error updating cart item
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await axios.delete(`http://localhost:5000/api/cart/remove/${itemId}`);
      setCart(response.data);
    } catch (error) {
              // Error removing item from cart
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      await axios.delete('http://localhost:5000/api/cart/clear');
      setCart({ items: [], totalAmount: 0 });
    } catch (error) {
              // Error clearing cart
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