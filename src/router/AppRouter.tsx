import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Lazy load heavy components for <2s loads
const HomePage = lazy(() => import('../pages/HomePage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
// Phase 2 stubs for TikTok addiction prep (Eyal 2014)
const DiscoverPage = lazy(() => import('../pages/DiscoverPage'));
const CommunityPage = lazy(() => import('../pages/CommunityPage'));

// Auth pages
const SignIn = lazy(() => import('../pages/auth/SignIn'));
const AuthCallback = lazy(() => import('../pages/auth/AuthCallback'));

// AI Marketplace pages
const ModelUploadPage = lazy(() => import('../pages/developer/ModelUploadPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));

// Test pages (remove in production)
const TestOAuthPage = lazy(() => import('../pages/TestOAuthPage'));

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected routes */}
        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        {/* Developer routes */}
        <Route path="/developer/upload" element={
          <ProtectedRoute requireDeveloper>
            <ModelUploadPage />
          </ProtectedRoute>
        } />
        
        {/* Phase 2 stubs - Foundation for engagement */}
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/community" element={<CommunityPage />} />
        
        {/* Test routes (remove in production) */}
        <Route path="/test-oauth" element={<TestOAuthPage />} />
        
        {/* Fallback */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;