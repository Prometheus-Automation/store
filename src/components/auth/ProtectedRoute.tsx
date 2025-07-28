'use client';

/**
 * Protected Route Component - Route guard for authenticated users
 * Redirects unauthenticated users to sign in
 * Optional developer-only protection
 */

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireDeveloper?: boolean
  fallback?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireDeveloper = false,
  fallback = '/'
}) => {
  const { isAuthenticated, isDeveloper, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Redirect if not authenticated
      if (!isAuthenticated) {
        // Store the attempted location for redirect after sign in
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_return_to', window.location.pathname)
        }
        router.push('/auth/signin')
        return
      }

      // Redirect if developer access required but user is not a developer
      if (requireDeveloper && !isDeveloper) {
        router.push('/upgrade-to-developer')
        return
      }
    }
  }, [isAuthenticated, isDeveloper, loading, requireDeveloper, router])

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated or missing required permissions
  if (!isAuthenticated || (requireDeveloper && !isDeveloper)) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute