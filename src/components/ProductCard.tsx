import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import OptimizedImage from './common/OptimizedImage';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onAddToCart?: () => void;
  darkMode?: boolean;
}

/**
 * ProductCard - Molecule component for product display
 * Implements memoization for zero re-renders and trust-building design
 * Follows minimalism principles for intelligence signaling (Nahai 2012)
 */
const ProductCard = memo(({ product, onQuickView, onAddToCart, darkMode = false }: ProductCardProps) => {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Handle image loading errors with fallback
  // Enhanced image error handling with fallback (Unsplash URLs fail-safe)
  const handleImageError = () => {
    console.warn(`Image failed to load for product: ${product.name}`);
    setImageError(true);
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart();
    } else {
      addItem(product);
    }
  };

  const handleQuickView = () => {
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -4,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`
        ${darkMode 
          ? 'bg-gray-800 border border-gray-700 shadow-md hover:shadow-lg' 
          : 'bg-slate-50 border border-gray-200/50 shadow-lg hover:shadow-xl'
        } 
        backdrop-blur-sm rounded-xl p-6 group hover:border-purple-200 transition-all duration-200
      `}
    >
      {/* Product Image with optimized loading and AI-themed visuals */}
      <div className="relative mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
        <OptimizedImage
          productId={product.id.toString()}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          priority={false}
        />
        
        {/* Hover actions - minimal and elegant */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all duration-200"
          >
            <Heart className={`w-4 h-4 transition-colors duration-200 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>

      {/* Product Info - Clean typography for trust */}
      <div className="space-y-3">
        <div>
          <Link 
            href={`/product/${product.id}`}
            className={`font-semibold text-lg leading-tight mb-1 hover:text-primary transition-colors block ${
              darkMode ? 'text-gray-100' : 'text-navy'
            }`}
          >
            {product.name}
          </Link>
          <p className={`text-sm line-clamp-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>{product.tagline}</p>
        </div>
        
        {/* Rating - Trust signal */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>({product.reviews})</span>
        </div>

        {/* Features - Maximum 3 for cognitive load reduction */}
        <ul className="space-y-1">
          {product.features.slice(0, 3).map((feature, index) => (
            <li key={index} className={`flex items-center space-x-2 text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
              <span className="truncate">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Price and CTA - Clear hierarchy with AI gradient styling */}
        <div className={`flex items-center justify-between pt-4 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-energy-cyan">${product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-red-400 line-through text-sm font-medium">
                ${product.originalPrice}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleQuickView}
              className={`p-2.5 transition-all duration-200 rounded-lg ${
                darkMode 
                  ? 'text-gray-400 hover:text-purple-400 hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
              title="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-energy-cyan to-energy-purple hover:from-energy-cyan/80 hover:to-energy-purple/80 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md min-w-[120px]"
            >
              <ShoppingCart className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Add to Cart</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;