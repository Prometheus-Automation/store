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

/**
 * FlashDeals - Premium limited-time offers section
 * Minimal design with subtle urgency and elegant typography
 * Navy/blue color scheme for trust and professionalism
 */
const FlashDeals = memo(() => {
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
    <section className="py-16 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header - Clean and professional */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-navy">
              Limited Time Offers
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
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
              className="bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all group"
            >
              {/* Discount Badge */}
              <div className="relative">
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-sm">
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
                <h3 className="font-semibold text-lg text-navy leading-tight">
                  {deal.product.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    ${deal.salePrice}
                  </span>
                  <span className="text-gray-500 line-through">
                    ${Math.round(deal.originalPrice)}
                  </span>
                  <span className="bg-gradient-to-r from-green-50 to-blue-50 text-green-700 px-2 py-1 rounded text-sm font-medium border border-green-200">
                    Save ${Math.round(deal.originalPrice - deal.salePrice)}
                  </span>
                </div>

                {/* Timer */}
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Offer expires in:</span>
                    </div>
                    <div className="font-mono font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {formatTime(deal.timeLeft)}
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <motion.button
                  onClick={() => handlePurchase(deal)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom message */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Limited quantities available. <span className="font-semibold text-navy">Professional pricing</span> for verified users.
          </p>
        </div>
      </div>
    </section>
  );
});

FlashDeals.displayName = 'FlashDeals';

export default FlashDeals;