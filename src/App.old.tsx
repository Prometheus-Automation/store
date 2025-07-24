import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Sparkles, Bot, Zap, Brain, Activity, Star, Heart, Play, ChevronDown, Filter, ArrowRight, Layers, Code, Shield, Clock, CheckCircle, TrendingUp, Users, BarChart, X, Menu, DollarSign, Award, CreditCard, Lock } from 'lucide-react';
import ReactPlayer from 'react-player';
import toast, { Toaster } from 'react-hot-toast';
import Fuse from 'fuse.js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Product, FilterState } from './types';

// Import extracted components
import SEO from './components/SEO';
import { CartProvider, useCart } from './contexts/CartContext';
import CheckoutModal from './components/CheckoutModal';
import CheckoutForm from './components/CheckoutForm';
import ProductCard from './components/ProductCard';
import QuickViewModal from './components/QuickViewModal';
import FacetedFilters from './components/FacetedFilters';
import RocketAnimation from './components/RocketAnimation';
import StatsTooltip from './components/StatsTooltip';

// Initialize Stripe with proper error handling
const getStripeKey = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    console.error('VITE_STRIPE_PUBLISHABLE_KEY is not set');
    return null;
  }
  return key;
};

const stripePromise = getStripeKey() ? loadStripe(getStripeKey()!) : null;

