import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      setCartItems([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/cart');
      setCart(response.data);
      setCartItems(response.data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/cart', { productId, quantity });
      setCart(response.data);
      setCartItems(response.data.items || []);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add item to cart';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/cart/${productId}`, { quantity });
      setCart(response.data);
      setCartItems(response.data.items || []);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update cart item';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.delete(`/cart/${productId}`);
      setCart(response.data);
      setCartItems(response.data.items || []);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove item from cart';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearCartState = () => {
    setCart(null);
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        loading,
        error,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
