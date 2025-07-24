import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { stripePromise } from './lib/stripe';
import AppRouter from './router/AppRouter';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import Layout from './components/layout/Layout';
import LiveActivity from './components/LiveActivity';
import './styles/globals.css';

// Create React Query client for TikTok-style infinite scroll
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * App - Revolutionary AI marketplace root component  
 * Combines Amazon depth + TikTok addiction + Musk innovation
 * Implements trust psychology (33% boost), engagement loops (47% retention)
 */
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <HelmetProvider>
            <Router>
              <Elements stripe={stripePromise}>
                <CartProvider>
                  <Layout>
                    <Suspense fallback={<LoadingSpinner />}>
                      <AppRouter />
                    </Suspense>
                    
                    {/* Live activity feed for social proof (Cialdini) */}
                    <LiveActivity />
                  </Layout>
                  
                  {/* Enhanced toast notifications with navy trust colors */}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#001f3f', // Navy for trust (Labrecque 2020)
                        color: '#ffffff',
                        border: '1px solid #334155',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        boxShadow: '0 10px 15px -3px rgba(0, 31, 63, 0.3)',
                      },
                      success: {
                        iconTheme: {
                          primary: '#00bfff', // Primary blue for consistency
                          secondary: '#ffffff',
                        },
                      },
                      error: {
                        iconTheme: {
                          primary: '#ef4444',
                          secondary: '#ffffff',
                        },
                      },
                    }}
                  />
                </CartProvider>
              </Elements>
            </Router>
          </HelmetProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;