// Enhanced Cart Context with Rocket Animation
const CartContext = createContext<CartContextType | undefined>(undefined);

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [rocketAnimations, setRocketAnimations] = useState<RocketAnimation[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
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

    // Trigger rocket animation
    const rocketId = Date.now();
    setRocketAnimations(prev => [...prev, { id: rocketId, product }]);
    
    // Remove rocket after animation
    setTimeout(() => {
      setRocketAnimations(prev => prev.filter(r => r.id !== rocketId));
    }, 2000);

    toast.success(`${product.name} added to cart! 🚀`, {
      duration: 2000,
      style: {
        background: '#00bfff',
        color: 'white',
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
      rocketAnimations,
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

// Stripe Payment Form Component
const CheckoutForm = ({ onSuccess, onCancel }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items, totalPrice, clearCart } = useCart();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const card = elements.getElement(CardElement);

    if (!card) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    // Create payment method
    const { error: paymentError } = await stripe.createPaymentMethod({
      type: 'card',
      card: card,
      billing_details: {
        name: 'Customer', // In a real app, get this from a form
      },
    });

    if (paymentError) {
      setError(paymentError.message || 'Payment failed');
      setProcessing(false);
      return;
    }

    // Simulate payment processing (in a real app, you'd send to your backend)
    setTimeout(() => {
      toast.success('Payment successful! 🎉');
      clearCart();
      onSuccess();
      setProcessing(false);
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span>{item.product.name} × {item.quantity}</span>
              <span>${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Information
          </label>
          <div className="border border-gray-300 rounded-lg p-3 bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || processing}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Pay ${totalPrice.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        <Lock className="h-3 w-3 inline mr-1" />
        Your payment information is encrypted and secure
      </div>
    </form>
  );
};

// Checkout Modal Component
const CheckoutModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const handleSuccess = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <CreditCard className="h-6 w-6 mr-2" />
              Checkout
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <Elements stripe={stripePromise}>
            <CheckoutForm onSuccess={handleSuccess} onCancel={onClose} />
          </Elements>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Enhanced Tooltip Component with Outside Click Handling
const StatsTooltip = ({ children, content, position = "bottom" }: { 
  children: React.ReactNode; 
  content: string; 
  position?: string 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isVisible && tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };
    
    if (isVisible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isVisible]);
  
  return (
    <div 
      ref={tooltipRef}
      className="relative inline-block tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsVisible(!isVisible);
      }}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? -5 : 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? -5 : 5 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-sm whitespace-nowrap
              ${position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'} 
              left-1/2 transform -translate-x-1/2
              before:content-[''] before:absolute before:w-2 before:h-2 before:bg-gray-900 before:rotate-45 before:left-1/2 before:transform before:-translate-x-1/2
              ${position === 'bottom' ? 'before:-top-1' : 'before:-bottom-1'}`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Rocket Animation Component
const RocketAnimation = ({ rockets }: { rockets: RocketAnimation[] }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {rockets.map((rocket: RocketAnimation) => (
          <motion.div
            key={rocket.id}
            initial={{ 
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 400, 
              y: typeof window !== 'undefined' ? window.innerHeight - 100 : 500,
              scale: 0,
              rotate: 0
            }}
            animate={{ 
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 600,
              y: -100,
              scale: [0, 1.5, 0],
              rotate: [0, 360, 720]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 2,
              ease: "easeOut"
            }}
            className="absolute text-4xl"
          >
            🚀
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Faceted Filter Component
const FacetedFilters = ({ filters, setFilters, showFilters, setShowFilters }: FacetedFiltersProps) => {
  const sources = ['OpenAI', 'Anthropic', 'xAI', 'n8n', 'Zapier', 'Make', 'Python'];
  const useCases = ['productivity', 'sales', 'support', 'content', 'marketing', 'data'];
  
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Price Range</h4>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: [0, parseInt(e.target.value)]
                  }))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>$0</span>
                  <span>${filters.priceRange[1]}/month</span>
                </div>
              </div>
            </div>

            {/* Sources */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Source</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {sources.map(source => (
                  <label key={source} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.sources.includes(source)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            sources: [...prev.sources, source]
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            sources: prev.sources.filter(s => s !== source)
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    {source}
                  </label>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Use Case</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {useCases.map(useCase => (
                  <label key={useCase} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.useCases.includes(useCase)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            useCases: [...prev.useCases, useCase]
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            useCases: prev.useCases.filter(u => u !== useCase)
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    {useCase.charAt(0).toUpperCase() + useCase.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Minimum Rating</h4>
              <select
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  rating: parseFloat(e.target.value)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="0">Any Rating</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.8">4.8+ Stars</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t">
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
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Seller Dashboard Component
function SellerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart },
    { id: 'products', name: 'My Products', icon: Layers },
    { id: 'sales', name: 'Sales', icon: DollarSign },
    { id: 'analytics', name: 'Analytics', icon: Activity },
  ];

  const mockStats = {
    totalSales: 12450,
    activeProducts: 8,
    monthlyRevenue: 3420,
    customerRating: 4.8
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Seller Dashboard"
        description="Manage your AI products, view sales analytics, and track performance in the Prometheus AI marketplace."
        keywords="seller dashboard, AI marketplace, product management, sales analytics"
        url="/seller"
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
              <span>Back to Store</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar Navigation */}
          <div className="w-64 space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Sales</p>
                        <p className="text-2xl font-bold text-gray-900">${mockStats.totalSales.toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Products</p>
                        <p className="text-2xl font-bold text-gray-900">{mockStats.activeProducts}</p>
                      </div>
                      <Layers className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">${mockStats.monthlyRevenue.toLocaleString()}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Customer Rating</p>
                        <p className="text-2xl font-bold text-gray-900">{mockStats.customerRating}</p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">New sale: ChatGPT Plus</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Award className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Product review: 5 stars</p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Products</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Add New Product
                  </button>
                </div>
                <div className="text-center py-12">
                  <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Product Management</h4>
                  <p className="text-gray-600">Manage your AI models, agents, and automations here.</p>
                </div>
              </div>
            )}

            {(activeTab === 'sales' || activeTab === 'analytics') && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {activeTab === 'sales' ? 'Sales Analytics' : 'Performance Analytics'}
                </h3>
                <div className="text-center py-12">
                  <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h4>
                  <p className="text-gray-600">
                    Detailed {activeTab} analytics will be available here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Community Page Component
function CommunityPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('discussions');

  const sections = [
    { id: 'discussions', name: 'Discussions', icon: Users },
    { id: 'tutorials', name: 'Tutorials', icon: Code },
    { id: 'showcase', name: 'Showcase', icon: Award },
    { id: 'support', name: 'Support', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Community"
        description="Join the Prometheus AI community. Connect with AI automation experts, share knowledge, access tutorials, and get support."
        keywords="AI community, automation experts, tutorials, support, AI discussions, showcase"
        url="/community"
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
              <span>Back to Store</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Community</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar Navigation */}
          <div className="w-64 space-y-2">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="font-medium">{section.name}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to the Prometheus Community</h3>
                <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                  Connect with AI automation experts, share your creations, learn from tutorials, 
                  and get support from our growing community of developers and creators.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <Users className="h-8 w-8 text-blue-500 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Join Discussions</h4>
                    <p className="text-sm text-gray-600">Share ideas, ask questions, and collaborate with fellow AI enthusiasts.</p>
                  </div>
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <Code className="h-8 w-8 text-green-500 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Learn & Teach</h4>
                    <p className="text-sm text-gray-600">Access tutorials, guides, and share your own knowledge.</p>
                  </div>
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <Award className="h-8 w-8 text-purple-500 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Showcase Work</h4>
                    <p className="text-sm text-gray-600">Display your AI automations and get recognition from the community.</p>
                  </div>
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <Shield className="h-8 w-8 text-red-500 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Get Support</h4>
                    <p className="text-sm text-gray-600">Get help with technical issues and implementation challenges.</p>
                  </div>
                </div>

                <div className="mt-8">
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    Join Community (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Detail Page Component
function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  // Get all products
  const allProducts: Product[] = [
    // Models
    {
      id: 1,
      name: 'ChatGPT Plus',
      tagline: 'The Creative Genius 🎨',
      provider: 'OpenAI',
      price: 20,
      unit: '/month',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwYmZmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDgwZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjYmcpIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiPkFJPC90ZXh0Pjwvc3ZnPg==',
      badge: 'Most Popular 🔥',
      badgeColor: 'bg-blue-500',
      rating: 4.8,
      reviews: 15420,
      features: ['GPT-4 Access', 'DALL-E 3', 'Advanced Analytics', 'Code Interpreter', 'Custom GPTs'],
      stats: { users: '100M+', satisfaction: '98%', responseTime: '1.2s' },
      category: "Language Model",
      description: 'ChatGPT Plus gives you access to GPT-4, the most advanced AI language model. Perfect for creative writing, code generation, complex problem-solving, and general assistance. Includes DALL-E 3 for image generation and custom GPTs for specialized tasks.',
      videoUrl: 'https://www.youtube.com/watch?v=C_78DM4vpdI',
      source: 'OpenAI',
      useCase: 'content',
      difficulty: 'beginner'
    },
    {
      id: 2,
      name: 'ChatGPT Pro',
      tagline: 'Enterprise Power 💼',
      provider: 'OpenAI',
      price: 200,
      unit: '/month',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwYmZmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDgwZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjYmcpIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiPkFJPC90ZXh0Pjwvc3ZnPg==',
      badge: 'Pro Choice',
      badgeColor: 'bg-purple-500',
      rating: 4.9,
      reviews: 3456,
      features: ['Unlimited GPT-4', 'Priority Access', 'Extended Context', 'Team Collaboration', 'API Credits'],
      stats: { context: '128K tokens', uptime: '99.99%', support: '24/7' },
      category: 'Language Model',
      description: 'ChatGPT Pro is designed for enterprise users who need unlimited access to GPT-4 with extended context windows and priority processing. Perfect for teams and organizations.',
      apiPricing: { input: '$0.01/1K', output: '$0.03/1K' },
      source: 'OpenAI',
      useCase: 'productivity',
      difficulty: 'advanced'
    },
    // Add more products as needed - keeping it concise for brevity
  ];
  
  const product = allProducts.find(p => p.id === parseInt(id || '0'));
  
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={product.name}
        description={`${product.description} - ${product.tagline}. Price: $${product.price}${product.unit}. Rating: ${product.rating}/5.`}
        keywords={`${product.name}, ${product.provider}, ${product.category}, AI model, ${product.useCase}, ${product.difficulty}`}
        url={`/product/${product.id}`}
        image={product.image}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
              <span>Back to Store</span>
            </button>
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
                <ShoppingCart className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image & Video */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl shadow-sm overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSIyMDAiIHk9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOWNhM2FmIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>
            {product.videoUrl && (
              <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
                <ReactPlayer
                  url={product.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  config={{
                    youtube: {
                      playerVars: {
                        origin: typeof window !== 'undefined' ? window.location.origin : 'https://store.prometheusautomation.com'
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {product.badge && (
                  <span className={`${product.badgeColor} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                    {product.badge}
                  </span>
                )}
                <span className="text-sm text-gray-500">{product.provider}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-xl text-gray-600 mb-4">{product.tagline}</p>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews?.toLocaleString()} reviews)
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex items-baseline space-x-2">
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price}
                </span>
                <span className="text-gray-600">{product.unit}</span>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features?.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>


            {/* Add to Cart */}
            <div className="flex space-x-4">
              <button
                onClick={() => addItem(product)}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function PrometheusApp() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredProduct, setHoveredProduct] = useState<string | number | null>(null);
  const [showQuickView, setShowQuickView] = useState<Product | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: [0, 1000],
    sources: [],
    useCases: [],
    rating: 0,
    difficulty: [],
    searchQuery: ''
  });

  const { rocketAnimations, showCheckout, setShowCheckout } = useCart();

  // Live stats with proper parsing
  const [liveStats, setLiveStats] = useState({
    activeUsers: 2847,
    automationsRunning: 15243,
    timeSaved: 42381
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5),
        automationsRunning: prev.automationsRunning + Math.floor(Math.random() * 20),
        timeSaved: prev.timeSaved + Math.floor(Math.random() * 100)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced product data with metadata for filtering
  const products = {
    models: [
      {
        id: 1,
        name: 'ChatGPT Plus',
        tagline: 'The Creative Genius 🎨',
        provider: 'OpenAI',
        price: 20,
        unit: '/month',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwYmZmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDgwZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjYmcpIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiPkFJPC90ZXh0Pjwvc3ZnPg==',
        badge: 'Most Popular 🔥',
        badgeColor: 'bg-blue-500',
        rating: 4.8,
        reviews: 15420,
        features: ['GPT-4 Access', 'DALL-E 3', 'Advanced Analytics', 'Code Interpreter', 'Custom GPTs'],
        stats: { users: '100M+', satisfaction: '98%', responseTime: '1.2s' },
        category: 'Language Model',
        description: 'Perfect for creative writing, coding help, and general assistance',
        videoUrl: 'https://www.youtube.com/watch?v=C_78DM4vpdI',
        source: 'OpenAI',
        useCase: 'content',
        difficulty: 'beginner'
      },
      {
        id: 2,
        name: 'ChatGPT Pro',
        tagline: 'Enterprise Power 💼',
        provider: 'OpenAI',
        price: 200,
        unit: '/month',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwYmZmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDgwZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjYmcpIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiPkFJPC90ZXh0Pjwvc3ZnPg==',
        badge: 'Pro Choice',
        badgeColor: 'bg-purple-500',
        rating: 4.9,
        reviews: 3456,
        features: ['Unlimited GPT-4', 'Priority Access', 'Extended Context', 'Team Collaboration', 'API Credits'],
        stats: { context: '128K tokens', uptime: '99.99%', support: '24/7' },
        category: 'Language Model',
        description: 'For professionals who need maximum AI power',
        apiPricing: { input: '$0.01/1K', output: '$0.03/1K' },
        source: 'OpenAI',
        useCase: 'productivity',
        difficulty: 'advanced'
      },
      {
        id: 3,
        name: 'Claude Pro',
        tagline: 'The Analytical Mind 🧠',
        provider: 'Anthropic',
        price: 20,
        unit: '/month',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwYmZmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDgwZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjYmcpIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiPkFJPC90ZXh0Pjwvc3ZnPg==',
        badge: 'Best for Research',
        badgeColor: 'bg-green-500',
        rating: 4.9,
        reviews: 8932,
        features: ['200K Context', 'Research Mode', 'Code Review', 'File Analysis', 'Constitutional AI'],
        stats: { accuracy: '99.2%', context: '200K tokens', ethics: 'A+' },
        category: 'Language Model',
        description: 'Ideal for deep research and complex analysis',
        videoUrl: 'https://www.youtube.com/watch?v=example',
        source: 'Anthropic',
        useCase: 'productivity',
        difficulty: 'intermediate'
      },
      {
        id: 4,
        name: 'Claude Max',
        tagline: 'Maximum Intelligence 🚀',
        provider: 'Anthropic',
        price: 150,
        originalPrice: 200,
        unit: '/month',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwYmZmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDgwZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjYmcpIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiPkFJPC90ZXh0Pjwvc3ZnPg==',
        badge: 'Save $50',
        badgeColor: 'bg-red-500',
        rating: 5.0,
        reviews: 1234,
        features: ['Unlimited Context', 'Priority Processing', 'Custom Training', 'Enterprise Support'],
        stats: { processing: 'Real-time', availability: '100%', customization: 'Full' },
        category: 'Language Model',
        description: 'The ultimate Claude experience for enterprises',
        source: 'Anthropic',
        useCase: 'productivity',
        difficulty: 'advanced'
      },
      {
        id: 5,
        name: 'Grok Heavy',
        tagline: 'Real-Time AI Revolution 🌐',
        provider: 'xAI',
        price: 300,
        unit: '/month',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwYmZmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDgwZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjYmcpIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiPkFJPC90ZXh0Pjwvc3ZnPg==',
        badge: 'Cutting Edge',
        badgeColor: 'bg-yellow-600',
        rating: 4.7,
        reviews: 3421,
        features: ['X Platform Data', 'Real-Time Info', 'Humor Mode', 'No Filters', 'Direct Integration'],
        stats: { realTime: 'Yes', dataPoints: '500M+', updates: 'Live' },
        category: 'Language Model',
        description: 'Access to x.ai/grok for full details',
        apiPricing: { input: '$3/1M', output: '$15/1M' },
        externalLink: 'https://x.ai/grok',
        source: 'xAI',
        useCase: 'content',
        difficulty: 'intermediate'
      }
    ],
    agents: [
      {
        id: 6,
        name: 'Support Bot Pro',
        tagline: 'Never Miss a Customer 🎯',
        provider: 'n8n Certified',
        price: 49,
        originalPrice: 99,
        unit: '/month',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwYmZmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDgwZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjYmcpIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiPkFJPC90ZXh0Pjwvc3ZnPg==',
        badge: '50% OFF',
        badgeColor: 'bg-red-500',
        rating: 4.6,
        reviews: 2156,
        features: ['24/7 Availability', 'Multi-Language', 'Sentiment Analysis', 'Auto-Escalation', 'CRM Integration'],
        stats: { resolved: '94%', languages: '50+', uptime: '99.9%' },
        category: "Customer Service",
        description: 'AI Agent: A smart bot that handles customer inquiries automatically',
        source: 'n8n',
        useCase: 'support',
        difficulty: 'beginner'
      },
      {
        id: 7,
        name: 'Sales Autopilot',
        tagline: 'Close Deals While You Sleep 💰',
        provider: 'Zapier Elite',
        price: 75,
        unit: '/month',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwYmZmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDgwZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjYmcpIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiPkFJPC90ZXh0Pjwvc3ZnPg==',
        badge: 'Revenue Booster',
        badgeColor: 'bg-yellow-600',
        rating: 4.8,
        reviews: 1843,
        features: ['Lead Scoring AI', 'Email Sequences', 'CRM Sync', 'Deal Tracking', 'Slack Notifications'],
        stats: { conversion: '+47%', deals: '2.3x', roi: '580%' },
        category: "Sales",
        description: 'Automation: Connects your apps to work together automatically',
        source: 'Zapier',
        useCase: 'sales',
        difficulty: 'intermediate'
      }
    ],
    automations: [
      {
        id: 8,
        name: 'Social Media Suite',
        tagline: 'Content That Never Sleeps 📱',
        provider: 'Make',
        price: 35,
        originalPrice: 75,
        unit: '/month',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwYmZmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDgwZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjYmcpIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiPkFJPC90ZXh0Pjwvc3ZnPg==',
        badge: 'Creator Favorite ⭐',
        badgeColor: 'bg-pink-500',
        rating: 4.7,
        reviews: 967,
        features: ['Auto-Post', 'AI Captions', 'Trend Analysis', 'Multi-Platform', 'Analytics Dashboard'],
        stats: { platforms: '8+', posts: 'Unlimited', engagement: '+215%' },
        category: "Marketing",
        description: 'Save 12 hours per week on social media management',
        source: 'Make',
        useCase: 'marketing',
        difficulty: 'beginner'
      },
      {
        id: 9,
        name: 'Data Pipeline Master',
        tagline: 'ETL on Autopilot 📊',
        provider: 'Python Scripts',
        price: 89,
        unit: '/month',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwYmZmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDgwZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjYmcpIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiPkFJPC90ZXh0Pjwvc3ZnPg==',
        badge: 'Enterprise Ready',
        badgeColor: 'bg-gray-700',
        rating: 4.9,
        reviews: 2341,
        features: ['Real-Time Sync', 'Data Validation', 'Error Handling', 'Custom Scripts', 'API Webhooks'],
        stats: { throughput: '1M/hour', accuracy: '99.99%', sources: '200+' },
        category: "Data",
        description: 'Professional data automation for serious businesses',
        source: 'Python',
        useCase: 'data',
        difficulty: 'advanced'
      },
      {
        id: 10,
        name: 'n8n Starter Kit',
        tagline: 'No-Code Automation Magic ✨',
        provider: 'n8n',
        price: 20,
        unit: '/month',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwYmZmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDgwZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjYmcpIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiPkFJPC90ZXh0Pjwvc3ZnPg==',
        badge: 'Beginner Friendly',
        badgeColor: 'bg-blue-500',
        rating: 4.5,
        reviews: 5678,
        features: ['Visual Builder', 'Pre-built Templates', 'Community Support', 'Self-Hosted Option'],
        stats: { nodes: '300+', templates: '1000+', community: '50K+' },
        category: "Workflow",
        description: 'Perfect starting point for automation beginners',
        source: 'n8n',
        useCase: 'productivity',
        difficulty: 'beginner'
      },
      {
        id: 11,
        name: 'Zapier Pro Bundle',
        tagline: 'Connect Everything 🔗',
        provider: 'Zapier',
        price: 49,
        originalPrice: 69,
        unit: '/month',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwYmZmZjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDgwZmY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjYmcpIi8+PHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiPkFJPC90ZXh0Pjwvc3ZnPg==',
        badge: 'Most Integrations',
        badgeColor: 'bg-orange-500',
        rating: 4.7,
        reviews: 12345,
        features: ['5000+ Apps', 'Multi-Step Zaps', 'Filters & Logic', 'Team Collaboration'],
        stats: { apps: '5000+', zaps: 'Unlimited', support: 'Priority' },
        category: "Integration",
        description: 'The easiest way to automate your work',
        source: 'Zapier',
        useCase: 'productivity',
        difficulty: 'intermediate'
      }
    ]
  };

  const allProducts = [...products.models, ...products.agents, ...products.automations];
  
  // Enhanced filtering logic with Fuse.js search
  const getFilteredProducts = () => {
    let filtered = activeCategory === 'all' ? allProducts : (products as any)[activeCategory] || [];
    
    // Apply search with fuzzy matching
    if (filters.searchQuery) {
      const fuse = new Fuse(filtered, {
        keys: ['name', 'description', 'features', 'provider'],
        threshold: 0.3
      });
      const searchResults = fuse.search(filters.searchQuery);
      filtered = searchResults.map(result => result.item);
    }
    
    // Apply price range
    filtered = filtered.filter((product: Product) => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );
    
    // Apply sources
    if (filters.sources.length > 0) {
      filtered = filtered.filter((product: Product) => product.source && filters.sources.includes(product.source));
    }
    
    // Apply use cases
    if (filters.useCases.length > 0) {
      filtered = filtered.filter((product: Product) => product.useCase && filters.useCases.includes(product.useCase));
    }
    
    // Apply rating
    if (filters.rating > 0) {
      filtered = filtered.filter((product: Product) => product.rating >= filters.rating);
    }
    
    return filtered;
  };

  const displayProducts = getFilteredProducts();

  // Enhanced quiz recommendations with fallback logic
  const getQuizRecommendations = () => {
    if (quizAnswers.length < 3) return [];
    
    const [goalAnswer, skillAnswer, budgetAnswer] = quizAnswers;
    let recommendations = [];
    
    // Budget constraints
    const budgetFilter = (product: Product) => {
      const budgetValue = budgetAnswer.value || budgetAnswer;
      switch (budgetValue) {
        case '25':
        case 0: return product.price <= 25;
        case '100':
        case 1: return product.price <= 100;
        case '500':
        case 2: return product.price <= 500;
        default: return true;
      }
    };
    
    // Goal-based recommendations with enhanced logic
    const goalValue = goalAnswer.value || goalAnswer;
    if (goalValue === 'productivity' || goalValue === 0) {
      recommendations = allProducts.filter((p: any) => 
        (p.useCase === 'productivity' || p.category === 'Workflow' || p.category === 'Data' || 
         p.features.some((f: string) => f.toLowerCase().includes('automation'))) && 
        budgetFilter(p)
      );
    } else if (goalValue === 'sales' || goalValue === 1) {
      recommendations = allProducts.filter((p: any) => 
        (p.useCase === 'sales' || p.category === 'Sales' || 
         p.features.some((f: string) => f.toLowerCase().includes('sales') || f.toLowerCase().includes('lead'))) && 
        budgetFilter(p)
      );
    } else if (goalValue === 'support' || goalValue === 2) {
      recommendations = allProducts.filter((p: any) => 
        (p.useCase === 'support' || p.category === 'Customer Service' || 
         p.features.some((f: string) => f.toLowerCase().includes('support') || f.toLowerCase().includes('chat'))) && 
        budgetFilter(p)
      );
    } else {
      recommendations = allProducts.filter((p: any) => 
        (p.useCase === 'content' || p.category === 'Language Model' || p.category === 'Marketing' || 
         p.features.some((f: string) => f.toLowerCase().includes('content') || f.toLowerCase().includes('writing'))) && 
        budgetFilter(p)
      );
    }
    
    // If skill level is beginner, prioritize beginner-friendly options
    const skillValue = skillAnswer.value || skillAnswer;
    if (skillValue === 'beginner' || skillValue === 0) {
      const beginnerFriendly = recommendations.filter(p => 
        p.difficulty === 'beginner' ||
        p.badge?.toLowerCase().includes('beginner') || 
        p.features.some(f => 
          f.toLowerCase().includes('visual') || 
          f.toLowerCase().includes('template') ||
          f.toLowerCase().includes('no-code')
        ) ||
        p.source === 'n8n' ||
        p.source === 'Zapier'
      );
      if (beginnerFriendly.length > 0) {
        recommendations = beginnerFriendly;
      }
    }
    
    // Enhanced fallback logic: if less than 3 recommendations, broaden search
    if (recommendations.length < 3) {
      const budgetValue = budgetAnswer.value || budgetAnswer;
      const maxBudget = budgetValue === 'unlimited' || budgetValue === 3 ? Infinity : 
                       budgetValue === '25' || budgetValue === 0 ? 25 :
                       budgetValue === '100' || budgetValue === 1 ? 100 : 500;
      
      // First try: same use case but ignore skill level
      let fallbackRecs = allProducts.filter(p => p.price <= maxBudget);
      
      // If still not enough, get top-rated products within budget
      if (fallbackRecs.length < 3) {
        fallbackRecs = allProducts.filter(p => p.price <= maxBudget * 2); // Double budget as last resort
      }
      
      recommendations = fallbackRecs
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    } else {
      recommendations = recommendations
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    }
    
    return recommendations;
  };

  // Style utilities
  const gradientText = "bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent";
  
  // Custom scrollbar hide styles
  const scrollbarHideStyles = `
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
  `;

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = scrollbarHideStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Enhanced Neural Background with Full Framer Motion
  const NeuralBackground = () => {
    const [particles, setParticles] = useState<any[]>([]);
    const [connections, setConnections] = useState<any[]>([]);
    
    useEffect(() => {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 5
      }));
      
      // Generate connections between nearby particles
      const newConnections = [];
      for (let i = 0; i < newParticles.length; i++) {
        for (let j = i + 1; j < newParticles.length; j++) {
          const dx = newParticles[i].x - newParticles[j].x;
          const dy = newParticles[i].y - newParticles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 25) {
            newConnections.push({
              from: i,
              to: j,
              opacity: Math.max(0.1, 0.4 - distance / 60)
            });
          }
        }
      }
      
      setParticles(newParticles);
      setConnections(newConnections);
    }, []);

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-cyan-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 2 }}
        />
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Animated connections */}
          {connections.map((connection, index) => {
            const fromParticle = particles[connection.from];
            const toParticle = particles[connection.to];
            
            if (!fromParticle || !toParticle) return null;
            
            return (
              <motion.line
                key={`connection-${index}`}
                x1={`${fromParticle.x}%`}
                y1={`${fromParticle.y}%`}
                x2={`${toParticle.x}%`}
                y2={`${toParticle.y}%`}
                stroke="#00bfff"
                strokeWidth="1"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0.1, connection.opacity, 0.1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ filter: 'url(#glow)' }}
              />
            );
          })}
          
          {/* Animated particles */}
          {particles.map((particle) => (
            <motion.g key={particle.id}>
              <motion.circle
                cx={`${particle.x}%`}
                cy={`${particle.y}%`}
                r={particle.size}
                fill="#00bfff"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  x: [`${particle.x}%`, `${particle.x + 10}%`, `${particle.x}%`],
                  y: [`${particle.y}%`, `${particle.y - 15}%`, `${particle.y}%`],
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ filter: 'url(#glow)' }}
              />
              
              {/* Pulsing outer ring */}
              <motion.circle
                cx={`${particle.x}%`}
                cy={`${particle.y}%`}
                r={particle.size * 2}
                fill="none"
                stroke="#00bfff"
                strokeWidth="0.5"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: particle.duration * 0.7,
                  delay: particle.delay + 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.g>
          ))}
        </svg>
        
        {/* Scanning line effect */}
        <motion.div
          className="absolute inset-0 opacity-20"
          initial={{ background: 'linear-gradient(90deg, transparent 0%, rgba(0, 191, 255, 0.1) 50%, transparent 100%)' }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            width: '200%',
            height: '2px',
            top: '30%',
          }}
        />
      </div>
    );
  };

  // Enhanced Stats Display Component
  const LiveStatsBar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const statsData = [
      {
        icon: Activity,
        value: liveStats.activeUsers.toLocaleString(),
        label: "users online",
        color: "text-green-400",
        shortLabel: "online",
        description: "Real-time active users browsing AI solutions"
      },
      {
        icon: Zap,
        value: liveStats.automationsRunning.toLocaleString(),
        label: "automations running",
        color: "text-yellow-400",
        shortLabel: "running",
        description: "AI automations currently processing tasks"
      },
      {
        icon: Clock,
        value: `${liveStats.timeSaved.toLocaleString()} hours`,
        label: "saved today",
        color: "text-blue-400",
        shortLabel: "hrs saved",
        description: "Total time saved by users today through AI automation"
      }
    ];

    return (
      <div className="bg-gray-900 text-white px-4 py-2 text-sm relative">
        <div className="max-w-7xl mx-auto">
          {/* Desktop view - Full labels with tooltips */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {statsData.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <StatsTooltip 
                    key={index}
                    content={stat.description}
                  >
                    <span className="flex items-center cursor-help hover:bg-white/10 px-2 py-1 rounded transition-colors">
                      <IconComponent size={14} className={`mr-2 ${stat.color}`} />
                      <span className="font-mono font-semibold">{stat.value}</span>
                      <span className="ml-1 text-gray-300">{index === 2 ? stat.label : ` ${stat.label}`}</span>
                    </span>
                  </StatsTooltip>
                );
              })}
            </div>
            <div className="flex items-center space-x-6 text-xs">
              <button className="hover:text-gray-300 transition-colors">Documentation</button>
              <button className="hover:text-gray-300 transition-colors">API Status</button>
              <button className="hover:text-gray-300 transition-colors">Community</button>
            </div>
          </div>

          {/* Tablet view - Abbreviated labels with tooltips */}
          <div className="hidden md:flex lg:hidden items-center justify-between">
            <div className="flex items-center space-x-6">
              {statsData.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <StatsTooltip 
                    key={index}
                    content={`${stat.value} ${stat.label} - ${stat.description}`}
                  >
                    <span className="flex items-center cursor-help hover:bg-white/10 px-2 py-1 rounded transition-colors">
                      <IconComponent size={14} className={`mr-1.5 ${stat.color}`} />
                      <span className="font-mono font-semibold text-sm">{stat.value.split(' ')[0]}</span>
                      <span className="ml-1 text-gray-300 text-xs">{stat.shortLabel}</span>
                    </span>
                  </StatsTooltip>
                );
              })}
            </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs hover:text-gray-300 transition-colors flex items-center"
            >
              Menu <ChevronDown size={12} className="ml-1" />
            </button>
          </div>

          {/* Mobile view - Compact with expandable info */}
          <div className="flex md:hidden items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {statsData.map((stat, index) => {
                const IconComponent = stat.icon;
                const numValue = parseInt(stat.value.replace(/,/g, '').split(' ')[0]);
                const displayValue = numValue >= 1000 ? `${(numValue / 1000).toFixed(1)}k` : numValue.toString();
                
                return (
                  <StatsTooltip 
                    key={index}
                    content={`${stat.value} ${stat.label}`}
                    position="bottom"
                  >
                    <span className="flex items-center cursor-help hover:bg-white/10 px-1.5 py-1 rounded transition-colors">
                      <IconComponent size={12} className={`mr-1 ${stat.color}`} />
                      <span className="font-mono font-semibold text-xs">
                        {displayValue}
                      </span>
                    </span>
                  </StatsTooltip>
                );
              })}
            </div>
            
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Toggle stats info"
            >
              {isExpanded ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>

          {/* Expandable mobile info panel */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-3 pt-3 border-t border-gray-700 space-y-2"
              >
                {statsData.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                        <IconComponent size={14} className={`mr-2 ${stat.color}`} />
                        <span className="text-gray-300">{stat.label}</span>
                      </div>
                      <span className="font-mono font-semibold">{stat.value}</span>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <div className="flex space-x-4 text-xs">
                    <button className="hover:text-gray-300">Docs</button>
                    <button className="hover:text-gray-300">Status</button>
                    <button className="hover:text-gray-300">Community</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const quizQuestions = [
    {
      question: "What's your main goal?",
      options: [
        { text: "Save time on repetitive tasks", value: "productivity" },
        { text: "Boost sales and revenue", value: "sales" },
        { text: "Improve customer experience", value: "support" },
        { text: "Create content faster", value: "content" }
      ]
    },
    {
      question: "What's your skill level?",
      options: [
        { text: "Beginner - I need simple solutions", value: "beginner" },
        { text: "Intermediate - I know the basics", value: "intermediate" },
        { text: "Advanced - I want maximum control", value: "advanced" },
        { text: "Expert - Custom solutions only", value: "expert" }
      ]
    },
    {
      question: "What's your budget range?",
      options: [
        { text: "Under $25/month", value: "25" },
        { text: "$25-$100/month", value: "100" },
        { text: "$100-$500/month", value: "500" },
        { text: "Unlimited budget", value: "unlimited" }
      ]
    }
  ];

  const handleQuizAnswer = (answer: any) => {
    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);
    
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      setShowQuiz(false);
      setQuizStep(0);
    }
  };

  // Header Component
  const Header = () => {
    const { totalItems, setShowCheckout } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    
    return (
      <div className="px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="text-white" size={20} />
            </motion.div>
            <div>
              <h1 className={`text-2xl font-bold ${gradientText}`}>
                Prometheus
              </h1>
              <p className="text-xs text-gray-500">AI Automation Store</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search AI models, agents, and automations..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Filter size={16} className="mr-2" />
              Filters
            </motion.button>
            
            <motion.button
              onClick={() => {
                setShowQuiz(true);
                setQuizStep(0);
                setQuizAnswers([]);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Brain size={16} className="mr-2" />
              AI Quiz
            </motion.button>
            
            <motion.button
              onClick={() => setShowCheckout(true)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    );
  };

  // Hero Section
  const HeroSection = () => {
    return (
      <section className="relative bg-white overflow-hidden">
        <NeuralBackground />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              The Future of{' '}
              <span className={gradientText}>AI Automation</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Discover, compare, and deploy the world's most powerful AI models, agents, and automation tools. 
              Save thousands of hours with intelligent automation.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <motion.button
                onClick={() => {
                  setShowQuiz(true);
                  setQuizStep(0);
                  setQuizAnswers([]);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Zap className="mr-2" size={20} />
                Find My Perfect AI
              </motion.button>
              
              <motion.button
                className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-800 px-8 py-4 rounded-lg text-lg font-semibold flex items-center transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="mr-2" size={20} />
                Watch Demo
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>
    );
  };

  // Category Navigation
  const CategoryNav = () => {
    const categories = [
      { id: 'all', name: 'All Products', icon: Layers },
      { id: 'models', name: 'AI Models', icon: Brain },
      { id: 'agents', name: 'AI Agents', icon: Bot },
      { id: 'automations', name: 'Automations', icon: Zap }
    ];

    return (
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide py-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isActive = activeCategory === category.id;
              
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <IconComponent size={18} className="mr-2" />
                  {category.name}
                  <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {category.id === 'all' ? allProducts.length : ((products as any)[category.id]?.length || 0)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Product Card Component
  const ProductCard = ({ product }: { product: Product }) => {
    const { addItem } = useCart();
    const isHovered = hoveredProduct === product.id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
        onMouseEnter={() => setHoveredProduct(product.id)}
        onMouseLeave={() => setHoveredProduct(null)}
      >
        {/* Product Image with Video Player */}
        <div className="relative h-48 overflow-hidden">
          {product.videoUrl && isHovered ? (
            <ReactPlayer
              url={product.videoUrl}
              width="100%"
              height="100%"
              playing={true}
              muted={true}
              loop={true}
              controls={false}
              config={{
                youtube: {
                  playerVars: {
                    origin: typeof window !== 'undefined' ? window.location.origin : 'https://store.prometheusautomation.com'
                  }
                }
              }}
            />
          ) : (
            <Link to={`/product/${product.id}`}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSIyMDAiIHk9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOWNhM2FmIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                }}
              />
            </Link>
          )}
          
          {/* Badge */}
          {product.badge && (
            <div className={`absolute top-3 left-3 ${product.badgeColor} text-white px-2 py-1 rounded-full text-xs font-semibold`}>
              {product.badge}
            </div>
          )}
          
          {/* Quick View Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            onClick={() => setShowQuickView(product)}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-colors"
          >
            <ArrowRight size={16} />
          </motion.button>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Link 
                to={`/product/${product.id}`}
                className="font-bold text-lg text-gray-900 mb-1 hover:text-blue-600 transition-colors block"
              >
                {product.name}
              </Link>
              <p className="text-sm text-gray-600">{product.tagline}</p>
            </div>
            <div className="flex items-center">
              <Star className="text-yellow-400 fill-current" size={16} />
              <span className="ml-1 text-sm font-semibold">{product.rating}</span>
              <span className="ml-1 text-xs text-gray-500">({product.reviews.toLocaleString()})</span>
            </div>
          </div>

          {/* Features */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {product.features.slice(0, 3).map((feature: string, index: number) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  {feature}
                </span>
              ))}
              {product.features.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{product.features.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline">
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through mr-2">
                  ${product.originalPrice}
                </span>
              )}
              <span className="text-2xl font-bold text-gray-900">
                ${product.price}
              </span>
              <span className="text-sm text-gray-600 ml-1">{product.unit}</span>
            </div>
            
            <div className="flex space-x-2">
              <Link
                to={`/product/${product.id}`}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
              >
                <Play size={14} className="mr-1" />
                View Details
              </Link>
              <motion.button
                onClick={() => addItem(product)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingCart size={14} className="mr-1" />
                Add to Cart
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Quick View Modal
  const QuickViewModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
    const { addItem } = useCart();
    
    if (!product) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
            >
              <X size={20} />
            </button>

            {/* Product Video/Image */}
            <div className="h-64 overflow-hidden rounded-t-xl">
              {product.videoUrl ? (
                <ReactPlayer
                  url={product.videoUrl}
                  width="100%"
                  height="100%"
                  playing={true}
                  controls={true}
                  config={{
                    youtube: {
                      playerVars: {
                        origin: typeof window !== 'undefined' ? window.location.origin : 'https://store.prometheusautomation.com'
                      }
                    }
                  }}
                />
              ) : (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSIyMDAiIHk9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOWNhM2FmIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                  }}
                />
              )}
            </div>

            {/* Product Details */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                  <p className="text-lg text-gray-600">{product.tagline}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline">
                    {product.originalPrice && (
                      <span className="text-lg text-gray-400 line-through mr-2">
                        ${product.originalPrice}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    <span className="text-lg text-gray-600 ml-1">{product.unit}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{product.description}</p>

              {/* Features */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2" size={16} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Performance Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(product.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-lg font-bold text-blue-600">{value}</div>
                      <div className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add to Cart */}
              <motion.button
                onClick={() => {
                  addItem(product);
                  onClose();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingCart className="mr-2" size={20} />
                Add to Cart - ${product.price}{product.unit}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // AI Quiz Modal
  const QuizModal = () => {
    const { addItem } = useCart();
    const recommendations = getQuizRecommendations();

    if (!showQuiz) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-lg w-full"
        >
          {quizAnswers.length < quizQuestions.length ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Find Your Perfect AI</h2>
                <button
                  onClick={() => setShowQuiz(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Question {quizStep + 1} of {quizQuestions.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">{quizQuestions[quizStep].question}</h3>
                <div className="space-y-3">
                  {quizQuestions[quizStep].options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleQuizAnswer(option)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium text-gray-900">{option.text}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your AI Recommendations</h2>
                <button
                  onClick={() => setShowQuiz(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.tagline}</p>
                          <div className="flex items-center mt-1">
                            <Star className="text-yellow-400 fill-current" size={14} />
                            <span className="ml-1 text-sm">{product.rating}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">${product.price}{product.unit}</div>
                          <motion.button
                            onClick={() => {
                              addItem(product);
                              setShowQuiz(false);
                            }}
                            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Add to Cart
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <motion.button
                    onClick={() => {
                      setShowQuiz(false);
                      setQuizAnswers([]);
                      setQuizStep(0);
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Take Quiz Again
                  </motion.button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bot className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 mb-4">No perfect matches found, but don't worry!</p>
                  <motion.button
                    onClick={() => {
                      setShowQuiz(false);
                      setQuizAnswers([]);
                      setQuizStep(0);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Browse All Products
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="AI Marketplace"
        description="Discover the best AI models, agents, and automations. Browse ChatGPT Plus, Claude Pro, n8n workflows, Zapier integrations and more."
        keywords="AI marketplace, ChatGPT Plus, Claude Pro, AI models, AI agents, automation, n8n, Zapier, AI tools"
        url="/"
      />
      
      {/* Rocket Animations */}
      <RocketAnimation rockets={rocketAnimations} />
      
      {/* Header with enhanced stats */}
      <header className="bg-white border-b sticky top-0 z-40">
        <LiveStatsBar />
        <Header />
      </header>
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Category Navigation */}
      <CategoryNav />
      
      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <FacetedFilters 
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {displayProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </div>
        
        {displayProducts.length === 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear All Filters
            </motion.button>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {showQuickView && (
          <QuickViewModal 
            product={showQuickView} 
            onClose={() => setShowQuickView(null)} 
          />
        )}
        {showQuiz && <QuizModal />}
        <CheckoutModal 
          isOpen={showCheckout} 
          onClose={() => setShowCheckout(false)} 
        />
      </AnimatePresence>
      
      {/* Toast Container */}
      <Toaster />
    </div>
  );
}

// Main App Wrapper with Routing
export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <CartProvider>
          <Routes>
            <Route path="/" element={<PrometheusApp />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/community" element={<CommunityPage />} />
          </Routes>
        </CartProvider>
      </Router>
    </HelmetProvider>
  );
}