'use client';

/**
 * Auth Callback Page - OAuth redirect handler
 * Handles OAuth redirects from Google and GitHub
 * Provides loading state and error handling
 */

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { logError } from '../../../utils/errorUtils'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

const AuthCallback: React.FC = () => {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          logError(new Error(error.message), 'AuthCallback.handleAuthCallback')
          setStatus('error')
          setMessage('Authentication failed. Please try again.')
          
          // Redirect to home after 3 seconds
          setTimeout(() => {
            router.replace('/')
          }, 3000)
          return
        }

        if (session) {
          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          // Check if user was trying to access a protected route
          const returnTo = localStorage.getItem('auth_return_to')
          localStorage.removeItem('auth_return_to')
          
          // Redirect after success message
          setTimeout(() => {
            router.replace(returnTo || '/dashboard')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('No session found. Please try signing in again.')
          
          setTimeout(() => {
            router.replace('/')
          }, 3000)
        }
      } catch (error) {
        logError(error as Error, 'AuthCallback.handleAuthCallback')
        setStatus('error')
        setMessage('An unexpected error occurred.')
        
        setTimeout(() => {
          router.replace('/')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Completing Sign In
              </h2>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome!
              </h2>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sign In Failed
              </h2>
            </>
          )}
          
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>

        {status === 'error' && (
          <div className="mt-8">
            <button
              onClick={() => router.replace('/')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthCallback