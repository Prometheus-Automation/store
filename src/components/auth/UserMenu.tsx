'use client';

/**
 * User Menu Component - Authenticated user navigation
 * Displays user avatar, menu, and sign out option
 * Developer-specific navigation items
 */

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Package, 
  BarChart3,
  Star,
  Wallet
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserMenuProps {
  className?: string
}

const UserMenu: React.FC<UserMenuProps> = ({ className = '' }) => {
  const { user, isDeveloper, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      router.push('/')
      setIsOpen(false)
    } catch (error: any) {
      toast.error('Failed to sign out')
    }
  }

  if (!user) return null

  const userInitials = user.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'

  const menuItems = [
    {
      label: 'Profile',
      icon: User,
      href: '/profile',
      show: true
    },
    {
      label: 'My Models',
      icon: Package,
      href: '/developer/models',
      show: isDeveloper
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      href: '/developer/analytics',
      show: isDeveloper
    },
    {
      label: 'Earnings',
      icon: Wallet,
      href: '/developer/earnings',
      show: isDeveloper
    },
    {
      label: 'Reviews',
      icon: Star,
      href: '/reviews',
      show: true
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      show: true
    }
  ]

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="User avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            userInitials
          )}
        </div>

        {/* User Name & Arrow */}
        <div className="hidden md:flex items-center gap-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
            {isDeveloper && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                Developer
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems
              .filter(item => item.show)
              .map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu