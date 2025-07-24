import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Sparkles, Bot, Zap, Brain, Activity, Star, Heart, Play, ChevronDown, Filter, ArrowRight, Layers, Code, Shield, Clock, CheckCircle, TrendingUp, Users, BarChart, X, Menu, DollarSign, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { useCart } from '../contexts/CartContext';
import { sanitizeSearchQuery } from '../utils/security';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import FacetedFilters from '../components/FacetedFilters';
import SEO from '../components/SEO';
import NeuralBackground from '../components/common/NeuralBackground';
import { allProducts } from '../data/products';
import type { Product, FilterState } from '../types';

const HomePage = () => {
  const navigate = useNavigate();
  const { items: cartItems, addToCart } = useCart();
  
  // State management
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: [0, 1000],
    sources: [],
    useCases: [],
    rating: 0,
    difficulty: [],
    searchQuery: ''
  });
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [showQuickView, setShowQuickView] = useState<Product | null>(null);
  const [currentStats, setCurrentStats] = useState({
    users: 50000,
    automations: 2500,
    saved: 1200000
  });

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => new Fuse(allProducts, {
    keys: ['name', 'tagline', 'description', 'category', 'tags'],
    threshold: 0.3,
  }), []);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let products = allProducts;

    // Apply search
    if (filters.searchQuery.trim()) {
      const sanitizedQuery = sanitizeSearchQuery(filters.searchQuery);
      const searchResults = fuse.search(sanitizedQuery);
      products = searchResults.map(result => result.item);
    }

    // Apply category filter
    if (filters.category !== 'all') {
      products = products.filter(product => product.category === filters.category);
    }

    // Apply price range filter
    products = products.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Apply other filters
    if (filters.sources.length > 0) {
      products = products.filter(product => 
        filters.sources.some(source => product.tags.includes(source))
      );
    }

    if (filters.useCases.length > 0) {
      products = products.filter(product => 
        filters.useCases.some(useCase => product.tags.includes(useCase))
      );
    }

    if (filters.rating > 0) {
      products = products.filter(product => product.rating >= filters.rating);
    }

    return products;
  }, [filters, fuse]);

  // Animate stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 10),
        automations: prev.automations + Math.floor(Math.random() * 3),
        saved: prev.saved + Math.floor(Math.random() * 1000)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const categories = [
    { id: 'all', name: 'All Products', icon: Layers },
    { id: 'ai-models', name: 'AI Models', icon: Brain },
    { id: 'agents', name: 'AI Agents', icon: Bot },
    { id: 'automations', name: 'Automations', icon: Zap },
    { id: 'tools', name: 'Tools', icon: Code }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      <SEO 
        title="AI Marketplace - AI Models, Agents & Automations"
        description="Discover and purchase AI models, agents, and automations. From ChatGPT to custom solutions."
        keywords="AI marketplace, AI models, AI agents, automation, ChatGPT, Claude"
      />
      
      <NeuralBackground />
      
      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400">
              The Future of AI Automation
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Discover AI models, agents, and automations that transform your workflow. 
              From ChatGPT to custom solutions, build your AI-powered future today.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search AI models, agents, automations..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    searchQuery: sanitizeSearchQuery(e.target.value)
                  }))}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{currentStats.users.toLocaleString()}+</div>
                <div className="text-blue-200">Active Users</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{currentStats.automations.toLocaleString()}+</div>
                <div className="text-blue-200">Automations Built</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">${(currentStats.saved / 1000).toFixed(0)}K+</div>
                <div className="text-blue-200">Time Saved (Hours)</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Categories */}
      <div className="relative z-10 pb-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setFilters(prev => ({ ...prev, category: category.id }));
                }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full border transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/10 border-white/20 text-blue-100 hover:bg-white/20 backdrop-blur-sm'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <category.icon className="w-5 h-5" />
                <span className="font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative z-10 pb-8">
        <div className="container mx-auto px-6">
          <FacetedFilters
            filters={filters}
            onFiltersChange={setFilters}
            productCount={filteredProducts.length}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="relative z-10 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  onQuickView={() => setShowQuickView(product)}
                  onAddToCart={() => addToCart(product)}
                />
              </motion.div>
            ))}
          </motion.div>

          {filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Search className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
              <p className="text-blue-200 mb-6">Try adjusting your filters or search terms</p>
              <motion.button
                onClick={() => {
                  setFilters({
                    category: 'all',
                    priceRange: [0, 1000],
                    sources: [],
                    useCases: [],
                    rating: 0,
                    difficulty: [],
                    searchQuery: ''
                  });
                  setActiveCategory('all');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {showQuickView && (
          <QuickViewModal 
            product={showQuickView} 
            onClose={() => setShowQuickView(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;