import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();
const CART_STORAGE_KEY = 'pharma_cart_items';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const readStoredCart = () => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Impossible de lire le panier sauvegardé.', error);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => readStoredCart());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      const safeStock = Number(product.stock || 0);

      if (existingItem) {
        const nextQuantity = Math.min(existingItem.quantity + 1, safeStock || existingItem.quantity + 1);
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: nextQuantity } : item,
        );
      }

      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const safeStock = Number(item.stock || 0);
        const nextQuantity = safeStock > 0 ? Math.min(quantity, safeStock) : quantity;
        return { ...item, quantity: nextQuantity };
      }),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + parseFloat(item.prix) * item.quantity, 0),
    [cartItems],
  );

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
