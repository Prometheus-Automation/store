import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Play, ShoppingCart } from 'lucide-react';
import ReactPlayer from 'react-player';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onQuickView?: (product: Product) => void;
}

const ProductCard = ({ 
  product, 
  isHovered: externalIsHovered,
  onMouseEnter,
  onMouseLeave,
  onQuickView 
}: ProductCardProps) => {
  const { addItem } = useCart();
  const [internalHovered, setInternalHovered] = useState(false);
  
  // Use external hover state if provided, otherwise use internal
  const isHovered = externalIsHovered !== undefined ? externalIsHovered : internalHovered;

  const handleMouseEnter = () => {
    if (onMouseEnter) {
      onMouseEnter();
    } else {
      setInternalHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (onMouseLeave) {
      onMouseLeave();
    } else {
      setInternalHovered(false);
    }
  };

  const handleQuickView = () => {
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        {onQuickView && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            onClick={handleQuickView}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-colors"
          >
            <ArrowRight size={16} />
          </motion.button>
        )}
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

export default ProductCard;