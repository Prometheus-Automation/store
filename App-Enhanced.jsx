import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Sparkles, Bot, Zap, Brain, Activity, Star, Heart, Play, ChevronDown, Filter, ArrowRight, Cpu, Layers, Code, Shield, Clock, CheckCircle, TrendingUp, Users, BarChart, X, Menu, ChevronRight, Rocket, DollarSign, Award } from 'lucide-react';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';

// Enhanced Cart Context with Rocket Animation
const CartContext = createContext();

function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [rocketAnimations, setRocketAnimations] = useState([]);

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

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, totalItems, rocketAnimations }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

// Enhanced Tooltip Component with Outside Click Handling
const StatsTooltip = ({ children, content, position = "bottom" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVisible && tooltipRef.current && !tooltipRef.current.contains(event.target)) {
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
const RocketAnimation = ({ rockets }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {rockets.map((rocket) => (
          <motion.div
            key={rocket.id}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight - 100,
              scale: 0,
              rotate: 0
            }}
            animate={{ 
              x: Math.random() * window.innerWidth,
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

// Main App Component
function PrometheusApp() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    sources: [],
    useCases: [],
    rating: 0,
    searchQuery: ''
  });

  const { rocketAnimations } = useCart();

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

  // Enhanced product data with more metadata for filtering
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
        image: 'https://images.unsplash.com/photo-1676277791608-ac8206f0d3ba?w=400&h=400&fit=crop',
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
        image: 'https://images.unsplash.com/photo-1686191128892-3b88fa2a5b8e?w=400&h=400&fit=crop',
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
        image: 'https://images.unsplash.com/photo-1684487747385-442fddd21497?w=400&h=400&fit=crop',
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
        image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&h=400&fit=crop',
        badge: '50% OFF',
        badgeColor: 'bg-red-500',
        rating: 4.6,
        reviews: 2156,
        features: ['24/7 Availability', 'Multi-Language', 'Sentiment Analysis', 'Auto-Escalation', 'CRM Integration'],
        stats: { resolved: '94%', languages: '50+', uptime: '99.9%' },
        category: 'Customer Service',
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
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
        badge: 'Revenue Booster',
        badgeColor: 'bg-yellow-600',
        rating: 4.8,
        reviews: 1843,
        features: ['Lead Scoring AI', 'Email Sequences', 'CRM Sync', 'Deal Tracking', 'Slack Notifications'],
        stats: { conversion: '+47%', deals: '2.3x', roi: '580%' },
        category: 'Sales',
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
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop',
        badge: 'Creator Favorite ⭐',
        badgeColor: 'bg-pink-500',
        rating: 4.7,
        reviews: 967,
        features: ['Auto-Post', 'AI Captions', 'Trend Analysis', 'Multi-Platform', 'Analytics Dashboard'],
        stats: { platforms: '8+', posts: 'Unlimited', engagement: '+215%' },
        category: 'Marketing',
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
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop',
        badge: 'Enterprise Ready',
        badgeColor: 'bg-gray-700',
        rating: 4.9,
        reviews: 2341,
        features: ['Real-Time Sync', 'Data Validation', 'Error Handling', 'Custom Scripts', 'API Webhooks'],
        stats: { throughput: '1M/hour', accuracy: '99.99%', sources: '200+' },
        category: 'Data',
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
        image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&h=400&fit=crop',
        badge: 'Beginner Friendly',
        badgeColor: 'bg-blue-500',
        rating: 4.5,
        reviews: 5678,
        features: ['Visual Builder', 'Pre-built Templates', 'Community Support', 'Self-Hosted Option'],
        stats: { nodes: '300+', templates: '1000+', community: '50K+' },
        category: 'Workflow',
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
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
        badge: 'Most Integrations',
        badgeColor: 'bg-orange-500',
        rating: 4.7,
        reviews: 12345,
        features: ['5000+ Apps', 'Multi-Step Zaps', 'Filters & Logic', 'Team Collaboration'],
        stats: { apps: '5000+', zaps: 'Unlimited', support: 'Priority' },
        category: 'Integration',
        description: 'The easiest way to automate your work',
        source: 'Zapier',
        useCase: 'productivity',
        difficulty: 'intermediate'
      }
    ]
  };

  const allProducts = [...products.models, ...products.agents, ...products.automations];
  
  // Enhanced filtering logic
  const getFilteredProducts = () => {
    let filtered = activeCategory === 'all' ? allProducts : products[activeCategory] || [];
    
    // Apply search
    if (filters.searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.features.some(feature => feature.toLowerCase().includes(filters.searchQuery.toLowerCase()))
      );
    }
    
    // Apply price range
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );
    
    // Apply sources
    if (filters.sources.length > 0) {
      filtered = filtered.filter(product => filters.sources.includes(product.source));
    }
    
    // Apply use cases
    if (filters.useCases.length > 0) {
      filtered = filtered.filter(product => filters.useCases.includes(product.useCase));
    }
    
    // Apply rating
    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
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
    const budgetFilter = (product) => {
      switch (budgetAnswer) {
        case 0: return product.price <= 25;
        case 1: return product.price <= 100;
        case 2: return product.price <= 500;
        default: return true;
      }
    };
    
    // Goal-based recommendations
    if (goalAnswer === 0) { // Save time on repetitive tasks
      recommendations = allProducts.filter(p => 
        (p.useCase === 'productivity' || p.category === 'Workflow' || p.category === 'Data') && 
        budgetFilter(p)
      );
    } else if (goalAnswer === 1) { // Boost sales and revenue
      recommendations = allProducts.filter(p => 
        (p.useCase === 'sales' || p.category === 'Sales') && 
        budgetFilter(p)
      );
    } else if (goalAnswer === 2) { // Improve customer experience
      recommendations = allProducts.filter(p => 
        (p.useCase === 'support' || p.category === 'Customer Service') && 
        budgetFilter(p)
      );
    } else { // Create content faster
      recommendations = allProducts.filter(p => 
        (p.useCase === 'content' || p.category === 'Language Model' || p.category === 'Marketing') && 
        budgetFilter(p)
      );
    }
    
    // If skill level is beginner, prioritize beginner-friendly options
    if (skillAnswer === 0) {
      recommendations = recommendations.filter(p => 
        p.difficulty === 'beginner' ||
        p.badge?.includes('Beginner') || 
        p.features.includes('Visual Builder') ||
        p.features.includes('Pre-built Templates')
      );
    }
    
    // Fallback logic: if less than 3 recommendations, broaden search
    if (recommendations.length < 3) {
      const maxBudget = budgetAnswer === 3 ? Infinity : [25, 100, 500][budgetAnswer];
      recommendations = allProducts
        .filter(p => p.price <= maxBudget)
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
    return () => document.head.removeChild(styleSheet);
  }, []);

  // Enhanced Neural Background with Full Framer Motion
  const NeuralBackground = () => {
    const [particles, setParticles] = useState([]);
    const [connections, setConnections] = useState([]);
    
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

  // Continue with the rest of the components...
  // This is getting quite long, should I continue with the rest of the components in the next part?

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Rocket Animations */}
      <RocketAnimation rockets={rocketAnimations} />
      
      {/* Header with enhanced stats */}
      <header className="bg-white border-b sticky top-0 z-40">
        <LiveStatsBar />
        
        {/* Rest of header implementation... */}
      </header>
      
      {/* The rest of the app... */}
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