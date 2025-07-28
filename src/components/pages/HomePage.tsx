'use client';

import React, { useState, useMemo, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Layers, Bot, Zap, Code, Filter } from 'lucide-react';
import Fuse from 'fuse.js';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { sanitizeSearchQuery } from '../../utils/security';
import { debounce } from 'lodash';
import ProductCard from '../ProductCard';
import QuickViewModal from '../QuickViewModal';
import Sidebar from '../organisms/Sidebar';
import Hero from '../organisms/Hero';
import BestSellers from '../home/BestSellers';
import FlashDeals from '../home/FlashDeals';
import SEO from '../SEO';
import { allProducts } from '../../data/products';
import type { Product, FilterState } from '../../types';

/**
 * HomePage - Main landing page component
 * Implements Amazon-style layout with Musk-level elegance
 * Uses sidebar navigation for reduced friction (Flow theory)
 */
const HomePage = memo(() => {
  const { addItem } = useCart();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  
  // State management - minimal for performance
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: [0, 1000],
    sources: [],
    useCases: [],
    rating: 0,
    difficulty: [],
    searchQuery: ''
  });
  
  const [showQuickView, setShowQuickView] = useState<Product | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  // Memoized Fuse.js for performance (debounced search)
  const fuse = useMemo(() => new Fuse(allProducts, {
    keys: ['name', 'tagline', 'description', 'category', 'tags'],
    threshold: 0.3,
    includeScore: true,
  }), []);
  
  // Debounced search for autocomplete (performance optimization)
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.length > 2) {
        const results = fuse.search(query).slice(0, 5);
        const suggestions = results.map(result => result.item.name);
        setSearchSuggestions(suggestions);
      } else {
        setSearchSuggestions([]);
      }
    }, 300),
    [fuse]
  );
  
  // Handle search input with debouncing
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
    setFilters(prev => ({ ...prev, searchQuery: value }));
  };

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    let products = allProducts;

    // Apply search with sanitization and debouncing
    if (filters.searchQuery.trim()) {
      const sanitizedQuery = sanitizeSearchQuery(filters.searchQuery);
      const searchResults = fuse.search(sanitizedQuery);
      products = searchResults.map((result: any) => result.item);
    }

    // Apply filters
    if (filters.category !== 'all') {
      products = products.filter(product => product.category === filters.category);
    }

    products = products.filter(product => 
      product.price >= filters.priceRange[0] && 
      product.price <= filters.priceRange[1] &&
      product.rating >= filters.rating
    );

    return products;
  }, [filters, fuse]);

  const categories = [
    { id: 'all', name: 'All Products', icon: Layers },
    { id: 'ai-models', name: 'AI Models', icon: Brain },
    { id: 'agents', name: 'AI Agents', icon: Bot },
    { id: 'automations', name: 'Automations', icon: Zap },
    { id: 'tools', name: 'Tools', icon: Code }
  ];

  return (
    <div className={`min-h-screen ${
      darkMode ? 'bg-cosmic-bg' : 'bg-gray-50'
    }`}>
      <SEO 
        title="AI Marketplace - Discover AI That Transforms Your Workflow"
        description="Professional AI solutions trusted by industry leaders. From intelligent automation to advanced models—built for results."
        keywords="AI marketplace, AI models, AI agents, automation, professional AI solutions"
      />
      
      {/* Hero Section */}
      <Hero darkMode={darkMode} />
      
      
      {/* Flash Deals - Urgency and FOMO */}
      <FlashDeals darkMode={darkMode} />
      
      {/* Best Sellers - Social Proof and Trust */}
      <BestSellers darkMode={darkMode} />
      
      {/* Main Content - Amazon-style layout */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-8">
          {/* Sidebar - Persistent on desktop, collapsible on mobile */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <Sidebar
                isOpen={true}
                onClose={() => {}}
                filters={filters}
                onFiltersChange={setFilters}
                productCount={filteredProducts.length}
                darkMode={darkMode}
              />
            </div>
          </div>

          {/* Mobile filter toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`flex items-center space-x-2 px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                darkMode 
                  ? 'bg-neural-navy/70 border-gray-600 text-gray-200 hover:border-energy-cyan hover:text-cosmic-white' 
                  : 'bg-white border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Mobile sidebar - only render on mobile screens */}
          <div className="lg:hidden">
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              filters={filters}
              onFiltersChange={setFilters}
              productCount={filteredProducts.length}
              darkMode={darkMode}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Category tabs - Fixed visibility with proper contrast */}
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFilters(prev => ({ ...prev, category: category.id }))}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all shadow-sm ${
                    filters.category === category.id
                      ? 'bg-gradient-to-r from-energy-cyan to-energy-purple text-white shadow-md transform scale-105'
                      : darkMode
                        ? 'bg-neural-navy/70 border-2 border-gray-600 text-gray-200 hover:border-energy-cyan hover:text-cosmic-white hover:shadow-md'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-200 hover:text-purple-600 hover:shadow-md'
                  }`}
                >
                  <category.icon className="w-5 h-5" />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {/* Results count with better visibility */}
            <div className="mb-4">
              <p className={`font-medium text-lg ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} found
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setShowQuickView}
                  onAddToCart={() => addItem(product)}
                  darkMode={darkMode}
                />
              ))}
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-neural-navy/50' : 'bg-gray-100'
                }`}>
                  <Search className={`w-8 h-8 ${
                    darkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  darkMode ? 'text-cosmic-white' : 'text-navy-900'
                }`}>No results found</h3>
                <p className={`mb-6 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Try adjusting your search or filters</p>
                <button
                  onClick={() => setFilters({
                    category: 'all',
                    priceRange: [0, 1000],
                    sources: [],
                    useCases: [],
                    rating: 0,
                    difficulty: [],
                    searchQuery: ''
                  })}
                  className="bg-gradient-to-r from-energy-cyan to-energy-purple hover:from-energy-cyan/80 hover:to-energy-purple/80 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick View Modal */}
      {showQuickView && (
        <QuickViewModal 
          product={showQuickView} 
          onClose={() => setShowQuickView(null)} 
        />
      )}
    </div>
  );
});

export default HomePage;