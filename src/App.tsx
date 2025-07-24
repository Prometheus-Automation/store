import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { CartProvider } from './contexts/CartContext';
import { stripePromise } from './lib/stripe';
import AppRouter from './router/AppRouter';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import Layout from './components/layout/Layout';

/**
 * App - Root application component
 * Implements error boundaries, lazy loading, and psychological design principles
 * Follows Amazon-level architecture patterns with Musk-style minimalism
 */
function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <Elements stripe={stripePromise}>
            <CartProvider>
              <Layout>
                <Suspense fallback={<LoadingSpinner />}>
                  <AppRouter />
                </Suspense>
              </Layout>
              
              {/* Toast notifications - Trust-building design */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1f2937', // Navy gray for trust
                    color: '#ffffff',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981', // Success green
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444', // Error red
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
            </CartProvider>
          </Elements>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;