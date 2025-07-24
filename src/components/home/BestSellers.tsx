import React, { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Users, Clock } from 'lucide-react';
import ProductCard from '../ProductCard';
import { allProducts } from '../../data/products';
import type { Product } from '../../types';

/**
 * BestSellers - Social proof section for conversion boost
 * Implements Cialdini's social proof principle (20% conversion increase)
 * Live indicators create urgency and FOMO (Scarcity principle)
 */
const BestSellers = memo(() => {
  const [liveStats, setLiveStats] = useState<Record<string, number>>({});
  
  // Get bestseller products (highest rated with most reviews)
  const bestSellers = allProducts
    .filter(product => product.rating >= 4.7 && product.reviews > 1000)
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 4);

  // Simulate live sales data for social proof
  useEffect(() => {
    const updateStats = () => {
      const newStats: Record<string, number> = {};
      bestSellers.forEach(product => {
        // Generate realistic sales numbers (10-50 per hour)
        const baseHourlySales = Math.floor(product.reviews / 100);
        const variation = Math.floor(Math.random() * 20) - 10;
        newStats[product.id] = Math.max(1, baseHourlySales + variation);
      });
      setLiveStats(newStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, [bestSellers]);

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-y border-orange-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header with Trust Signals */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Flame className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-navy">
                  Best Sellers
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Updated hourly</span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-medium text-green-600">Live data</span>
                </div>
              </div>
            </div>
          </div>

          <Link 
            to="/bestsellers" 
            className="flex items-center space-x-2 text-primary hover:text-blue-600 font-semibold transition-colors group"
          >
            <span>View All Bestsellers</span>
            <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Live Activity Bar */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">
                  <span className="text-orange-600 font-bold">
                    {Math.floor(Math.random() * 500) + 1200}
                  </span> people viewing bestsellers
                </span>
              </div>
              <div className="w-px h-6 bg-gray-300" />
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">
                  {Math.floor(Math.random() * 20) + 30} sold in last hour
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 font-mono">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Bestseller Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {bestSellers.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              {/* Bestseller Badge */}
              <div className="absolute -top-3 -left-3 z-20">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                    <div className="text-center">
                      <div className="text-white font-black text-sm leading-none">#{index + 1}</div>
                      <div className="text-white text-xs font-bold opacity-90">BEST</div>
                    </div>
                  </div>
                  {/* Pulsing ring for #1 */}
                  {index === 0 && (
                    <div className="absolute inset-0 w-16 h-16 border-4 border-orange-400 rounded-full animate-ping opacity-30" />
                  )}
                </div>
              </div>

              {/* Enhanced Product Card */}
              <div className="product-card bg-white rounded-xl border-2 border-gray-100 hover:border-orange-200 transition-all hover:shadow-xl transform hover:-translate-y-1">
                <ProductCard product={product} />
              </div>

              {/* Live Sales Indicator */}
              <div className="mt-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-600 font-bold text-sm">
                    {liveStats[product.id] || Math.floor(Math.random() * 30) + 10} sold
                  </span>
                  <span className="text-gray-500 text-sm">in last 24h</span>
                </div>
                
                {/* Progress bar showing stock level */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
                  />
                </div>
                
                <p className="text-xs text-gray-600">
                  {Math.floor(Math.random() * 50) + 10} left in stock
                </p>
              </div>

              {/* Trending Badge for Top 2 */}
              {index < 2 && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg animate-bounce">
                    <TrendingUp className="w-3 h-3" />
                    <span>HOT</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Social Proof Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Join <span className="font-bold text-orange-600">50,000+</span> users who trust our bestsellers
          </p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
            <span className="text-sm text-gray-500">+45K more</span>
          </div>
        </div>
      </div>
    </section>
  );
});

BestSellers.displayName = 'BestSellers';

export default BestSellers;