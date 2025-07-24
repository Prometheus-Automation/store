/**
 * Error Utils - Safe initialization and error handling
 * Implements defensive programming to prevent crashes
 */

// Safe Stripe initialization with fallback
export const initializeStripe = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!key || key === 'your-stripe-key' || key.includes('demo')) {
    console.warn('⚠️ Stripe key not configured. Using test mode.');
    return null;
  }
  
  try {
    return key;
  } catch (error) {
    console.error('❌ Stripe initialization failed:', error);
    return null;
  }
};

// Safe Supabase initialization with mock fallback
export const initializeSupabase = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey || url.includes('your-project') || anonKey.includes('your-anon-key')) {
    console.warn('⚠️ Supabase not configured. Using mock client.');
    return {
      url: 'https://mock.supabase.co',
      anonKey: 'mock-anon-key',
      isConfigured: false
    };
  }
  
  return {
    url,
    anonKey,
    isConfigured: true
  };
};

// Safe image loading with fallback
export const getImageWithFallback = (src: string, fallback?: string): string => {
  if (!src) {
    return fallback || '/images/fallback.png';
  }
  
  // Handle external images that might fail
  if (src.includes('unsplash.com') || src.includes('placeholder.com')) {
    return fallback || '/images/fallback.png';
  }
  
  return src;
};

// Error logging utility
export const logError = (error: Error, context?: string) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
  };
  
  console.error('🚨 Application Error:', errorInfo);
  
  // In production, send to error tracking service
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    // Example: Send to Sentry, LogRocket, etc.
    // sentryLogger.captureException(error, { extra: errorInfo });
  }
};

// Network error handler
export const handleNetworkError = (error: any, resource: string) => {
  if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
    console.warn(`📡 Network issue loading ${resource}. Using fallback.`);
    return true;
  }
  return false;
};

// Environment validation
export const validateEnvironment = (): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check required environment variables
  const requiredEnvVars = [
    'VITE_APP_URL',
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  requiredEnvVars.forEach(envVar => {
    const value = import.meta.env[envVar];
    if (!value || value.includes('your-') || value.includes('demo')) {
      issues.push(`${envVar} not properly configured`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues
  };
};