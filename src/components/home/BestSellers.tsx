import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Users } from 'lucide-react';
import ProductCard from '../ProductCard';
import { allProducts } from '../../data/products';
import type { Product } from '../../types';

/**
 * BestSellers - Premium AI marketplace bestsellers section
 * Minimalist design with subtle trust signals for premium feel
 * Navy color scheme aligned with AI Amazon aesthetic
 */
const BestSellers = memo(() => {
  // Get bestseller products (highest rated with most reviews)
  const bestSellers = allProducts
    .filter(product => product.rating >= 4.7 && product.reviews > 1000)
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 4);

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header - Clean and minimal */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-navy">
                Best Sellers
              </h2>
              <p className="text-gray-600 text-sm">
                Most trusted by professionals
              </p>
            </div>
          </div>

          <Link 
            to="/bestsellers" 
            className="flex items-center space-x-2 text-primary hover:text-navy font-semibold transition-colors group"
          >
            <span>View All</span>
            <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Subtle trust indicator */}
        <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-primary" />
              <span>
                <span className="font-semibold text-navy">12,000+</span> active users
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Verified ratings from real customers</span>
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
              {/* Minimal bestseller indicator */}
              <div className="absolute -top-2 -right-2 z-20">
                <div className="bg-navy text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                  #{index + 1}
                </div>
              </div>

              {/* Clean Product Card */}
              <div className="bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all">
                <ProductCard product={product} />
              </div>

              {/* Subtle sales indicator */}
              <div className="mt-3 text-center text-sm text-gray-600">
                <span className="font-medium text-navy">{product.reviews}</span> verified reviews
              </div>
            </motion.div>
          ))}
        </div>

        {/* Minimal social proof */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Trusted by <span className="font-semibold text-navy">industry leaders</span> worldwide
          </p>
        </div>
      </div>
    </section>
  );
});

BestSellers.displayName = 'BestSellers';

export default BestSellers;