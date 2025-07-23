import { loadStripe } from '@stripe/stripe-js';
import type { CartItem } from '@/types';

// This would be your publishable key from Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here';

export const stripePromise = loadStripe(stripePublishableKey);

// Mock checkout session creation (in production, this would call your backend)
export const createCheckoutSession = async (items: CartItem[]) => {
  try {
    // In production, this would be a call to your backend API
    // For demo purposes, we'll simulate the API call
    
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: items.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.product.name,
              description: item.product.tagline,
              images: [item.product.image],
            },
            unit_amount: Math.round(item.product.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/cart`,
        metadata: {
          items: JSON.stringify(items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity
          })))
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Mock session for demo purposes
    return {
      id: 'cs_mock_' + Math.random().toString(36).substr(2, 9),
      url: '/mock-checkout',
      total: items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    };
  }
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await stripePromise;
  
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  const { error } = await stripe.redirectToCheckout({
    sessionId,
  });

  if (error) {
    console.error('Stripe redirect error:', error);
    throw error;
  }
};

// Price formatting utility
export const formatPrice = (price: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
};

// Calculate totals
export const calculateCartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + tax;
  
  return {
    subtotal,
    tax,
    total,
    savings: items.reduce((sum, item) => {
      const originalPrice = item.product.originalPrice || item.product.price;
      return sum + ((originalPrice - item.product.price) * item.quantity);
    }, 0)
  };
};