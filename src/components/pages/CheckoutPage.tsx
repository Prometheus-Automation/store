'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, CreditCard } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import CheckoutForm from '../CheckoutForm';
import SEO from '../SEO';

const CheckoutPage = () => {
  const { items, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-blue-200 mb-6">Add some products to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      <SEO 
        title="Checkout"
        description="Complete your purchase of AI models, agents, and automations"
      />
      
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-3 mb-8">
            <CreditCard className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Order Summary */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Order Summary</h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.product.name}</h3>
                        <p className="text-blue-200 text-sm">{item.product.tagline}</p>
                        <p className="text-blue-200 text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-white/20 mt-6 pt-6">
                  <div className="flex justify-between items-center text-lg font-semibold text-white">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Payment Details</h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <CheckoutForm 
                  onSuccess={() => console.log('Checkout successful')}
                  onCancel={() => console.log('Checkout cancelled')}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;