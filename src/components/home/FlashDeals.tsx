import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, ShoppingCart, Flame, TrendingUp } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { allProducts } from '../../data/products';
import OptimizedImage from '../common/OptimizedImage';
import type { Product } from '../../types';

interface FlashDeal {
  product: Product;
  originalPrice: number;
  salePrice: number;
  discount: number;
  stock: number;
  sold: number;
  timeLeft: number; // in seconds
}

/**
 * FlashDeals - Urgency and scarcity for conversion boost
 * Implements variable ratio reinforcement (Skinner Box principles)  
 * Countdown timers create FOMO (Fear of Missing Out psychology)
 */
const FlashDeals = memo(() => {
  const { addItem } = useCart();
  
  // Create flash deals from products
  const createFlashDeals = (): FlashDeal[] => {
    const selectedProducts = allProducts.slice(0, 3);
    return selectedProducts.map(product => ({
      product,
      originalPrice: product.originalPrice || product.price * 1.4,
      salePrice: product.price,
      discount: Math.floor(((product.originalPrice || product.price * 1.4) - product.price) / (product.originalPrice || product.price * 1.4) * 100),
      stock: Math.floor(Math.random() * 50) + 20,
      sold: Math.floor(Math.random() * 40) + 10,
      timeLeft: 3600 + Math.floor(Math.random() * 7200) // 1-3 hours
    }));
  };

  const [deals, setDeals] = useState<FlashDeal[]>(createFlashDeals);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(3600); // 1 hour

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setGlobalTimeLeft(prev => {
        if (prev <= 0) {
          // Reset deals when timer expires
          setDeals(createFlashDeals());
          return 3600 + Math.floor(Math.random() * 3600); // 1-2 hours
        }
        return prev - 1;
      });

      // Update individual deal timers
      setDeals(prevDeals => 
        prevDeals.map(deal => ({
          ...deal,
          timeLeft: Math.max(0, deal.timeLeft - 1),
          sold: deal.sold + (Math.random() < 0.02 ? 1 : 0) // Occasional sale
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0')
    };
  };

  const globalTime = formatTime(globalTimeLeft);

  const handlePurchase = (deal: FlashDeal) => {
    addItem(deal.product);
    
    // Update stock
    setDeals(prevDeals =>
      prevDeals.map(d =>
        d.product.id === deal.product.id
          ? { ...d, stock: Math.max(0, d.stock - 1), sold: d.sold + 1 }
          : d
      )
    );
  };

  return (
    <section className="py-12 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-yellow-300 rounded-full animate-bounce" />
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-orange-300 rounded-full animate-ping" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header with Global Timer */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <Zap className="w-8 h-8 text-yellow-300" />
            </motion.div>
            <h2 className="text-4xl font-black">
              ⚡ FLASH DEALS
            </h2>
          </div>

          {/* Global Countdown */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 inline-block border border-white/20">
            <p className="text-lg font-semibold mb-3">⏰ All deals end in:</p>
            <div className="flex items-center justify-center space-x-4 text-3xl font-black font-mono">
              <div className="bg-white text-red-500 px-4 py-2 rounded-lg min-w-[80px]">
                {globalTime.hours}
              </div>
              <span className="text-white animate-pulse">:</span>
              <div className="bg-white text-red-500 px-4 py-2 rounded-lg min-w-[80px]">
                {globalTime.minutes}
              </div>
              <span className="text-white animate-pulse">:</span>
              <div className="bg-white text-red-500 px-4 py-2 rounded-lg min-w-[80px]">
                {globalTime.seconds}
              </div>
            </div>
            <div className="flex items-center justify-center space-x-8 mt-3 text-sm opacity-90">
              <span>HOURS</span>
              <span>MINUTES</span>
              <span>SECONDS</span>
            </div>
          </div>
        </div>

        {/* Flash Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatePresence>
            {deals.map((deal, index) => {
              const progressPercentage = (deal.sold / (deal.stock + deal.sold)) * 100;
              
              return (
                <motion.div
                  key={deal.product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 text-gray-900 shadow-2xl relative overflow-hidden group hover:scale-105 transition-transform"
                >
                  {/* Deal Badge */}
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-full font-black text-sm shadow-lg flex items-center space-x-1">
                      <Flame className="w-4 h-4" />
                      <span>-{deal.discount}%</span>
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="relative mb-4 rounded-xl overflow-hidden">
                    <OptimizedImage
                      productId={deal.product.id.toString()}
                      alt={deal.product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2">
                      {deal.product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline space-x-3">
                      <span className="text-3xl font-black text-red-500">
                        ${deal.salePrice}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ${Math.round(deal.originalPrice)}
                      </span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-bold">
                        Save ${Math.round(deal.originalPrice - deal.salePrice)}
                      </span>
                    </div>

                    {/* Stock Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-orange-500" />
                          <span className="font-semibold">{deal.sold} sold</span>
                        </span>
                        <span className="text-gray-600">{deal.stock} left</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full relative"
                        >
                          <div className="absolute inset-0 bg-white/30 animate-pulse" />
                        </motion.div>
                      </div>
                      
                      {progressPercentage > 70 && (
                        <p className="text-red-600 font-bold text-sm animate-pulse">
                          🔥 Almost sold out!
                        </p>
                      )}
                    </div>

                    {/* Individual Timer */}
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center space-x-1 text-xs text-gray-600 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>Deal expires in:</span>
                      </div>
                      <div className="font-mono font-bold text-red-500">
                        {formatTime(deal.timeLeft).hours}:{formatTime(deal.timeLeft).minutes}:{formatTime(deal.timeLeft).seconds}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      onClick={() => handlePurchase(deal)}
                      disabled={deal.stock <= 0}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center space-x-2 ${
                        deal.stock <= 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white hover:shadow-xl'
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>
                        {deal.stock <= 0 ? 'SOLD OUT' : 'GRAB THIS DEAL'}
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-xl font-semibold mb-2">
            🚨 Limited Time Only - Don't Miss Out!
          </p>
          <p className="text-white/80">
            These deals reset every few hours. Next batch in {globalTime.hours}h {globalTime.minutes}m
          </p>
        </div>
      </div>
    </section>
  );
});

FlashDeals.displayName = 'FlashDeals';

export default FlashDeals;