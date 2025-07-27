/**
 * Protected Route Component - Route guard for authenticated users
 * Redirects unauthenticated users to sign in
 * Optional developer-only protection
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()

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

  // Redirect if not authenticated
  if (!isAuthenticated) {
    // Store the attempted location for redirect after sign in
    localStorage.setItem('auth_return_to', location.pathname)
    return <Navigate to={fallback} state={{ from: location }} replace />
  }

  // Redirect if developer access required but user is not a developer
  if (requireDeveloper && !isDeveloper) {
    return <Navigate to="/upgrade-to-developer" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute