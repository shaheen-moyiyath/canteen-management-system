'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from session storage
  useEffect(() => {
    const savedCart = sessionStorage.getItem('canteen_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {}
    }
  }, []);

  // Save to session storage
  useEffect(() => {
    sessionStorage.setItem('canteen_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = (item, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.item_id === item.item_id);
      if (existing) {
        return prev.map(i =>
          i.item_id === item.item_id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, {
        item_id: item.item_id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: quantity
      }];
    });
  };

  const updateQuantity = (item_id, quantity) => {
    if (quantity <= 0) {
      removeItem(item_id);
      return;
    }
    setCartItems(prev =>
      prev.map(i => i.item_id === item_id ? { ...i, quantity } : i)
    );
  };

  const removeItem = (item_id) => {
    setCartItems(prev => prev.filter(i => i.item_id !== item_id));
  };

  const clearCart = () => {
    setCartItems([]);
    sessionStorage.removeItem('canteen_cart');
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalAmount,
        totalItemCount,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
