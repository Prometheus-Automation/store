import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { CartProvider } from './contexts/CartContext';
import { stripePromise } from './lib/stripe';
import AppRouter from './router/AppRouter';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <Elements stripe={stripePromise}>
            <CartProvider>
              <Layout>
                <AppRouter />
              </Layout>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#363636',
                    color: '#fff',
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