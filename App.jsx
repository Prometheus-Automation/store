import React, { useState, useEffect, createContext, useContext } from 'react';
import { Search, ShoppingCart, Sparkles, Bot, Zap, Brain, Activity, Star, Heart, Play, ChevronDown, Filter, ArrowRight, Cpu, Layers, Code, Shield, Clock, CheckCircle, TrendingUp, Users, BarChart, X, Menu, ChevronRight, Rocket, DollarSign, Award } from 'lucide-react';

// Cart Context
const CartContext = createContext();

function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product) => {
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
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

// Tooltip Component for Stats
const StatsTooltip = ({ children, content, position = "bottom" }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)} // Mobile tap support
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-sm whitespace-nowrap
          ${position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'} 
          left-1/2 transform -translate-x-1/2
          before:content-[''] before:absolute before:w-2 before:h-2 before:bg-gray-900 before:rotate-45 before:left-1/2 before:transform before:-translate-x-1/2
          ${position === 'bottom' ? 'before:-top-1' : 'before:-bottom-1'}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// Main App Component
function PrometheusApp() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);

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

  // Updated product data with correct 2025 pricing
  const products = {
    models: [
      {
        id: 1,
        name: 'ChatGPT Plus',
        tagline: 'The Creative Genius 🎨',
        provider: 'OpenAI',
        price: 20,
        originalPrice: null,
        unit: '/month',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop',
        badge: 'Most Popular 🔥',
        badgeColor: 'bg-blue-500',
        rating: 4.8,
        reviews: 15420,
        features: ['GPT-4 Access', 'DALL-E 3', 'Advanced Analytics', 'Code Interpreter', 'Custom GPTs'],
        stats: { users: '100M+', satisfaction: '98%', responseTime: '1.2s' },
        category: 'Language Model',
        description: 'Perfect for creative writing, coding help, and general assistance',
        videoUrl: 'https://example.com/chatgpt-demo.mp4'
      },
      {
        id: 2,
        name: 'ChatGPT Pro',
        tagline: 'Enterprise Power 💼',
        provider: 'OpenAI',
        price: 200,
        unit: '/month',
        image: 'https://images.unsplash.com/photo-1676277791608-ac8206f0d3ba?w=400&h=400&fit=crop',
        badge: 'Pro Choice',
        badgeColor: 'bg-purple-500',
        rating: 4.9,
        reviews: 3456,
        features: ['Unlimited GPT-4', 'Priority Access', 'Extended Context', 'Team Collaboration', 'API Credits'],
        stats: { context: '128K tokens', uptime: '99.99%', support: '24/7' },
        category: 'Language Model',
        description: 'For professionals who need maximum AI power',
        apiPricing: { input: '$0.01/1K', output: '$0.03/1K' }
      },
      {
        id: 3,
        name: 'Claude Pro',
        tagline: 'The Analytical Mind 🧠',
        provider: 'Anthropic',
        price: 20,
        unit: '/month',
        image: 'https://images.unsplash.com/photo-1686191128892-3b88fa2a5b8e?w=400&h=400&fit=crop',
        badge: 'Best for Research',
        badgeColor: 'bg-green-500',
        rating: 4.9,
        reviews: 8932,
        features: ['200K Context', 'Research Mode', 'Code Review', 'File Analysis', 'Constitutional AI'],
        stats: { accuracy: '99.2%', context: '200K tokens', ethics: 'A+' },
        category: 'Language Model',
        description: 'Ideal for deep research and complex analysis',
        videoUrl: 'https://example.com/claude-demo.mp4'
      },
      {
        id: 4,
        name: 'Claude Max',
        tagline: 'Maximum Intelligence 🚀',
        provider: 'Anthropic',
        price: 150,
        originalPrice: 200,
        unit: '/month',
        image: 'https://images.unsplash.com/photo-1684487747385-442fddd21497?w=400&h=400&fit=crop',
        badge: 'Save $50',
        badgeColor: 'bg-red-500',
        rating: 5.0,
        reviews: 1234,
        features: ['Unlimited Context', 'Priority Processing', 'Custom Training', 'Enterprise Support'],
        stats: { processing: 'Real-time', availability: '100%', customization: 'Full' },
        category: 'Language Model',
        description: 'The ultimate Claude experience for enterprises'
      },
      {
        id: 5,
        name: 'Grok Heavy',
        tagline: 'Real-Time AI Revolution 🌐',
        provider: 'xAI',
        price: 300,
        unit: '/month',
        image: 'https://images.unsplash.com/photo-1684487747720-1ba29cda82f8?w=400&h=400&fit=crop',
        badge: 'Cutting Edge',
        badgeColor: 'bg-yellow-600',
        rating: 4.7,
        reviews: 3421,
        features: ['X Platform Data', 'Real-Time Info', 'Humor Mode', 'No Filters', 'Direct Integration'],
        stats: { realTime: 'Yes', dataPoints: '500M+', updates: 'Live' },
        category: 'Language Model',
        description: 'Access to x.ai/grok for full details',
        apiPricing: { input: '$3/1M', output: '$15/1M' },
        externalLink: 'https://x.ai/grok'
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
        image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&h=400&fit=crop',
        badge: '50% OFF',
        badgeColor: 'bg-red-500',
        rating: 4.6,
        reviews: 2156,
        features: ['24/7 Availability', 'Multi-Language', 'Sentiment Analysis', 'Auto-Escalation', 'CRM Integration'],
        stats: { resolved: '94%', languages: '50+', uptime: '99.9%' },
        category: 'Customer Service',
        description: 'AI Agent: A smart bot that handles customer inquiries automatically'
      },
      {
        id: 7,
        name: 'Sales Autopilot',
        tagline: 'Close Deals While You Sleep 💰',
        provider: 'Zapier Elite',
        price: 75,
        unit: '/month',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
        badge: 'Revenue Booster',
        badgeColor: 'bg-yellow-600',
        rating: 4.8,
        reviews: 1843,
        features: ['Lead Scoring AI', 'Email Sequences', 'CRM Sync', 'Deal Tracking', 'Slack Notifications'],
        stats: { conversion: '+47%', deals: '2.3x', roi: '580%' },
        category: 'Sales',
        description: 'Automation: Connects your apps to work together automatically'
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
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop',
        badge: 'Creator Favorite ⭐',
        badgeColor: 'bg-pink-500',
        rating: 4.7,
        reviews: 967,
        features: ['Auto-Post', 'AI Captions', 'Trend Analysis', 'Multi-Platform', 'Analytics Dashboard'],
        stats: { platforms: '8+', posts: 'Unlimited', engagement: '+215%' },
        category: 'Marketing',
        description: 'Save 12 hours per week on social media management'
      },
      {
        id: 9,
        name: 'Data Pipeline Master',
        tagline: 'ETL on Autopilot 📊',
        provider: 'Python Scripts',
        price: 89,
        unit: '/month',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop',
        badge: 'Enterprise Ready',
        badgeColor: 'bg-gray-700',
        rating: 4.9,
        reviews: 2341,
        features: ['Real-Time Sync', 'Data Validation', 'Error Handling', 'Custom Scripts', 'API Webhooks'],
        stats: { throughput: '1M/hour', accuracy: '99.99%', sources: '200+' },
        category: 'Data',
        description: 'Professional data automation for serious businesses'
      },
      {
        id: 10,
        name: 'n8n Starter Kit',
        tagline: 'No-Code Automation Magic ✨',
        provider: 'n8n',
        price: 20,
        unit: '/month',
        image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&h=400&fit=crop',
        badge: 'Beginner Friendly',
        badgeColor: 'bg-blue-500',
        rating: 4.5,
        reviews: 5678,
        features: ['Visual Builder', 'Pre-built Templates', 'Community Support', 'Self-Hosted Option'],
        stats: { nodes: '300+', templates: '1000+', community: '50K+' },
        category: 'Workflow',
        description: 'Perfect starting point for automation beginners'
      },
      {
        id: 11,
        name: 'Zapier Pro Bundle',
        tagline: 'Connect Everything 🔗',
        provider: 'Zapier',
        price: 49,
        originalPrice: 69,
        unit: '/month',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
        badge: 'Most Integrations',
        badgeColor: 'bg-orange-500',
        rating: 4.7,
        reviews: 12345,
        features: ['5000+ Apps', 'Multi-Step Zaps', 'Filters & Logic', 'Team Collaboration'],
        stats: { apps: '5000+', zaps: 'Unlimited', support: 'Priority' },
        category: 'Integration',
        description: 'The easiest way to automate your work'
      }
    ]
  };

  const allProducts = [...products.models, ...products.agents, ...products.automations];
  const displayProducts = activeCategory === 'all' ? allProducts : products[activeCategory] || [];

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
    return () => document.head.removeChild(styleSheet);
  }, []);

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
          {isExpanded && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-700 space-y-2 animate-in slide-in-from-top-2 duration-200">
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
            </div>
          )}
        </div>
      </div>
    );
  };

  // Neural Background Component
  const NeuralBackground = () => {
    const [particles, setParticles] = useState([]);
    
    useEffect(() => {
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 20 + 10
      }));
      setParticles(newParticles);
    }, []);

    return (
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-cyan-50" />
        <svg className="absolute inset-0 w-full h-full">
          {particles.map((particle, i) => (
            <g key={particle.id}>
              <circle
                cx={`${particle.x}%`}
                cy={`${particle.y}%`}
                r={particle.size}
                fill="#00bfff"
                opacity="0.4"
                className="animate-pulse"
              />
              {i < particles.length - 1 && (
                <line
                  x1={`${particle.x}%`}
                  y1={`${particle.y}%`}
                  x2={`${particles[i + 1].x}%`}
                  y2={`${particles[i + 1].y}%`}
                  stroke="#00bfff"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              )}
            </g>
          ))}
        </svg>
      </div>
    );
  };

  // Header Component
  const Header = () => {
    const { totalItems } = useCart();
    
    return (
      <header className="bg-white border-b sticky top-0 z-40">
        {/* Enhanced Live Stats Bar */}
        <LiveStatsBar />

        {/* Main header */}
        <div className="px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Logo & Categories */}
              <div className="flex items-center space-x-4 lg:space-x-8">
                <h1 className={`text-2xl lg:text-3xl font-bold ${gradientText}`}>
                  Prometheus
                </h1>
                
                {/* Desktop Categories */}
                <nav className="hidden lg:flex items-center space-x-6">
                  <button 
                    onClick={() => setActiveCategory('all')}
                    className={`font-medium transition-colors ${
                      activeCategory === 'all' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    All AI Tools
                  </button>
                  <button 
                    onClick={() => setActiveCategory('models')}
                    className={`font-medium transition-colors flex items-center ${
                      activeCategory === 'models' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <Brain size={18} className="mr-1" />
                    Models
                  </button>
                  <button 
                    onClick={() => setActiveCategory('agents')}
                    className={`font-medium transition-colors flex items-center ${
                      activeCategory === 'agents' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <Bot size={18} className="mr-1" />
                    Agents
                  </button>
                  <button 
                    onClick={() => setActiveCategory('automations')}
                    className={`font-medium transition-colors flex items-center ${
                      activeCategory === 'automations' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <Layers size={18} className="mr-1" />
                    Automations
                  </button>
                </nav>
              </div>

              {/* Search & Actions */}
              <div className="flex items-center space-x-2 lg:space-x-4">
                <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2">
                  <Search size={18} className="text-gray-500 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search AI solutions..."
                    className="bg-transparent outline-none w-48 xl:w-64"
                  />
                </div>

                <button className="p-2 lg:hidden">
                  <Search size={20} className="text-gray-700" />
                </button>

                <button className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
                  <Sparkles size={20} />
                  <span className="hidden xl:inline">AI Advisor</span>
                </button>

                <button className="relative flex items-center space-x-1 text-gray-700 hover:text-gray-900">
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>

                <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 lg:px-4 py-2 rounded-full font-medium hover:shadow-lg transition-shadow text-sm lg:text-base">
                  Get Started
                </button>
              </div>
            </div>

            {/* Mobile Categories */}
            <div className="lg:hidden mt-3 flex items-center space-x-3 overflow-x-auto scrollbar-hide pb-2">
              <button 
                onClick={() => setActiveCategory('all')}
                className={`text-sm whitespace-nowrap px-3 py-1 rounded-full transition-colors ${
                  activeCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveCategory('models')}
                className={`text-sm whitespace-nowrap px-3 py-1 rounded-full transition-colors flex items-center ${
                  activeCategory === 'models' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Brain size={14} className="mr-1" />
                Models
              </button>
              <button 
                onClick={() => setActiveCategory('agents')}
                className={`text-sm whitespace-nowrap px-3 py-1 rounded-full transition-colors flex items-center ${
                  activeCategory === 'agents' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Bot size={14} className="mr-1" />
                Agents
              </button>
              <button 
                onClick={() => setActiveCategory('automations')}
                className={`text-sm whitespace-nowrap px-3 py-1 rounded-full transition-colors flex items-center ${
                  activeCategory === 'automations' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Layers size={14} className="mr-1" />
                Automations
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  };

  // Hero Section
  const HeroSection = () => (
    <section className="relative bg-gradient-to-b from-gray-50 to-white py-8 lg:py-12 overflow-hidden">
      <NeuralBackground />
      
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center space-y-4 lg:space-y-6">
          <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
            <Rocket size={16} />
            <span>Launch Special: Save up to 50% on select AI tools</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Unlock <span className={gradientText}>AI Power</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            Models, Agents, Automations for Everyone
          </p>
          <p className="text-sm lg:text-base text-gray-700 max-w-2xl mx-auto px-4">
            No tech expertise needed. Browse, buy, and deploy AI solutions that actually work.
            From ChatGPT to custom automations—we make AI accessible.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2 lg:pt-4">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 lg:px-6 py-2.5 lg:py-3 rounded-full font-semibold transition-all transform hover:scale-105 w-full sm:w-auto flex items-center justify-center">
              Browse AI Models
              <ArrowRight size={20} className="ml-2" />
            </button>
            <button 
              onClick={() => setShowQuiz(true)}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-5 lg:px-6 py-2.5 lg:py-3 rounded-full font-semibold transition-all w-full sm:w-auto"
            >
              Take the Quiz (2 min)
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 lg:gap-12 pt-6 lg:pt-8 max-w-sm sm:max-w-none mx-auto">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-blue-600">50+</div>
              <div className="text-xs lg:text-base text-gray-600">AI Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-blue-600">$8/mo</div>
              <div className="text-xs lg:text-base text-gray-600">Starting Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-blue-600">5min</div>
              <div className="text-xs lg:text-base text-gray-600">Setup Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Product Card
  const ProductCard = ({ product }) => {
    const { addItem } = useCart();
    
    return (
      <div 
        className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
        onMouseEnter={() => setHoveredProduct(product.id)}
        onMouseLeave={() => setHoveredProduct(null)}
      >
        {/* Badge */}
        {product.badge && (
          <div className={`${product.badgeColor} text-white text-xs font-semibold px-3 py-1 absolute top-4 left-4 rounded-full z-10`}>
            {product.badge}
          </div>
        )}

        {/* Quick Actions */}
        {hoveredProduct === product.id && (
          <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
            <button 
              className="bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-all"
              aria-label="Add to favorites"
            >
              <Heart size={16} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickView(product);
              }}
              className="bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-all"
              aria-label="Quick view"
            >
              <Play size={16} />
            </button>
          </div>
        )}

        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4 lg:p-5">
          {/* Header */}
          <div className="mb-3">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
            <p className="text-xs lg:text-sm text-gray-600">{product.tagline}</p>
            <p className="text-xs text-gray-500 mt-1">by {product.provider}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-xs lg:text-sm text-gray-600 ml-2">
              {product.rating} ({product.reviews.toLocaleString()})
            </span>
          </div>

          {/* Features Preview */}
          <div className="flex flex-wrap gap-1 mb-3 lg:mb-4">
            {product.features.slice(0, 2).map((feature, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {feature}
              </span>
            ))}
            {product.features.length > 2 && (
              <span className="text-xs text-gray-500">+{product.features.length - 2}</span>
            )}
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-3 gap-1 lg:gap-2 mb-3 lg:mb-4 py-2 lg:py-3 border-y border-gray-100">
            {Object.entries(product.stats).slice(0, 3).map(([key, value], i) => (
              <div key={i} className="text-center">
                <div className="text-xs lg:text-sm font-semibold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 capitalize">{key}</div>
              </div>
            ))}
          </div>

          {/* Price & Action */}
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline">
                <span className="text-xl lg:text-2xl font-bold text-gray-900">${product.price}</span>
                <span className="text-sm lg:text-base text-gray-600 ml-1">{product.unit}</span>
              </div>
              {product.originalPrice && (
                <span className="text-xs lg:text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
              {product.apiPricing && (
                <p className="text-xs text-blue-600 mt-1">
                  API: {product.apiPricing.input} input
                </p>
              )}
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                addItem(product);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-medium text-sm lg:text-base transition-all transform hover:scale-105"
              aria-label={`Add ${product.name} to cart`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Dynamic Quiz Recommendation Logic
  const getQuizRecommendations = () => {
    if (quizAnswers.length < 3) return [];
    
    const [goal, skillLevel, budget] = quizAnswers;
    let recommendations = [];
    
    // Budget constraints
    const budgetFilter = (product) => {
      switch (budget) {
        case 0: return product.price <= 25;
        case 1: return product.price <= 100;
        case 2: return product.price <= 500;
        default: return true;
      }
    };
    
    // Goal-based recommendations
    if (goal === 0) { // Save time on repetitive tasks
      recommendations = allProducts.filter(p => 
        (p.category === 'Workflow' || p.category === 'Marketing' || p.category === 'Data') && 
        budgetFilter(p)
      );
    } else if (goal === 1) { // Boost sales and revenue
      recommendations = allProducts.filter(p => 
        (p.category === 'Sales' || p.category === 'Customer Service') && 
        budgetFilter(p)
      );
    } else if (goal === 2) { // Improve customer experience
      recommendations = allProducts.filter(p => 
        p.category === 'Customer Service' && 
        budgetFilter(p)
      );
    } else { // Create content faster
      recommendations = allProducts.filter(p => 
        (p.category === 'Language Model' || p.category === 'Marketing') && 
        budgetFilter(p)
      );
    }
    
    // If skill level is beginner, prioritize beginner-friendly options
    if (skillLevel === 0) {
      recommendations = recommendations.filter(p => 
        p.badge?.includes('Beginner') || 
        p.features.includes('Visual Builder') ||
        p.features.includes('Pre-built Templates')
      );
    }
    
    return recommendations.slice(0, 3);
  };

  // Quick View Modal
  const QuickViewModal = ({ product }) => {
    const { addItem } = useCart();
    
    if (!product) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-lg lg:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 lg:p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">{product.name}</h3>
                <p className="text-sm lg:text-base text-gray-600">{product.tagline}</p>
              </div>
              <button 
                onClick={() => setShowQuickView(null)}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Demo Area */}
            <div className="aspect-video bg-gray-100 rounded-lg mb-4 lg:mb-6 relative overflow-hidden">
              <img 
                src={product.image} 
                alt={`${product.name} demo`}
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  className={`bg-white/90 backdrop-blur rounded-full p-3 lg:p-4 shadow-lg hover:bg-white transition-all ${!product.videoUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Play demo video"
                  disabled={!product.videoUrl}
                >
                  <Play size={24} />
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-4">{product.description}</p>

            {/* Beginner Guide */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">🚀 Beginner's Guide (5 Simple Steps)</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Click "Subscribe" and complete secure payment</li>
                <li>2. Receive your API key instantly via email</li>
                <li>3. Watch our 3-minute setup video tutorial</li>
                <li>4. Connect to your favorite apps (no coding!)</li>
                <li>5. Start automating and save hours every week!</li>
              </ol>
            </div>

            {/* Bundle Offer */}
            {product.category === 'Language Model' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-purple-900">
                  💰 <strong>Bundle & Save 20%:</strong> Pair with Zapier Automation for complete workflow
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              <button 
                onClick={() => {
                  addItem(product);
                  setShowQuickView(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 lg:py-3 rounded-lg font-semibold transition-all text-sm lg:text-base flex items-center justify-center"
              >
                <ShoppingCart size={18} className="mr-2" />
                Add to Cart - ${product.price}{product.unit}
              </button>
              <button 
                className="border-2 border-gray-300 hover:border-gray-400 py-2.5 lg:py-3 rounded-lg font-semibold transition-all text-sm lg:text-base"
              >
                View Full Details
              </button>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center justify-center mt-4 text-xs text-gray-600">
              <Shield size={16} className="mr-1" />
              <span>Stripe Secured • 30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Quiz Modal with Dynamic Recommendations
  const QuizModal = () => {
    const questions = [
      {
        question: "What's your main goal with AI?",
        options: [
          { text: "Save time on repetitive tasks", emoji: "⏰" },
          { text: "Boost sales and revenue", emoji: "💰" },
          { text: "Improve customer experience", emoji: "😊" },
          { text: "Create content faster", emoji: "✍️" }
        ]
      },
      {
        question: "What's your technical skill level?",
        options: [
          { text: "Complete beginner", emoji: "🌱" },
          { text: "Some experience", emoji: "🌿" },
          { text: "Pretty comfortable", emoji: "🌳" },
          { text: "I'm a pro!", emoji: "🚀" }
        ]
      },
      {
        question: "What's your budget?",
        options: [
          { text: "Under $25/month", emoji: "💵" },
          { text: "$25-100/month", emoji: "💸" },
          { text: "$100-500/month", emoji: "💰" },
          { text: "Sky's the limit!", emoji: "🌟" }
        ]
      }
    ];

    if (!showQuiz) return null;

    const handleAnswerClick = (answerIndex) => {
      const newAnswers = [...quizAnswers, answerIndex];
      setQuizAnswers(newAnswers);
      
      if (quizStep < questions.length - 1) {
        setQuizStep(quizStep + 1);
      } else {
        // Quiz completed, show recommendations
        setQuizStep(quizStep + 1);
      }
    };

    const resetQuiz = () => {
      setShowQuiz(false);
      setQuizStep(0);
      setQuizAnswers([]);
    };

    const recommendations = getQuizRecommendations();

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Find Your Perfect AI</h3>
            <button 
              onClick={resetQuiz}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close quiz"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((quizStep + 1) / (questions.length + 1)) * 100}%` }}
            />
          </div>

          {quizStep < questions.length ? (
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {questions[quizStep].question}
              </h4>
              <div className="space-y-3">
                {questions[quizStep].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerClick(i)}
                    className="w-full p-4 bg-gray-50 hover:bg-blue-50 rounded-lg text-left transition-colors flex items-center justify-between group"
                  >
                    <span className="font-medium">{option.text}</span>
                    <span className="text-2xl group-hover:scale-110 transition-transform">{option.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Perfect! We found your matches</h4>
              
              {recommendations.length > 0 ? (
                <div>
                  <p className="text-gray-600 mb-4">Based on your answers, here are our top recommendations:</p>
                  <div className="space-y-3 mb-4">
                    {recommendations.map(product => (
                      <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 text-left">
                          <h5 className="font-semibold text-sm">{product.name}</h5>
                          <p className="text-xs text-gray-600">${product.price}{product.unit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      resetQuiz();
                      setActiveCategory(recommendations[0].category.toLowerCase() === 'language model' ? 'models' : 
                                       recommendations[0].category.toLowerCase().includes('service') || recommendations[0].category.toLowerCase().includes('sales') ? 'agents' : 'automations');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    View Recommendations
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">We recommend starting with our beginner-friendly automation tools!</p>
                  <button 
                    onClick={() => {
                      resetQuiz();
                      setActiveCategory('automations');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Browse Automations
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />

      {/* Category Pills */}
      <div className="bg-white border-y py-3 lg:py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-2 lg:space-x-4 overflow-x-auto scrollbar-hide">
            <span className="text-xs lg:text-sm font-medium text-gray-700 whitespace-nowrap flex-shrink-0">Quick filters:</span>
            {['Under $25', 'Best Rated', 'Most Popular', 'New Arrivals', 'Free Trial', 'Beginner Friendly'].map(filter => (
              <button 
                key={filter}
                className="px-3 lg:px-4 py-1.5 lg:py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-xs lg:text-sm font-medium text-gray-700 whitespace-nowrap transition-colors flex-shrink-0"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              {activeCategory === 'all' ? 'All AI Solutions' : 
               activeCategory === 'models' ? 'AI Language Models' :
               activeCategory === 'agents' ? 'Autonomous AI Agents' :
               'Workflow Automations'}
            </h2>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              {displayProducts.length} products available • Save hours every week
            </p>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
            <select className="px-3 lg:px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm lg:text-base">
              <option>Most Relevant</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Highest Rated</option>
              <option>Most Reviews</option>
              <option>Newest First</option>
            </select>
            
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {displayProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* AI Vibes Video Feed Section */}
        <div className="mt-12 bg-white rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Play className="mr-2 text-blue-600" size={24} />
            AI Vibes - See It In Action
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayProducts.slice(0, 4).map(product => (
              <div key={product.id} className="relative aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
                <img 
                  src={product.image} 
                  alt={`${product.name} demo`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="font-semibold text-sm">{product.name}</p>
                  <p className="text-xs opacity-90">by {product.provider}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className={`bg-white/20 backdrop-blur rounded-full p-3 ${!product.videoUrl ? 'opacity-50' : ''}`}>
                    <Play size={24} className="text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Section */}
        <div className="mt-12 lg:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white rounded-lg p-4 lg:p-6 text-center">
            <Shield className="w-8 lg:w-12 h-8 lg:h-12 text-blue-600 mx-auto mb-2 lg:mb-3" />
            <h3 className="font-semibold text-sm lg:text-base mb-1 lg:mb-2">Stripe Secured</h3>
            <p className="text-xs lg:text-sm text-gray-600">Bank-level encryption</p>
          </div>
          <div className="bg-white rounded-lg p-4 lg:p-6 text-center">
            <CheckCircle className="w-8 lg:w-12 h-8 lg:h-12 text-green-600 mx-auto mb-2 lg:mb-3" />
            <h3 className="font-semibold text-sm lg:text-base mb-1 lg:mb-2">Verified Sellers</h3>
            <p className="text-xs lg:text-sm text-gray-600">All providers verified</p>
          </div>
          <div className="bg-white rounded-lg p-4 lg:p-6 text-center">
            <Award className="w-8 lg:w-12 h-8 lg:h-12 text-purple-600 mx-auto mb-2 lg:mb-3" />
            <h3 className="font-semibold text-sm lg:text-base mb-1 lg:mb-2">30-Day Guarantee</h3>
            <p className="text-xs lg:text-sm text-gray-600">Money back, no questions</p>
          </div>
          <div className="bg-white rounded-lg p-4 lg:p-6 text-center">
            <Users className="w-8 lg:w-12 h-8 lg:h-12 text-yellow-600 mx-auto mb-2 lg:mb-3" />
            <h3 className="font-semibold text-sm lg:text-base mb-1 lg:mb-2">50K+ Community</h3>
            <p className="text-xs lg:text-sm text-gray-600">Learn from others</p>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal product={showQuickView} />

      {/* Enhanced Quiz Modal */}
      <QuizModal />

      {/* Live Notification */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-white rounded-lg shadow-lg p-3 lg:p-4 max-w-sm mx-auto sm:mx-0 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Sarah from Austin</p>
            <p className="text-xs text-gray-600 truncate">just saved 10 hours with Sales Autopilot</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Wrapper
export default function App() {
  return (
    <CartProvider>
      <PrometheusApp />
    </CartProvider>
  );
}