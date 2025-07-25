import React, { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ShoppingCart, Tag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { allProducts } from '../../data/products';
import OptimizedImage from '../common/OptimizedImage';
import type { Product } from '../../types';

interface FlashDeal {
  product: Product;
  originalPrice: number;
  salePrice: number;
  discount: number;
  timeLeft: number; // in seconds
}

interface FlashDealsProps {
  darkMode?: boolean;
}

/**
 * FlashDeals - Premium limited-time offers section
 * Minimal design with subtle urgency and elegant typography
 * Navy/blue color scheme for trust and professionalism
 */
const FlashDeals = memo(({ darkMode = false }: FlashDealsProps) => {
  const { addItem } = useCart();
  
  // Create flash deals from products
  const createFlashDeals = (): FlashDeal[] => {
    const selectedProducts = allProducts.slice(0, 3);
    return selectedProducts.map(product => ({
      product,
      originalPrice: product.originalPrice || product.price * 1.3,
      salePrice: product.price,
      discount: Math.floor(((product.originalPrice || product.price * 1.3) - product.price) / (product.originalPrice || product.price * 1.3) * 100),
      timeLeft: 7200 + Math.floor(Math.random() * 3600) // 2-3 hours
    }));
  };

  const [deals, setDeals] = useState<FlashDeal[]>(createFlashDeals);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setDeals(prevDeals => 
        prevDeals.map(deal => ({
          ...deal,
          timeLeft: Math.max(0, deal.timeLeft - 1)
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const handlePurchase = (deal: FlashDeal) => {
    addItem(deal.product);
  };

  return (
    <section className={`py-6 backdrop-blur-sm border-t ${
      darkMode 
        ? 'bg-neural-navy/60 border-gray-600/30' 
        : 'bg-gray-100/90 border-gray-300/50'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header - Clean and professional */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-energy-cyan to-energy-purple rounded-lg flex items-center justify-center shadow-lg animate-cosmic-glow">
              <Tag className="w-5 h-5 text-cosmic-white" />
            </div>
            <h2 className="text-3xl font-bold bg-inviting-gradient bg-clip-text text-transparent text-shadow-glow-sharp antialiased backface-hidden">
              Limited Time Offers
            </h2>
          </div>
          <p className={`max-w-2xl mx-auto ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Special pricing on premium AI solutions. Professional-grade tools at exclusive rates.
          </p>
        </div>

        {/* Flash Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {deals.map((deal, index) => (
            <motion.div
              key={deal.product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border hover:border-energy-cyan hover:shadow-lg transition-all group backdrop-blur-sm ${
                darkMode 
                  ? 'bg-neural-navy/70 border-gray-600/30' 
                  : 'bg-neural-navy/70 border-gray-600/30'
              }`}
            >
              {/* Cosmic Discount Badge */}
              <div className="relative">
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-gradient-to-r from-energy-cyan to-energy-purple text-cosmic-white px-3 py-1 rounded-lg text-sm font-semibold shadow-sm animate-cosmic-glow">
                    {deal.discount}% off
                  </div>
                </div>
                
                {/* Product Image */}
                <div className="relative rounded-t-xl overflow-hidden">
                  <OptimizedImage
                    productId={deal.product.id.toString()}
                    alt={deal.product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 space-y-4">
                <h3 className={`font-semibold text-lg leading-tight ${
                  darkMode ? 'text-cosmic-white' : 'text-cosmic-white'
                }`}>
                  {deal.product.name}
                </h3>

                {/* Cosmic Price */}
                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-energy-cyan to-node-teal bg-clip-text text-transparent">
                    ${deal.salePrice}
                  </span>
                  <span className={`line-through ${
                    darkMode ? 'text-gray-400' : 'text-gray-400'
                  }`}>
                    ${Math.round(deal.originalPrice)}
                  </span>
                  <span className="bg-gradient-to-r from-node-teal/20 to-energy-cyan/20 text-node-teal px-2 py-1 rounded text-sm font-medium border border-node-teal/30">
                    Save {deal.discount}%
                  </span>
                </div>

                {/* Cosmic Timer */}
                <div className={`rounded-lg p-3 border backdrop-blur-sm ${
                  darkMode 
                    ? 'bg-neural-navy/80 border-gray-600/30' 
                    : 'bg-neural-navy/80 border-gray-600/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center space-x-2 text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-300'
                    }`}>
                      <Clock className="w-4 h-4 text-energy-cyan" />
                      <span>Offer expires in:</span>
                    </div>
                    <div className="font-mono font-semibold bg-gradient-to-r from-energy-cyan to-energy-purple bg-clip-text text-transparent">
                      {formatTime(deal.timeLeft)}
                    </div>
                  </div>
                </div>

                {/* Cosmic CTA Button */}
                <motion.button
                  onClick={() => handlePurchase(deal)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-energy-cyan to-energy-purple hover:from-energy-cyan/80 hover:to-energy-purple/80 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 shadow-sm hover:shadow-md animate-cosmic-glow"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
});

FlashDeals.displayName = 'FlashDeals';

export default FlashDeals;