import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import OptimizedImage from './common/OptimizedImage';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onAddToCart?: () => void;
}

/**
 * ProductCard - Molecule component for product display
 * Implements memoization for zero re-renders and trust-building design
 * Follows minimalism principles for intelligence signaling (Nahai 2012)
 */
const ProductCard = memo(({ product, onQuickView, onAddToCart }: ProductCardProps) => {
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
      whileHover={{ y: -2 }}
      className="bg-surface border border-gray-200 rounded-xl p-6 group hover:shadow-lg transition-all duration-200 hover:border-primary-200"
    >
      {/* Product Image with optimized loading and AI-themed visuals */}
      <div className="relative mb-4 overflow-hidden rounded-lg bg-gray-100 group-hover:shadow-lg transition-shadow duration-200">
        <OptimizedImage
          productId={product.id.toString()}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          priority={false}
        />
        
        {/* Hover actions - minimal and elegant */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>

      {/* Product Info - Clean typography for trust */}
      <div className="space-y-3">
        <div>
          <Link 
            to={`/product/${product.id}`}
            className="font-semibold text-navy text-lg leading-tight mb-1 hover:text-primary transition-colors block"
          >
            {product.name}
          </Link>
          <p className="text-gray-600 text-sm line-clamp-2">{product.tagline}</p>
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
          <span className="text-gray-500 text-sm">({product.reviews})</span>
        </div>

        {/* Features - Maximum 3 for cognitive load reduction */}
        <ul className="space-y-1">
          {product.features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
              <span className="truncate">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Price and CTA - Clear hierarchy */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-navy-900">${product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-400 line-through text-sm">
                ${product.originalPrice}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleQuickView}
              className="p-2 text-gray-600 hover:text-primary-500 transition-colors"
              title="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;