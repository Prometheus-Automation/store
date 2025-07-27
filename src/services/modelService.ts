/**
 * AI Model Service - Core business logic for AI marketplace
 * Handles model CRUD operations, search, analytics, and validation
 */

import { supabase } from '../lib/supabase'
import type { 
  AIModel, 
  AIModelInsert, 
  AIModelUpdate, 
  AIModelWithDeveloper,
  AIModelDetailed,
  SearchParams,
  ModelFilters,
  PaginatedResponse,
  APIResponse,
  ModelAnalytics
} from '../types/database'

export class ModelService {
  /**
   * Get all approved models with pagination and filtering
   */
  static async getModels(params: SearchParams = {}): Promise<PaginatedResponse<AIModelWithDeveloper>> {
    try {
      const {
        query,
        filters = {},
        sort_by = 'created_at',
        sort_order = 'desc',
        page = 0,
        limit = 20
      } = params

      let queryBuilder = supabase
        .from('ai_models')
        .select(`
          *,
          developer:users!developer_id(
            id,
            full_name,
            avatar_url,
            trust_score
          )
        `, { count: 'exact' })
        .eq('status', 'approved')

      // Apply filters
      if (filters.category) {
        queryBuilder = queryBuilder.eq('category', filters.category)
      }
      
      if (filters.subcategory) {
        queryBuilder = queryBuilder.eq('subcategory', filters.subcategory)
      }
      
      if (filters.pricing_model) {
        queryBuilder = queryBuilder.eq('pricing_model', filters.pricing_model)
      }
      
      if (filters.min_price !== undefined) {
        queryBuilder = queryBuilder.gte('price', filters.min_price)
      }
      
      if (filters.max_price !== undefined) {
        queryBuilder = queryBuilder.lte('price', filters.max_price)
      }
      
      if (filters.min_rating !== undefined) {
        queryBuilder = queryBuilder.gte('average_rating', filters.min_rating)
      }
      
      if (filters.framework) {
        queryBuilder = queryBuilder.eq('framework', filters.framework)
      }
      
      if (filters.tags && filters.tags.length > 0) {
        queryBuilder = queryBuilder.contains('tags', filters.tags)
      }
      
      if (filters.developer_id) {
        queryBuilder = queryBuilder.eq('developer_id', filters.developer_id)
      }

      // Apply search query
      if (query) {
        queryBuilder = queryBuilder.or(`
          name.ilike.%${query}%,
          description.ilike.%${query}%,
          tags.cs.{${query}}
        `)
      }

      // Apply sorting and pagination
      queryBuilder = queryBuilder
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(page * limit, (page + 1) * limit - 1)

      const { data, error, count } = await queryBuilder

      if (error) throw error

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > (page + 1) * limit
      }
    } catch (error) {
      console.error('Error fetching models:', error)
      return {
        data: [],
        total: 0,
        page: 0,
        limit: 20,
        hasMore: false
      }
    }
  }

  /**
   * Get featured models for homepage
   */
  static async getFeaturedModels(limit = 8): Promise<AIModelWithDeveloper[]> {
    try {
      const { data, error } = await supabase
        .from('ai_models')
        .select(`
          *,
          developer:users!developer_id(
            id,
            full_name,
            avatar_url,
            trust_score
          )
        `)
        .eq('status', 'approved')
        .eq('is_featured', true)
        .order('average_rating', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching featured models:', error)
      return []
    }
  }

  /**
   * Get single model by slug with full details
   */
  static async getModelBySlug(slug: string): Promise<AIModelDetailed | null> {
    try {
      const { data, error } = await supabase
        .from('ai_models')
        .select(`
          *,
          developer:users!developer_id(
            id,
            full_name,
            avatar_url,
            trust_score
          ),
          reviews(
            id,
            rating,
            title,
            comment,
            is_verified_purchase,
            helpful_count,
            created_at,
            user:users!user_id(full_name, avatar_url)
          ),
          versions:model_versions(
            id,
            version,
            changelog,
            is_active,
            created_at
          )
        `)
        .eq('slug', slug)
        .eq('status', 'approved')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching model by slug:', error)
      return null
    }
  }

  /**
   * Create new AI model (for developers)
   */
  static async createModel(model: Omit<AIModelInsert, 'developer_id'>): Promise<APIResponse<AIModel>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { data: null, error: 'Not authenticated', success: false }
      }

      // Generate slug from name
      const slug = model.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Check if slug already exists
      const { data: existingModel } = await supabase
        .from('ai_models')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existingModel) {
        return { data: null, error: 'Model name already exists', success: false }
      }

      const { data, error } = await supabase
        .from('ai_models')
        .insert({
          ...model,
          slug,
          developer_id: user.id,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      return { data, error: null, success: true }
    } catch (error: any) {
      console.error('Error creating model:', error)
      return { data: null, error: error.message, success: false }
    }
  }

  /**
   * Update existing model (developers only)
   */
  static async updateModel(id: string, updates: AIModelUpdate): Promise<APIResponse<AIModel>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { data: null, error: 'Not authenticated', success: false }
      }

      // Verify ownership
      const { data: existingModel } = await supabase
        .from('ai_models')
        .select('developer_id')
        .eq('id', id)
        .single()

      if (!existingModel || existingModel.developer_id !== user.id) {
        return { data: null, error: 'Unauthorized', success: false }
      }

      const { data, error } = await supabase
        .from('ai_models')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null, success: true }
    } catch (error: any) {
      console.error('Error updating model:', error)
      return { data: null, error: error.message, success: false }
    }
  }

  /**
   * Delete model (developers only)
   */
  static async deleteModel(id: string): Promise<APIResponse<boolean>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { data: null, error: 'Not authenticated', success: false }
      }

      // Verify ownership
      const { data: existingModel } = await supabase
        .from('ai_models')
        .select('developer_id')
        .eq('id', id)
        .single()

      if (!existingModel || existingModel.developer_id !== user.id) {
        return { data: null, error: 'Unauthorized', success: false }
      }

      const { error } = await supabase
        .from('ai_models')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { data: true, error: null, success: true }
    } catch (error: any) {
      console.error('Error deleting model:', error)
      return { data: null, error: error.message, success: false }
    }
  }

  /**
   * Search models with advanced filtering
   */
  static async searchModels(query: string, filters: ModelFilters = {}): Promise<AIModelWithDeveloper[]> {
    try {
      return (await this.getModels({ query, filters, limit: 50 })).data
    } catch (error) {
      console.error('Error searching models:', error)
      return []
    }
  }

  /**
   * Get model analytics (for developers)
   */
  static async getModelAnalytics(modelId: string): Promise<ModelAnalytics | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Verify ownership
      const { data: model } = await supabase
        .from('ai_models')
        .select('developer_id, total_calls, total_revenue, average_rating, review_count')
        .eq('id', modelId)
        .single()

      if (!model || model.developer_id !== user.id) return null

      // Get additional analytics from transactions table
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('amount, user_id')
        .eq('model_id', modelId)
        .gte('created_at', thirtyDaysAgo.toISOString())

      const calls_last_30_days = recentTransactions?.length || 0
      const revenue_last_30_days = recentTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0
      const unique_users = new Set(recentTransactions?.map(t => t.user_id)).size

      return {
        total_calls: model.total_calls,
        total_revenue: model.total_revenue,
        average_rating: model.average_rating,
        review_count: model.review_count,
        calls_last_30_days,
        revenue_last_30_days,
        unique_users
      }
    } catch (error) {
      console.error('Error fetching model analytics:', error)
      return null
    }
  }

  /**
   * Get models by developer
   */
  static async getModelsByDeveloper(developerId: string): Promise<AIModel[]> {
    try {
      const { data, error } = await supabase
        .from('ai_models')
        .select('*')
        .eq('developer_id', developerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching developer models:', error)
      return []
    }
  }

  /**
   * Get categories with model counts
   */
  static async getCategories(): Promise<Array<{ category: string; count: number }>> {
    try {
      const { data, error } = await supabase
        .from('ai_models')
        .select('category')
        .eq('status', 'approved')

      if (error) throw error

      // Count categories
      const categoryCount = (data || []).reduce((acc: Record<string, number>, { category }) => {
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})

      return Object.entries(categoryCount).map(([category, count]) => ({ category, count }))
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  /**
   * Increment model call count (for usage tracking)
   */
  static async incrementCallCount(modelId: string): Promise<void> {
    try {
      await supabase.rpc('increment_model_calls', { model_id: modelId })
    } catch (error) {
      console.error('Error incrementing call count:', error)
    }
  }
}