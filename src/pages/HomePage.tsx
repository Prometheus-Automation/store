import React, { useState, useMemo, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Layers, Bot, Zap, Code, Filter } from 'lucide-react';
import Fuse from 'fuse.js';
import { useCart } from '../contexts/CartContext';
import { sanitizeSearchQuery } from '../utils/security';
import { debounce } from 'lodash';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import Sidebar from '../components/organisms/Sidebar';
import Hero from '../components/organisms/Hero';
import BestSellers from '../components/home/BestSellers';
import FlashDeals from '../components/home/FlashDeals';
import ActivityTicker from '../components/common/ActivityTicker';
import SEO from '../components/SEO';
import { allProducts } from '../data/products';
import type { Product, FilterState } from '../types';

/**
 * HomePage - Main landing page component
 * Implements Amazon-style layout with Musk-level elegance
 * Uses sidebar navigation for reduced friction (Flow theory)
 */
const HomePage = memo(() => {
  const { addItem } = useCart();
  
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
    <div className="min-h-screen bg-bg">
      <SEO 
        title="AI Marketplace - Discover AI That Transforms Your Workflow"
        description="Professional AI solutions trusted by industry leaders. From intelligent automation to advanced models—built for results."
        keywords="AI marketplace, AI models, AI agents, automation, professional AI solutions"
      />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Live Activity Ticker - Social Proof */}
      <ActivityTicker />
      
      {/* Flash Deals - Urgency and FOMO */}
      <FlashDeals />
      
      {/* Best Sellers - Social Proof and Trust */}
      <BestSellers />
      
      {/* Main Content - Amazon-style layout */}
      <div className="max-w-7xl mx-auto px-6 py-12">
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
              />
            </div>
          </div>

          {/* Mobile filter toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center space-x-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:border-primary hover:text-primary transition-all"
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
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md transform scale-105'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-200 hover:text-purple-600 hover:shadow-md'
                  }`}
                >
                  <category.icon className="w-5 h-5" />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {/* Results count with better visibility */}
            <div className="mb-6">
              <p className="text-gray-700 font-medium text-lg">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} found
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setShowQuickView}
                  onAddToCart={() => addItem(product)}
                />
              ))}
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-navy-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
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
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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