import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Brain } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

/**
 * Header - Navigation component with trust-building design
 * Uses navy colors for credibility (Labrecque 2020 study)
 * Minimalist approach following Musk-level elegance principles
 */
const Header = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items, setShowCheckout } = useCart();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Clean and trustworthy */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-navy-900">
              Prometheus
            </span>
          </Link>

          {/* Desktop Navigation - Minimalist */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-600 hover:text-navy-900 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-600 hover:text-navy-900 transition-colors font-medium"
            >
              Products
            </Link>
            <Link
              to="/solutions"
              className="text-gray-600 hover:text-navy-900 transition-colors font-medium"
            >
              Solutions
            </Link>
            <Link
              to="/support"
              className="text-gray-600 hover:text-navy-900 transition-colors font-medium"
            >
              Support
            </Link>
          </nav>

          {/* Actions - Clean and functional */}
          <div className="flex items-center space-x-4">
            {/* Cart - Trust-building design */}
            <button
              onClick={() => setShowCheckout(true)}
              className="relative p-2 text-gray-600 hover:text-navy-900 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center font-medium">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Sign In - Professional CTA */}
            <button className="hidden md:block bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Sign In
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-navy-900 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="py-4 space-y-1">
                <Link
                  to="/"
                  className="block px-4 py-2 text-gray-600 hover:text-navy-900 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="block px-4 py-2 text-gray-600 hover:text-navy-900 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  to="/solutions"
                  className="block px-4 py-2 text-gray-600 hover:text-navy-900 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Solutions
                </Link>
                <Link
                  to="/support"
                  className="block px-4 py-2 text-gray-600 hover:text-navy-900 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Support
                </Link>
                <div className="px-4 py-2">
                  <button className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Sign In
                  </button>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;