import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import type { Product, CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Animated cart notification component
const CartNotification = ({ product, onComplete }: { product: Product; onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: 50 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -50, x: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 max-w-sm border border-green-200"
    >
      <div className="flex items-center space-x-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className="bg-green-500 rounded-full p-2"
        >
          <Check size={16} className="text-white" />
        </motion.div>
        
        <div className="flex-1">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-semibold text-gray-900 text-sm"
          >
            Added to cart!
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 text-xs truncate"
          >
            {product.name}
          </motion.p>
        </div>
        
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <ShoppingCart size={20} className="text-blue-600" />
        </motion.div>
      </div>
      
      {/* Rocket animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0, x: 20, y: 20 }}
        animate={{ 
          opacity: [0, 1, 1, 0], 
          scale: [0, 1.2, 1.5, 0],
          x: [20, -10, -20, -30],
          y: [20, -10, -30, -50],
          rotate: [0, 45, 90, 135]
        }}
        transition={{ duration: 1.5, delay: 0.8 }}
        className="absolute -top-2 -right-2 text-2xl"
      >
        🚀
      </motion.div>
    </motion.div>
  );
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('prometheus-cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Product[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('prometheus-cart', JSON.stringify(items));
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

    // Add notification
    setNotifications(prev => [...prev, product]);
  };

  const removeItem = (productId: string | number) => {
    setItems(current => current.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(current =>
      current.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setIsOpen(false);
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const removeNotification = (product: Product) => {
    setNotifications(prev => prev.filter(p => p.id !== product.id));
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
        isOpen,
        setIsOpen
      }}
    >
      {children}
      
      {/* Render notifications */}
      <AnimatePresence>
        {notifications.map((product, index) => (
          <motion.div
            key={`${product.id}-${index}`}
            style={{ bottom: `${4 + index * 80}px` }}
            className="fixed right-4 z-50"
          >
            <CartNotification
              product={product}
              onComplete={() => removeNotification(product)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}