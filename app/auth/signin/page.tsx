import { Metadata } from 'next';
import SignIn from '@/components/pages/auth/SignIn';

export const metadata: Metadata = {
  title: 'Sign In - Prometheus Automation',
  description: 'Sign in to your Prometheus Automation account to access premium AI models and tools.',
  robots: {
    index: false, // Don't index auth pages
    follow: false,
  },
};

export default function SignInPage() {
  return <SignIn />;
}