'use client';

/**
 * OAuth Test Component - Testing OAuth Configuration
 * Use this to verify Google and GitHub OAuth are working correctly
 * Remove from production builds
 */

import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'

interface TestResult {
  provider: string
  status: 'idle' | 'loading' | 'success' | 'error'
  message: string
  details?: any
}

export function OAuthTest() {
  const [googleResult, setGoogleResult] = useState<TestResult>({
    provider: 'google',
    status: 'idle',
    message: 'Not tested yet'
  })
  
  const [githubResult, setGitHubResult] = useState<TestResult>({
    provider: 'github',
    status: 'idle',
    message: 'Not tested yet'
  })

  const [configStatus, setConfigStatus] = useState<{
    supabaseUrl: boolean
    supabaseKey: boolean
    redirectUrl: string
  } | null>(null)

  // Check configuration
  const checkConfig = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const redirectUrl = `${window.location.origin}/auth/callback`

    setConfigStatus({
      supabaseUrl: !!url && url !== 'your-actual-url-from-secret-manager',
      supabaseKey: !!key && key !== 'your-actual-anon-key-from-secret-manager',
      redirectUrl
    })
  }

  const testGoogleLogin = async () => {
    setGoogleResult({ provider: 'google', status: 'loading', message: 'Initiating Google OAuth...' })
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        setGoogleResult({
          provider: 'google',
          status: 'error',
          message: `Google OAuth error: ${error.message}`,
          details: error
        })
        console.error('Google OAuth error:', error)
      } else {
        setGoogleResult({
          provider: 'google',
          status: 'success',
          message: 'Google OAuth initiated successfully! Check redirect...',
          details: data
        })
        console.log('Google OAuth initiated:', data)
      }
    } catch (err: any) {
      setGoogleResult({
        provider: 'google',
        status: 'error',
        message: `Unexpected error: ${err.message}`,
        details: err
      })
    }
  }

  const testGitHubLogin = async () => {
    setGitHubResult({ provider: 'github', status: 'loading', message: 'Initiating GitHub OAuth...' })
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'read:user user:email'
        }
      })
      
      if (error) {
        setGitHubResult({
          provider: 'github',
          status: 'error',
          message: `GitHub OAuth error: ${error.message}`,
          details: error
        })
        console.error('GitHub OAuth error:', error)
      } else {
        setGitHubResult({
          provider: 'github',
          status: 'success',
          message: 'GitHub OAuth initiated successfully! Check redirect...',
          details: data
        })
        console.log('GitHub OAuth initiated:', data)
      }
    } catch (err: any) {
      setGitHubResult({
        provider: 'github',
        status: 'error',
        message: `Unexpected error: ${err.message}`,
        details: err
      })
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  React.useEffect(() => {
    checkConfig()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-yellow-800 mb-2">⚠️ OAuth Test Component</h1>
        <p className="text-yellow-700">
          This component is for testing OAuth configuration only. Remove from production!
        </p>
      </div>

      {/* Configuration Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Configuration Status</h2>
        {configStatus && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {configStatus.supabaseUrl ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={configStatus.supabaseUrl ? 'text-green-700' : 'text-red-700'}>
                Supabase URL: {configStatus.supabaseUrl ? 'Configured' : 'Not configured (using placeholder)'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {configStatus.supabaseKey ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={configStatus.supabaseKey ? 'text-green-700' : 'text-red-700'}>
                Supabase Anon Key: {configStatus.supabaseKey ? 'Configured' : 'Not configured (using placeholder)'}
              </span>
            </div>
            
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <p className="text-sm text-gray-700">
                <strong>Redirect URL:</strong> {configStatus.redirectUrl}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Make sure this URL is added to your OAuth provider's authorized redirect URIs
              </p>
            </div>
          </div>
        )}
      </div>

      {/* OAuth Tests */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Google OAuth Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Google OAuth Test
          </h3>
          
          <button 
            onClick={testGoogleLogin}
            disabled={googleResult.status === 'loading'}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {googleResult.status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Google Login'
            )}
          </button>
          
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="flex items-start gap-2">
              {getStatusIcon(googleResult.status)}
              <div className="flex-1">
                <p className="text-sm font-medium">{googleResult.message}</p>
                {googleResult.details && (
                  <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(googleResult.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* GitHub OAuth Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <img src="https://github.com/favicon.ico" alt="GitHub" className="w-5 h-5" />
            GitHub OAuth Test
          </h3>
          
          <button 
            onClick={testGitHubLogin}
            disabled={githubResult.status === 'loading'}
            className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {githubResult.status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test GitHub Login'
            )}
          </button>
          
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="flex items-start gap-2">
              {getStatusIcon(githubResult.status)}
              <div className="flex-1">
                <p className="text-sm font-medium">{githubResult.message}</p>
                {githubResult.details && (
                  <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(githubResult.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Common Issues */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🔧 Common Issues & Solutions</h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-red-600">Error: redirect_uri_mismatch</h4>
            <p className="text-gray-700 mt-1">
              Ensure the redirect URI in your OAuth provider EXACTLY matches Supabase callback URL.
              Check for trailing slashes, http vs https.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-red-600">Error: invalid_client</h4>
            <p className="text-gray-700 mt-1">
              Double-check Client ID and Secret are copied correctly in Supabase dashboard.
              Ensure no extra spaces or line breaks.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-red-600">Error: Supabase URL not configured</h4>
            <p className="text-gray-700 mt-1">
              Run: <code className="bg-gray-200 px-2 py-1 rounded">npm run fetch-secrets</code> to get values from Google Secret Manager
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}