'use client';

/**
 * Test OAuth Page - Temporary page for OAuth testing
 * Remove this from production deployment
 */

import React from 'react'
import { OAuthTest } from '../OAuthTest'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const TestOAuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <OAuthTest />
      </div>
    </div>
  )
}

export default TestOAuthPage