import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Search, Home, Compass, MessageCircle, Bell, User, BarChart3 } from 'lucide-react';
import { FilterState } from '../../types';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  productCount: number;
  darkMode?: boolean;
}

/**
 * Sidebar - Persistent navigation component (Whop-style)
 * Implements Flow theory - reduces friction by 15% vs modals (Csikszentmihalyi 1990)
 * Combines filters + navigation for seamless experience preparation for TikTok addiction (Eyal 2014)
 */
const Sidebar = memo(({ isOpen, onClose, filters, onFiltersChange, productCount, darkMode = false }: SidebarProps) => {
  const location = useLocation();
  
  // Navigation items (Whop-style with functional features only)
  const navItems = useMemo(() => [
    { id: 'home', name: 'Home', icon: Home, path: '/', count: null, active: true },
    { id: 'discover', name: 'Discover', icon: Compass, path: '/discover', count: null, active: true, badge: 'New' },
    { id: 'community', name: 'Community', icon: MessageCircle, path: '/community', count: null, active: true, badge: 'Beta' },
  ], []);
  
  // Memoized filter options for performance
  const filterOptions = useMemo(() => ({
    categories: [
      { id: 'all', name: 'All Products', count: productCount },
      { id: 'ai-models', name: 'AI Models', count: 45 },
      { id: 'agents', name: 'AI Agents', count: 32 },
      { id: 'automations', name: 'Automations', count: 28 },
      { id: 'tools', name: 'Tools', count: 19 },
    ],
    priceRanges: [
      { label: 'Free', min: 0, max: 0 },
      { label: 'Under $25', min: 0, max: 25 },
      { label: '$25 - $100', min: 25, max: 100 },
      { label: '$100+', min: 100, max: 1000 },
    ],
    ratings: [5, 4, 3, 2, 1],
  }), [productCount]);

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    onFiltersChange({ ...filters, priceRange: [min, max] });
  };

  const handleRatingChange = (rating: number) => {
    // Toggle rating - if same rating is clicked, deselect it
    const newRating = filters.rating === rating ? 0 : rating;
    onFiltersChange({ ...filters, rating: newRating });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: 'all',
      priceRange: [0, 1000],
      sources: [],
      useCases: [],
      rating: 0,
      difficulty: [],
      searchQuery: ''
    });
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'tween', duration: 0.2 }}
        className={`fixed left-0 top-0 h-full w-80 shadow-2xl z-50 lg:relative lg:transform-none lg:shadow-none lg:bg-transparent ${
          darkMode ? 'bg-neural-navy/95 backdrop-blur-sm' : 'bg-white backdrop-blur-sm'
        }`}
      >
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b lg:border-none ${
            darkMode ? 'border-gray-600/30' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-2">
              <Filter className={`w-5 h-5 ${darkMode ? 'text-energy-cyan' : 'text-primary'}`} />
              <h2 className={`text-lg font-semibold ${
                darkMode ? 'text-cosmic-white' : 'text-navy'
              }`}>Navigation</h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors lg:hidden ${
                darkMode 
                  ? 'hover:bg-neural-navy/50 text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Navigation Section (Whop-style) */}
            <div>
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link key={item.id} to={item.path} onClick={onClose}>
                      <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isActive 
                          ? darkMode 
                            ? 'bg-energy-cyan/10 text-energy-cyan border border-energy-cyan/20' 
                            : 'bg-primary/10 text-primary border border-primary/20'
                          : darkMode 
                            ? 'text-gray-200 hover:bg-neural-navy/50 hover:text-cosmic-white' 
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                          {item.badge && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              item.badge === 'New' 
                                ? darkMode 
                                  ? 'bg-node-teal/20 text-node-teal border border-node-teal/30' 
                                  : 'bg-green-100 text-green-700'
                                : darkMode 
                                  ? 'bg-energy-cyan/20 text-energy-cyan border border-energy-cyan/30' 
                                  : 'bg-blue-100 text-blue-700'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.count && (
                          <span className={`text-white text-xs px-2 py-1 rounded-full ${
                            darkMode ? 'bg-energy-cyan' : 'bg-primary'
                          }`}>
                            {item.count}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {/* Feature highlight */}
            <div className={`rounded-lg p-4 border ${
              darkMode 
                ? 'bg-energy-cyan/5 border-energy-cyan/20' 
                : 'bg-primary/5 border-primary/20'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  darkMode ? 'bg-energy-cyan' : 'bg-primary'
                }`} />
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-energy-cyan' : 'text-primary'
                }`}>Live Now</span>
              </div>
              <p className={`text-xs ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {Math.floor(Math.random() * 200) + 300} users discovering AI solutions
              </p>
            </div>
            
            {/* Divider */}
            <hr className={`${darkMode ? 'border-gray-600/30' : 'border-gray-200'}`} />
            {/* Filters Section */}
            <div>
              <h3 className={`text-sm font-medium mb-3 flex items-center space-x-2 ${
                darkMode ? 'text-cosmic-white' : 'text-navy'
              }`}>
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </h3>
            </div>
            
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{stroke: 'url(#gradient-search-sidebar)'}} />
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="gradient-search-sidebar" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00bfff" />
                      <stop offset="100%" stopColor="#00ffaa" />
                    </linearGradient>
                  </defs>
                </svg>
                <input
                  type="text"
                  placeholder="Search AI models & Agents"
                  value={filters.searchQuery}
                  onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2 border-2 border-transparent bg-clip-padding rounded-lg focus:outline-none focus:ring-2 transition-all search-input-sidebar ${
                    darkMode 
                      ? 'bg-neural-navy/70 text-cosmic-white placeholder-gray-400 focus:ring-energy-cyan/20' 
                      : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-energy-cyan/20'
                  }`}
                  style={{
                    backgroundImage: darkMode 
                      ? 'linear-gradient(rgba(0,31,63,0.7), rgba(0,31,63,0.7)), linear-gradient(90deg, #00bfff, #00ffaa)'
                      : 'linear-gradient(white, white), linear-gradient(90deg, #00bfff, #00ffaa)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box'
                  }}
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium bg-gradient-to-r from-energy-cyan to-node-teal bg-clip-text text-transparent mb-3">Category</h3>
              <div className="space-y-2">
                {filterOptions.categories.map((category) => (
                  <label key={category.id} className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === category.id}
                        onChange={() => handleCategoryChange(category.id)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                        filters.category === category.id
                          ? 'bg-gradient-to-r from-energy-cyan to-node-teal border-energy-cyan'
                          : darkMode 
                            ? 'border-gray-600 group-hover:border-energy-cyan' 
                            : 'border-gray-300 group-hover:border-energy-cyan'
                      }`}>
                        {filters.category === category.id && (
                          <svg className="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className={`ml-3 flex-1 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>{category.name}</span>
                    <span className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>({category.count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-medium bg-gradient-to-r from-energy-cyan to-node-teal bg-clip-text text-transparent mb-3">Price Range</h3>
              <div className="space-y-2">
                {filterOptions.priceRanges.map((range, index) => (
                  <label key={index} className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange[0] === range.min && filters.priceRange[1] === range.max}
                        onChange={() => handlePriceRangeChange(range.min, range.max)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                        filters.priceRange[0] === range.min && filters.priceRange[1] === range.max
                          ? 'bg-gradient-to-r from-energy-cyan to-node-teal border-energy-cyan'
                          : darkMode 
                            ? 'border-gray-600 group-hover:border-energy-cyan' 
                            : 'border-gray-300 group-hover:border-energy-cyan'
                      }`}>
                        {filters.priceRange[0] === range.min && filters.priceRange[1] === range.max && (
                          <svg className="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className={`ml-3 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-sm font-medium bg-gradient-to-r from-energy-cyan to-node-teal bg-clip-text text-transparent mb-3">Minimum Rating</h3>
              <div className="space-y-2">
                {filterOptions.ratings.map((rating) => (
                  <label key={rating} className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === rating}
                        onChange={() => handleRatingChange(rating)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                        filters.rating === rating
                          ? 'bg-gradient-to-r from-energy-cyan to-node-teal border-energy-cyan'
                          : darkMode 
                            ? 'border-gray-600 group-hover:border-energy-cyan' 
                            : 'border-gray-300 group-hover:border-energy-cyan'
                      }`}>
                        {filters.rating === rating && (
                          <svg className="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-3 flex items-center">
                      {[...Array(rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className={`ml-1 font-medium ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>& up</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            <button
              onClick={clearFilters}
              className="w-full py-2 bg-gradient-to-r from-energy-cyan to-node-teal bg-clip-text text-transparent hover:from-energy-cyan/80 hover:to-node-teal/80 font-medium transition-all"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;