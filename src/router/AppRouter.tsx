import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load heavy components for <2s loads
const HomePage = lazy(() => import('../pages/HomePage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
// Phase 2 stubs for TikTok addiction prep (Eyal 2014)
const DiscoverPage = lazy(() => import('../pages/DiscoverPage'));
const CommunityPage = lazy(() => import('../pages/CommunityPage'));

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        {/* Phase 2 stubs - Foundation for engagement */}
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;