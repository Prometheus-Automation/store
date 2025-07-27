/**
 * Dashboard Page - User dashboard for AI Marketplace
 * Displays user profile, recent activity, and quick actions
 * Different views for regular users vs developers
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  Package, 
  Upload, 
  BarChart3, 
  Star, 
  Wallet,
  ShoppingBag,
  Clock,
  TrendingUp,
  Settings,
  Plus
} from 'lucide-react'

const DashboardPage: React.FC = () => {
  const { user, isDeveloper } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please sign in to access your dashboard
          </p>
          <Link 
            to="/signin" 
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const quickActions = isDeveloper ? [
    {
      icon: Upload,
      title: 'Upload Model',
      description: 'Add a new AI model to the marketplace',
      href: '/developer/upload',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: Package,
      title: 'My Models',
      description: 'Manage your published models',
      href: '/developer/models',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'View performance metrics',
      href: '/developer/analytics',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      icon: Wallet,
      title: 'Earnings',
      description: 'Track your revenue',
      href: '/developer/earnings',
      color: 'bg-yellow-600 hover:bg-yellow-700'
    }
  ] : [
    {
      icon: ShoppingBag,
      title: 'Browse Models',
      description: 'Discover AI models',
      href: '/discover',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: Star,
      title: 'My Reviews',
      description: 'View your reviews',
      href: '/reviews',
      color: 'bg-yellow-600 hover:bg-yellow-700'
    },
    {
      icon: Clock,
      title: 'Purchase History',
      description: 'View past purchases',
      href: '/purchases',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: Plus,
      title: 'Become Developer',
      description: 'Start selling models',
      href: '/developer/onboarding',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {isDeveloper ? 'Developer Dashboard' : 'Your AI Marketplace Dashboard'}
              </p>
            </div>
            
            <Link
              to="/settings"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </div>

          {isDeveloper && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    Developer Status: Active
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You can upload and monetize AI models
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  to={action.href}
                  className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isDeveloper ? 'Total Models' : 'Models Purchased'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isDeveloper ? '0' : '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isDeveloper ? 'Total Revenue' : 'Total Spent'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  $0.00
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isDeveloper ? 'Avg Rating' : 'Reviews Given'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isDeveloper ? '-' : '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Recent Activity
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isDeveloper 
                  ? 'Upload your first model to get started!'
                  : 'Browse and purchase AI models to see activity here.'
                }
              </p>
              <Link
                to={isDeveloper ? '/developer/upload' : '/discover'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isDeveloper ? (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Model
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Browse Models
                  </>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage