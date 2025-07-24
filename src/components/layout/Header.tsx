import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Brain, Search } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

/**
 * Header - Navigation component with trust-building design
 * Uses navy colors for credibility (Labrecque 2020 study)
 * Minimalist approach following Musk-level elegance principles
 */
const Header = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { items, setShowCheckout } = useCart();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Clean and trustworthy */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-navy hidden sm:block">
              Prometheus
            </span>
          </Link>

          {/* Search Bar - Central placement for easy access */}
          <div className="flex-1 max-w-2xl mx-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search AI models, agents, automations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Desktop Navigation - Minimalist */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-navy transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/discover"
              className="text-gray-600 hover:text-navy transition-colors font-medium flex items-center space-x-1"
            >
              <span>Discover</span>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">New</span>
            </Link>
            <Link
              to="/community"
              className="text-gray-600 hover:text-navy transition-colors font-medium"
            >
              Community
            </Link>
          </nav>

          {/* Actions - Clean and functional */}
          <div className="flex items-center space-x-4">
            {/* Cart - Trust-building design */}
            <button
              onClick={() => setShowCheckout(true)}
              className="relative p-3 text-gray-600 hover:text-navy transition-colors hover:bg-gray-50 rounded-lg"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Sign In - Professional CTA */}
            <button className="hidden md:block bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-sm hover:shadow-md">
              Sign In
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 text-gray-600 hover:text-navy transition-colors hover:bg-gray-50 rounded-lg"
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
              className="lg:hidden border-t border-gray-200 bg-white"
            >
              <div className="py-4 space-y-1">
                {/* Mobile Search */}
                <div className="px-4 pb-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search AI models..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                
                <Link
                  to="/"
                  className="block px-4 py-3 text-gray-700 hover:text-navy hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/discover"
                  className="block px-4 py-3 text-gray-700 hover:text-navy hover:bg-blue-50 rounded-lg transition-colors font-medium flex items-center justify-between"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Discover</span>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">New</span>
                </Link>
                <Link
                  to="/community"
                  className="block px-4 py-3 text-gray-700 hover:text-navy hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Community
                </Link>
                <div className="px-4 py-2 mt-4 border-t border-gray-100">
                  <button className="w-full bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-sm">
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