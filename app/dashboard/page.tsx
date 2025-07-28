import { Metadata } from 'next';
import DashboardPage from '@/components/pages/DashboardPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Dashboard - Prometheus Automation',
  description: 'Manage your AI models, view analytics, and access premium features.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}