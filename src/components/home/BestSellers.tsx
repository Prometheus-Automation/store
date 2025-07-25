import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Users } from 'lucide-react';
import ProductCard from '../ProductCard';
import { allProducts } from '../../data/products';
import type { Product } from '../../types';

interface BestSellersProps {
  darkMode?: boolean;
}

/**
 * BestSellers - Premium AI marketplace bestsellers section
 * Minimalist design with subtle trust signals for premium feel
 * Navy color scheme aligned with AI Amazon aesthetic
 */
const BestSellers = memo(({ darkMode = false }: BestSellersProps) => {
  // Get bestseller products (highest rated with most reviews)
  const bestSellers = allProducts
    .filter(product => product.rating >= 4.7 && product.reviews > 1000)
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 4);

  return (
    <section className="py-6 relative">
      {/* Nebula overlay background */}
      <div className="relative bg-gradient-to-r from-[#0a0a1e] to-[#191970] bg-opacity-10 rounded-lg p-6">
        {/* Nebula background image - your custom image */}
        <div className="absolute inset-0 bg-[url('/nebula-red.png')] bg-cover bg-center opacity-30 filter blur-[1px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header - Clean and minimal */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-energy-cyan to-energy-purple rounded-lg flex items-center justify-center shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="relative z-10 text-3xl font-bold bg-inviting-gradient bg-clip-text text-transparent text-shadow-glow-sharp antialiased backface-hidden">
                Best Sellers
              </h2>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Most trusted by professionals
              </p>
            </div>
          </div>

          <Link 
            to="/bestsellers" 
            className={`flex items-center space-x-2 font-semibold transition-colors group ${
              darkMode 
                ? 'text-energy-cyan hover:text-cosmic-white' 
                : 'text-primary hover:text-navy'
            }`}
          >
            <span>View All</span>
            <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Subtle trust indicator */}
        <div className={`mb-8 border rounded-lg p-4 ${
          darkMode 
            ? 'bg-neural-navy/30 border-gray-600/30' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`flex items-center justify-center space-x-6 text-sm ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <div className="flex items-center space-x-2">
              <Users className={`w-4 h-4 ${
                darkMode ? 'text-energy-cyan' : 'text-primary'
              }`} />
              <span>
                <span className={`font-semibold ${
                  darkMode ? 'text-cosmic-white' : 'text-navy'
                }`}>12,000+</span> active users
              </span>
            </div>
            <div className={`w-px h-4 ${
              darkMode ? 'bg-gray-600' : 'bg-gray-300'
            }`} />
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Verified ratings from real customers</span>
            </div>
          </div>
        </div>

        {/* Bestseller Products Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {bestSellers.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              {/* Minimal bestseller indicator */}
              <div className="absolute -top-2 -right-2 z-20">
                <div className="bg-gradient-to-r from-energy-cyan to-energy-purple text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                  #{index + 1}
                </div>
              </div>

              {/* Clean Product Card */}
              <div className="bg-white rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all">
                <ProductCard product={product} darkMode={darkMode} />
              </div>

            </motion.div>
          ))}
        </div>

        </div>
      </div>
    </section>
  );
});

BestSellers.displayName = 'BestSellers';

export default BestSellers;