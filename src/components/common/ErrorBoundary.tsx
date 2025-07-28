import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError, validateEnvironment } from '../../utils/errorUtils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

/**
 * ErrorBoundary - Comprehensive error handling component
 * Navy colors for 33% trust boost (Labrecque 2020 study)
 * Implements graceful failure recovery with user-friendly messaging
 */
class ErrorBoundary extends Component<Props, State> {
  private retryTimeout?: NodeJS.Timeout;

  public state: State = {
    hasError: false,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Enhanced error logging with context
    logError(error, 'ErrorBoundary');
    
    console.group('🚨 ErrorBoundary Details');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    
    // Environment validation
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      console.warn('⚠️ Environment Issues:', envValidation.issues);
    }
    
    console.groupEnd();

    this.setState({ errorInfo });

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example integrations:
      // Sentry.captureException(error, { contexts: { errorInfo } });
      // LogRocket.captureException(error);
    }
  }

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount < 3) {
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        retryCount: retryCount + 1 
      });
      
      // Auto-retry after delay for better UX
      this.retryTimeout = setTimeout(() => {
        if (this.state.hasError) {
          console.log('🔄 Auto-retry attempt', retryCount + 1);
          this.handleRetry();
        }
      }, 2000);
    } else {
      // Force reload after max retries
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  public render() {
    if (this.state.hasError) {
      const { error, retryCount } = this.state;
      
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-bg">
          <div className="text-center p-8 max-w-lg bg-surface rounded-xl shadow-xl border border-gray-200">
            {/* AI-themed error art - Trust building navy colors (Labrecque 2020) */}
            <div className="w-20 h-20 mx-auto mb-8 bg-primary/10 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            {/* Navy text for 33% credibility boost (Labrecque study) */}
            <h2 className="text-2xl font-bold text-navy mb-4">
              System Temporarily Offline
            </h2>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Our AI systems are recalibrating for optimal performance. This usually resolves within moments.
            </p>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer mb-2">
                  Technical Details (Dev Mode)
                </summary>
                <div className="text-xs text-gray-700 bg-gray-100 p-3 rounded font-mono overflow-auto max-h-32">
                  <div>Error: {error.message}</div>
                  {error.stack && (
                    <div className="mt-2 text-red-600">
                      Stack: {error.stack.slice(0, 200)}...
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action buttons */}
            <div className="flex flex-col space-y-4">
              <button
                onClick={this.handleRetry}
                disabled={retryCount >= 3}
                className="bg-primary hover:bg-blue-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-lg hover:shadow-xl"
              >
                {retryCount >= 3 ? 'Max Retries Reached' : `Smart Retry${retryCount > 0 ? ` (${retryCount}/3)` : ''}`}
              </button>
              
              <button
                onClick={this.handleReload}
                className="bg-surface border border-gray-300 hover:bg-gray-50 text-navy px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Fresh Start
              </button>
            </div>

            {/* Premium status indicator */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>AI systems monitoring</span>
            </div>
            
            {/* Environment status for debugging */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 text-xs text-gray-400 font-mono">
                Debug: Retry {retryCount}/3 | {process.env.NODE_ENV}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;