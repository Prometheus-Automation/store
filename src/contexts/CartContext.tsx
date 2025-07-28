'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import toast from 'react-hot-toast';
import { Product, CartItem, CartContextType } from '../types';

const CartContext = createContext<CartContextType | undefined>(undefined);

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items]);

  const addItem = (product: Product) => {
    setItems(current => {
      const existing = current.find(item => item.product.id === product.id);
      if (existing) {
        return current.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { product, quantity: 1 }];
    });

    // Professional success notification (no gimmicky animations)
    toast.success(`${product.name} added to cart`, {
      duration: 2000,
      style: {
        background: '#001f3f', // Navy for trust
        color: 'white',
        border: '1px solid #334155',
      },
    });
  };

  const removeItem = (productId: string | number) => {
    setItems(current => current.filter(item => item.product.id !== productId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(current => 
      current.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.success('Cart cleared');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart,
      totalItems, 
      totalPrice,
      showCheckout,
      setShowCheckout
    }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export { CartProvider, useCart };