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
    if (import.meta.env.PROD) {
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
            {/* Professional error icon - Navy for trust (psychological research) */}
            <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            {/* Navy text for credibility boost (Labrecque study) */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Technical Issue Detected
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              We're experiencing a temporary issue. Our system is designed to recover automatically.
            </p>

            {/* Show error details in development */}
            {import.meta.env.DEV && error && (
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
            <div className="flex flex-col space-y-3">
              <button
                onClick={this.handleRetry}
                disabled={retryCount >= 3}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {retryCount >= 3 ? 'Max Retries Reached' : `Retry${retryCount > 0 ? ` (${retryCount}/3)` : ''}`}
              </button>
              
              <button
                onClick={this.handleReload}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Reload Application
              </button>
            </div>

            {/* Environment status for debugging */}
            {import.meta.env.DEV && (
              <div className="mt-4 text-xs text-gray-500">
                Retry count: {retryCount} | Environment: {import.meta.env.MODE}
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