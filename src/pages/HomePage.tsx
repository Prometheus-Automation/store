import React, { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Layers, Bot, Zap, Code, Filter } from 'lucide-react';
import Fuse from 'fuse.js';
import { useCart } from '../contexts/CartContext';
import { sanitizeSearchQuery } from '../utils/security';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import Sidebar from '../components/organisms/Sidebar';
import Hero from '../components/organisms/Hero';
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

  // Memoized Fuse.js for performance (debounced search)
  const fuse = useMemo(() => new Fuse(allProducts, {
    keys: ['name', 'tagline', 'description', 'category', 'tags'],
    threshold: 0.3,
    includeScore: true,
  }), []);

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    let products = allProducts;

    // Apply search with sanitization
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
              className="flex items-center space-x-2 px-4 py-2 bg-surface border border-gray-200 rounded-lg"
            >
              <Filter className="w-4 h-4" />
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
            {/* Category tabs - Minimalist design */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFilters(prev => ({ ...prev, category: category.id }))}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filters.category === category.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {/* Results count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
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