'use client';

/**
 * Model Upload Page - Developer model submission interface
 * Comprehensive form for uploading AI models to marketplace
 * Includes success handling and navigation
 */

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import ModelUploadForm from '../../forms/ModelUploadForm'
import { ArrowLeft, Upload, Sparkles } from 'lucide-react'

const ModelUploadPage: React.FC = () => {
  const router = useRouter()
  const { isDeveloper } = useAuth()

  const handleUploadSuccess = (modelId: string) => {
    // Navigate to model detail or dashboard after successful upload
    router.push('/dashboard?message=Model submitted successfully! It will be reviewed within 24-48 hours.')
  }

  const handleCancel = () => {
    router.back() // Go back to previous page
  }

  if (!isDeveloper) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Developer Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be a verified developer to upload AI models to the marketplace.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/developer/onboarding')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Apply to Become a Developer
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Upload AI Model
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Share your innovation with the marketplace community
                  </p>
                </div>
              </div>
            </div>

            {/* Help Link */}
            <button
              onClick={() => window.open('/docs/upload-guide', '_blank')}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Need help? View upload guide →
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Model Review Process
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>• Your model will be reviewed within 24-48 hours</p>
                <p>• We check for quality, security, and compliance</p>
                <p>• You'll receive an email notification once approved</p>
                <p>• Rejected models include feedback for improvement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <ModelUploadForm
          onSuccess={handleUploadSuccess}
          onCancel={handleCancel}
        />

        {/* Additional Resources */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Best Practices
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>• Provide clear, detailed descriptions</li>
              <li>• Include comprehensive demo examples</li>
              <li>• Test your API endpoints thoroughly</li>
              <li>• Use accurate performance metrics</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Pricing Guidelines
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>• Research competitive pricing</li>
              <li>• Consider your target audience</li>
              <li>• Free models gain more visibility</li>
              <li>• Premium models need clear value</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Documentation Tips
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>• Link to comprehensive docs</li>
              <li>• Include code examples</li>
              <li>• Provide troubleshooting guides</li>
              <li>• Keep documentation updated</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelUploadPage