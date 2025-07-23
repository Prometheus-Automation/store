import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Pages
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import SellerDashboard from './pages/SellerDashboard';
import CommunityPage from './pages/CommunityPage';
import LearnPage from './pages/LearnPage';
import LiveShoppingPage from './pages/LiveShoppingPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';

// Layout
import Layout from './components/layout/Layout';

// Error Boundary
import ErrorBoundary from './components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Helmet>
        <title>Prometheus Automation - AI Marketplace for Everyone</title>
        <meta 
          name="description" 
          content="Discover and buy AI models, agents, and automations. From ChatGPT Plus to custom workflows - we make AI accessible for everyone. Starting at $8/month." 
        />
        <meta 
          name="keywords" 
          content="AI marketplace, ChatGPT Plus, Claude Pro, automation tools, n8n, Zapier, AI agents, no-code automation" 
        />
        <meta name="author" content="Prometheus Automation" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Prometheus Automation - AI Marketplace" />
        <meta property="og:description" content="AI Models, Agents & Automations for Everyone" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://prometheus-automation.com" />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Prometheus Automation" />
        <meta name="twitter:description" content="AI Models, Agents & Automations for Everyone" />
        <meta name="twitter:image" content="/twitter-image.jpg" />
        
        {/* PWA */}
        <meta name="theme-color" content="#00bfff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://js.stripe.com" />
        
        {/* JSON-LD structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Prometheus Automation",
            "description": "AI Marketplace for Everyone",
            "url": "https://prometheus-automation.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://prometheus-automation.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      <Layout>
        <Routes>
          {/* Main pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          
          {/* Commerce */}
          <Route path="/success" element={<CheckoutSuccessPage />} />
          
          {/* Seller & Community */}
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/live" element={<LiveShoppingPage />} />
          
          {/* Catch all - 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}

// Simple 404 component
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a 
          href="/" 
          className="btn-primary inline-flex items-center space-x-2"
        >
          <span>Go Home</span>
        </a>
      </div>
    </div>
  );
}