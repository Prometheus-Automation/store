import { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';

export const metadata: Metadata = {
  title: 'AI Marketplace - Premium Models, Agents & Automations',
  description: 'Discover the largest marketplace for AI models, agents, and automations. From ChatGPT to custom workflows - find the perfect AI solution for your needs.',
  openGraph: {
    title: 'AI Marketplace - Premium Models, Agents & Automations',
    description: 'Discover the largest marketplace for AI models, agents, and automations.',
    type: 'website',
  },
};

export default function Home() {
  return <HomePage />;
}