import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Brain, Search, Sun, Moon } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

interface HeaderProps {
  darkMode?: boolean;
  toggleTheme?: () => void;
}

/**
 * Header - Navigation component with trust-building design
 * Uses navy colors for credibility (Labrecque 2020 study)
 * Minimalist approach following Musk-level elegance principles
 */
const Header = memo(({ darkMode = false, toggleTheme }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { items, setShowCheckout } = useCart();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-sm border-b shadow-sm ${
      darkMode 
        ? 'bg-neural-navy/90 border-gray-600/30' 
        : 'bg-white/95 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Clean and trustworthy */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-energy-cyan to-energy-purple rounded-xl flex items-center justify-center shadow-sm">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold hidden sm:block ${
              darkMode ? 'text-cosmic-white' : 'text-navy'
            }`}>
              Prometheus
            </span>
          </Link>

          {/* Search Bar - Central placement for easy access */}
          <div className="flex-1 max-w-2xl mx-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-energy-cyan to-energy-purple bg-clip-text text-transparent w-5 h-5" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'url(#gradient-search)'}} />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="gradient-search" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00bfff" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <input
                type="text"
                placeholder="Search AI models & Agents"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border-2 border-transparent bg-clip-padding rounded-full focus:outline-none focus:ring-2 transition-all search-input ${
                  darkMode 
                    ? 'bg-neural-navy/70 text-cosmic-white placeholder-gray-400 focus:ring-purple-500/20' 
                    : 'bg-white text-gray-900 placeholder-purple-400 focus:ring-purple-500/20'
                }`}
                style={{
                  backgroundImage: darkMode 
                    ? 'linear-gradient(rgba(0,31,63,0.7), rgba(0,31,63,0.7)), linear-gradient(90deg, #9333ea, #2563eb)'
                    : 'linear-gradient(white, white), linear-gradient(90deg, #9333ea, #2563eb)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box'
                }}
              />
            </div>
          </div>

          {/* Desktop Navigation - Minimalist */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              to="/"
              className={`transition-colors font-medium ${
                darkMode 
                  ? 'text-gray-200 hover:text-cosmic-white' 
                  : 'text-gray-600 hover:text-navy'
              }`}
            >
              Home
            </Link>
            <Link
              to="/discover"
              className={`transition-colors font-medium flex items-center space-x-1 ${
                darkMode 
                  ? 'text-gray-200 hover:text-cosmic-white' 
                  : 'text-gray-600 hover:text-navy'
              }`}
            >
              <span>Discover</span>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                darkMode 
                  ? 'bg-node-teal/20 text-node-teal border border-node-teal/30' 
                  : 'bg-green-100 text-green-700'
              }`}>New</span>
            </Link>
            <Link
              to="/community"
              className={`transition-colors font-medium ${
                darkMode 
                  ? 'text-gray-200 hover:text-cosmic-white' 
                  : 'text-gray-600 hover:text-navy'
              }`}
            >
              Community
            </Link>
          </nav>

          {/* Actions - Clean and functional */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-lg transition-all hover:scale-105 ${
                  darkMode 
                    ? 'text-gray-200 hover:text-cosmic-white hover:bg-neural-navy/50' 
                    : 'text-gray-600 hover:text-navy hover:bg-gray-50'
                }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Cart - Trust-building design */}
            <button
              onClick={() => setShowCheckout(true)}
              className={`relative p-3 transition-colors rounded-lg ${
                darkMode 
                  ? 'text-gray-200 hover:text-cosmic-white hover:bg-neural-navy/50' 
                  : 'text-gray-600 hover:text-navy hover:bg-gray-50'
              }`}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-energy-cyan text-white rounded-full text-xs flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Sign In - Professional CTA */}
            <button className="hidden md:block bg-gradient-to-r from-energy-cyan to-energy-purple hover:from-energy-cyan/80 hover:to-energy-purple/80 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-sm hover:shadow-md">
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
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{stroke: 'url(#gradient-search-mobile)'}} />
                    <svg width="0" height="0">
                      <defs>
                        <linearGradient id="gradient-search-mobile" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#9333ea" />
                          <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search AI models & Agents"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-transparent bg-clip-padding rounded-full text-gray-900 placeholder-purple-400 focus:outline-none search-input-mobile"
                      style={{
                        backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #9333ea, #2563eb)',
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'padding-box, border-box'
                      }}
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
                  <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-sm">
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