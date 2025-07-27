/**
 * Database Types - AI Marketplace Schema
 * Comprehensive type definitions for Supabase integration
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          is_developer: boolean
          trust_score: number
          stripe_customer_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          is_developer?: boolean
          trust_score?: number
          stripe_customer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          is_developer?: boolean
          trust_score?: number
          stripe_customer_id?: string | null
          created_at?: string
        }
      }
      ai_models: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category: string
          subcategory: string | null
          price: number
          pricing_model: string
          developer_id: string
          model_type: string | null
          framework: string | null
          api_endpoint: string | null
          documentation_url: string | null
          github_url: string | null
          accuracy: number | null
          latency_ms: number | null
          requests_per_second: number | null
          model_size_mb: number | null
          status: string
          is_featured: boolean
          total_calls: number
          total_revenue: number
          average_rating: number
          review_count: number
          tags: string[] | null
          demo_input_example: any | null
          demo_output_example: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          category: string
          subcategory?: string | null
          price: number
          pricing_model?: string
          developer_id: string
          model_type?: string | null
          framework?: string | null
          api_endpoint?: string | null
          documentation_url?: string | null
          github_url?: string | null
          accuracy?: number | null
          latency_ms?: number | null
          requests_per_second?: number | null
          model_size_mb?: number | null
          status?: string
          is_featured?: boolean
          total_calls?: number
          total_revenue?: number
          average_rating?: number
          review_count?: number
          tags?: string[] | null
          demo_input_example?: any | null
          demo_output_example?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          category?: string
          subcategory?: string | null
          price?: number
          pricing_model?: string
          developer_id?: string
          model_type?: string | null
          framework?: string | null
          api_endpoint?: string | null
          documentation_url?: string | null
          github_url?: string | null
          accuracy?: number | null
          latency_ms?: number | null
          requests_per_second?: number | null
          model_size_mb?: number | null
          status?: string
          is_featured?: boolean
          total_calls?: number
          total_revenue?: number
          average_rating?: number
          review_count?: number
          tags?: string[] | null
          demo_input_example?: any | null
          demo_output_example?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      model_versions: {
        Row: {
          id: string
          model_id: string
          version: string
          changelog: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          model_id: string
          version: string
          changelog?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          model_id?: string
          version?: string
          changelog?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          model_id: string
          user_id: string
          rating: number
          title: string | null
          comment: string | null
          is_verified_purchase: boolean
          helpful_count: number
          created_at: string
        }
        Insert: {
          id?: string
          model_id: string
          user_id: string
          rating: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          helpful_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          model_id?: string
          user_id?: string
          rating?: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          helpful_count?: number
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          model_id: string
          user_id: string
          amount: number
          currency: string
          stripe_payment_intent_id: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          model_id: string
          user_id: string
          amount: number
          currency?: string
          stripe_payment_intent_id?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          model_id?: string
          user_id?: string
          amount?: number
          currency?: string
          stripe_payment_intent_id?: string | null
          status?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row']
export type AIModel = Database['public']['Tables']['ai_models']['Row']
export type ModelVersion = Database['public']['Tables']['model_versions']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type AIModelInsert = Database['public']['Tables']['ai_models']['Insert']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type AIModelUpdate = Database['public']['Tables']['ai_models']['Update']

// Extended types with relations
export interface AIModelWithDeveloper extends AIModel {
  developer: Pick<User, 'id' | 'full_name' | 'avatar_url' | 'trust_score'>
}

export interface AIModelWithReviews extends AIModel {
  reviews: Array<Review & {
    user: Pick<User, 'full_name' | 'avatar_url'>
  }>
}

export interface AIModelDetailed extends AIModelWithDeveloper {
  reviews: Array<Review & {
    user: Pick<User, 'full_name' | 'avatar_url'>
  }>
  versions: ModelVersion[]
}

// API Response types
export interface APIResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Search and filter types
export interface ModelFilters {
  category?: string
  subcategory?: string
  pricing_model?: string
  min_price?: number
  max_price?: number
  min_rating?: number
  framework?: string
  tags?: string[]
  developer_id?: string
}

export interface SearchParams {
  query?: string
  filters?: ModelFilters
  sort_by?: 'created_at' | 'price' | 'average_rating' | 'total_calls'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Analytics types
export interface ModelAnalytics {
  total_calls: number
  total_revenue: number
  average_rating: number
  review_count: number
  calls_last_30_days: number
  revenue_last_30_days: number
  unique_users: number
}

export interface DeveloperAnalytics {
  total_models: number
  total_revenue: number
  total_calls: number
  average_model_rating: number
  models: Array<{
    id: string
    name: string
    calls: number
    revenue: number
    rating: number
  }>
}