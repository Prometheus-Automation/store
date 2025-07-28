import { Metadata } from 'next';
import CheckoutPage from '@/components/pages/CheckoutPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Checkout - Prometheus Automation',
  description: 'Complete your purchase of premium AI models and tools.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Checkout() {
  return (
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  );
}