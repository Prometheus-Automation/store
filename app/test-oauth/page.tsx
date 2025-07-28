import { Metadata } from 'next';
import TestOAuthPage from '@/components/pages/TestOAuthPage';

export const metadata: Metadata = {
  title: 'OAuth Test - Prometheus Automation',
  description: 'OAuth authentication testing interface for development.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OAuthTestPage() {
  return <TestOAuthPage />;
}