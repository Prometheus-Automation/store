'use client';

/**
 * Authentication Context - OAuth integration for AI Marketplace
 * Supports Google and GitHub OAuth providers via Supabase
 * Provides user state management and authentication methods
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { logError } from '../utils/errorUtils'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  isDeveloper: boolean
}

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeveloper, setIsDeveloper] = useState(false)

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          logError(new Error(error.message), 'AuthContext.initializeAuth')
        }

        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          
          if (initialSession?.user) {
            await updateUserProfile(initialSession.user)
          }
          
          setLoading(false)
        }
      } catch (error) {
        logError(error as Error, 'AuthContext.initializeAuth')
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email)
        
        if (mounted) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
          
          if (currentSession?.user && event === 'SIGNED_IN') {
            await updateUserProfile(currentSession.user)
          }
          
          if (event === 'SIGNED_OUT') {
            setIsDeveloper(false)
          }
          
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Update user profile and developer status
  const updateUserProfile = async (user: User) => {
    try {
      // Check if user exists in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // User doesn't exist, create profile
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            is_developer: false,
            trust_score: 100
          })

        if (insertError) {
          logError(new Error(insertError.message), 'AuthContext.createUserProfile')
        } else {
          setIsDeveloper(false)
        }
      } else if (profile) {
        setIsDeveloper(profile.is_developer)
      }
    } catch (error) {
      logError(error as Error, 'AuthContext.updateUserProfile')
    }
  }

  // Google OAuth sign in
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (error) {
        logError(new Error(error.message), 'AuthContext.signInWithGoogle')
        throw error
      }
    } catch (error) {
      logError(error as Error, 'AuthContext.signInWithGoogle')
      throw error
    }
  }

  // GitHub OAuth sign in
  const signInWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'user:email'
        }
      })

      if (error) {
        logError(new Error(error.message), 'AuthContext.signInWithGitHub')
        throw error
      }
    } catch (error) {
      logError(error as Error, 'AuthContext.signInWithGitHub')
      throw error
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        logError(new Error(error.message), 'AuthContext.signOut')
        throw error
      }
      
      // Clear local state
      setUser(null)
      setSession(null)
      setIsDeveloper(false)
    } catch (error) {
      logError(error as Error, 'AuthContext.signOut')
      throw error
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    try {
      const { data: { user: refreshedUser }, error } = await supabase.auth.getUser()
      
      if (error) {
        logError(new Error(error.message), 'AuthContext.refreshUser')
        throw error
      }
      
      if (refreshedUser) {
        setUser(refreshedUser)
        await updateUserProfile(refreshedUser)
      }
    } catch (error) {
      logError(error as Error, 'AuthContext.refreshUser')
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isDeveloper,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider