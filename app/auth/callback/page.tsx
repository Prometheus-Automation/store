import { Metadata } from 'next';
import AuthCallback from '@/components/pages/auth/AuthCallback';

export const metadata: Metadata = {
  title: 'Authentication - Prometheus Automation',
  description: 'Completing authentication...',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthCallbackPage() {
  return <AuthCallback />;
}