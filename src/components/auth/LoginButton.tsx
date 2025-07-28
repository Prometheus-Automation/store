'use client';

/**
 * Login Button Component - OAuth authentication UI
 * Provides Google and GitHub sign-in options
 * Responsive design with loading states
 */

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Github, Chrome, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface LoginButtonProps {
  provider: 'google' | 'github'
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
}

const LoginButton: React.FC<LoginButtonProps> = ({
  provider,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = ''
}) => {
  const { signInWithGoogle, signInWithGitHub } = useAuth()
  const [loading, setLoading] = useState(false)

  const providerConfig = {
    google: {
      name: 'Google',
      icon: Chrome,
      action: signInWithGoogle,
      color: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    github: {
      name: 'GitHub',
      icon: Github,
      action: signInWithGitHub,
      color: 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-500'
    }
  }

  const config = providerConfig[provider]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const variantClasses = {
    primary: `text-white ${config.color}`,
    secondary: 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700'
  }

  const handleSignIn = async () => {
    if (loading) return

    setLoading(true)
    
    try {
      // Store current location for redirect after auth
      localStorage.setItem('auth_return_to', window.location.pathname)
      
      await config.action()
      
      toast.success(`Signing in with ${config.name}...`)
    } catch (error: any) {
      console.error(`${config.name} sign in error:`, error)
      toast.error(error.message || `Failed to sign in with ${config.name}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      
      <span>
        {loading 
          ? `Signing in...` 
          : `Continue with ${config.name}`
        }
      </span>
    </button>
  )
}

export default LoginButton