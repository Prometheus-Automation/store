import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../src/styles/globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Prometheus Automation - AI Marketplace for Everyone',
    template: '%s | Prometheus Automation'
  },
  description: 'Discover and buy AI models, agents, and automations. From ChatGPT to custom workflows - we make AI accessible for everyone.',
  keywords: ['AI', 'automation', 'ChatGPT', 'Claude', 'artificial intelligence', 'workflows', 'no-code'],
  authors: [{ name: 'Prometheus Automation' }],
  creator: 'Prometheus Automation',
  publisher: 'Prometheus Automation',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://store.prometheusautomation.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Prometheus Automation - AI Marketplace',
    description: 'AI Models, Agents & Automations for Everyone',
    url: 'https://store.prometheusautomation.com',
    siteName: 'Prometheus Automation',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prometheus Automation - AI Marketplace',
    description: 'AI Models, Agents & Automations for Everyone',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* PWA Meta tags */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#00bfff" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}