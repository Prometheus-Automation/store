import { createClient } from '@supabase/supabase-js';
import { initializeSupabase } from '../utils/errorUtils';

/**
 * Supabase Integration - Dynamic content and real-time updates
 * Enables live activity feeds, user-generated content, community features
 * Foundation for Amazon-scale dynamic marketplace
 */

// Safe Supabase initialization with fallbacks
const supabaseConfig = initializeSupabase();

export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Database types for type safety
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  action_type: 'purchase' | 'view' | 'like' | 'review' | 'signup';
  product_id?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

// Product queries with real-time subscriptions
export const useProducts = () => {
  return {
    // Fetch products with pagination
    async getProducts(page = 0, limit = 20) {
      try {
        const { data, error, count } = await supabase
          .from('products')
          .select('*', { count: 'exact' })
          .range(page * limit, (page + 1) * limit - 1)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return { products: data || [], total: count || 0 };
      } catch (error) {
        console.warn('Supabase products query failed, using fallback:', error);
        // Return local fallback data
        return { products: [], total: 0 };
      }
    },

    // Subscribe to real-time product updates
    subscribeToProducts(callback: (payload: any) => void) {
      if (!supabaseConfig.isConfigured) {
        console.warn('Supabase not configured, skipping real-time subscription');
        return { unsubscribe: () => {} };
      }

      const subscription = supabase
        .channel('products')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'products' },
          callback
        )
        .subscribe();

      return {
        unsubscribe: () => subscription.unsubscribe()
      };
    }
  };
};

// Activity feed for social proof
export const useActivity = () => {
  return {
    // Fetch recent activities
    async getActivities(limit = 20) {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select(`
            *,
            profiles:user_id (full_name, avatar_url),
            products:product_id (name)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.warn('Supabase activities query failed:', error);
        return [];
      }
    },

    // Create new activity
    async createActivity(activity: Partial<Activity>) {
      try {
        const { data, error } = await supabase
          .from('activities')
          .insert([activity])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.warn('Failed to create activity:', error);
        return null;
      }
    },

    // Subscribe to real-time activities
    subscribeToActivities(callback: (payload: any) => void) {
      if (!supabaseConfig.isConfigured) {
        return { unsubscribe: () => {} };
      }

      const subscription = supabase
        .channel('activities')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'activities' },
          callback
        )
        .subscribe();

      return {
        unsubscribe: () => subscription.unsubscribe()
      };
    }
  };
};

// User management
export const useAuth = () => {
  return {
    // Get current user
    getCurrentUser() {
      return supabase.auth.getUser();
    },

    // Sign up
    async signUp(email: string, password: string, metadata?: Record<string, any>) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata
          }
        });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Sign up failed:', error);
        throw error;
      }
    },

    // Sign in
    async signIn(email: string, password: string) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Sign in failed:', error);
        throw error;
      }
    },

    // Sign out
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    // Listen to auth changes
    onAuthStateChange(callback: (event: string, session: any) => void) {
      return supabase.auth.onAuthStateChange(callback);
    }
  };
};

// Analytics for engagement tracking
export const useAnalytics = () => {
  return {
    // Track page view
    async trackPageView(page: string, user_id?: string) {
      if (!supabaseConfig.isConfigured) return;

      try {
        await supabase
          .from('page_views')
          .insert([{
            page,
            user_id,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            referrer: document.referrer
          }]);
      } catch (error) {
        console.warn('Failed to track page view:', error);
      }
    },

    // Track user interaction
    async trackInteraction(event: string, properties: Record<string, any> = {}) {
      if (!supabaseConfig.isConfigured) return;

      try {
        await supabase
          .from('user_interactions')
          .insert([{
            event,
            properties,
            timestamp: new Date().toISOString()
          }]);
      } catch (error) {
        console.warn('Failed to track interaction:', error);
      }
    }
  };
};

// Health check for Supabase connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.warn('Supabase connection check failed:', error);
    return false;
  }
};

export default supabase;