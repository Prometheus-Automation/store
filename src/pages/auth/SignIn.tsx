/**
 * Sign In Page - OAuth authentication interface
 * Clean, modern design with Google and GitHub options
 * Responsive layout with dark mode support
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoginButton from '../../components/auth/LoginButton'
import { Navigate } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'

const SignIn: React.FC = () => {
  const { isAuthenticated, loading } = useAuth()

  // Redirect if already authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    const returnTo = localStorage.getItem('auth_return_to') || '/dashboard'
    localStorage.removeItem('auth_return_to')
    return <Navigate to={returnTo} replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to Home Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to access the AI Marketplace
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <div className="space-y-4">
            {/* Google Sign In */}
            <LoginButton
              provider="google"
              variant="secondary"
              fullWidth
              size="lg"
            />

            {/* GitHub Sign In */}
            <LoginButton
              provider="github"
              variant="secondary"
              fullWidth
              size="lg"
            />
          </div>

          {/* Terms and Privacy */}
          <div className="mt-6">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Developer Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Become a Developer
                </h3>
                <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                  Upload and monetize your AI models. Start earning from your innovations.
                </p>
                <Link
                  to="/developer/onboarding"
                  className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Learn more →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help?{' '}
            <Link to="/support" className="text-blue-600 hover:text-blue-500">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn