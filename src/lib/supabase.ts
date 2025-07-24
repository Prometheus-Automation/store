import { createClient } from '@supabase/supabase-js'
import type { Product, User, Order, Review, SellerProfile, CommunityPost } from '@/types'

// These would be environment variables in production
const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey) {
    console.error('Supabase configuration missing. Database functionality will be disabled.');
    return null;
  }
  
  return { url, anonKey };
};

const supabaseConfig = getSupabaseConfig();
export const supabase = supabaseConfig 
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null;

// Database schema (run these in Supabase SQL editor):
/*
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  provider TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL NOT NULL,
  original_price DECIMAL,
  unit TEXT NOT NULL DEFAULT '/month',
  image TEXT,
  badge TEXT,
  badge_color TEXT,
  rating DECIMAL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  video_url TEXT,
  api_pricing JSONB,
  external_link TEXT,
  source TEXT,
  use_case TEXT,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  seller_id UUID REFERENCES public.users(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Seller profiles table
CREATE TABLE public.seller_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  verified BOOLEAN DEFAULT false,
  total_sales INTEGER DEFAULT 0,
  rating DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community posts table
CREATE TABLE public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'discussion' CHECK (category IN ('question', 'showcase', 'tutorial', 'discussion')),
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community replies table
CREATE TABLE public.community_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (basic examples)
CREATE POLICY "Users can view all products" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_rating ON public.products(rating);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
*/

// Helper functions for database operations
export const dbHelpers = {
  // Products
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching products:', error)
      return []
    }
    
    return data || []
  },

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single()
    
    if (error) {
      console.error('Error fetching product:', error)
      return null
    }
    
    return data
  },

  async searchProducts(query: string, filters?: Partial<FilterState>): Promise<Product[]> {
    let queryBuilder = supabase
      .from('products')
      .select('*')
      .eq('active', true)
    
    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,tagline.ilike.%${query}%`)
    }
    
    if (filters?.category && filters.category !== 'all') {
      queryBuilder = queryBuilder.eq('category', filters.category)
    }
    
    if (filters?.priceRange) {
      queryBuilder = queryBuilder
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1])
    }
    
    if (filters?.sources && filters.sources.length > 0) {
      queryBuilder = queryBuilder.in('source', filters.sources)
    }
    
    if (filters?.rating && filters.rating > 0) {
      queryBuilder = queryBuilder.gte('rating', filters.rating)
    }
    
    const { data, error } = await queryBuilder.order('rating', { ascending: false })
    
    if (error) {
      console.error('Error searching products:', error)
      return []
    }
    
    return data || []
  },

  // Orders
  async createOrder(userId: string, items: CartItem[], total: number): Promise<string | null> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        items: JSON.stringify(items),
        total,
        status: 'pending'
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Error creating order:', error)
      return null
    }
    
    return data?.id || null
  },

  // Reviews
  async getProductReviews(productId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users:user_id (name, avatar)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching reviews:', error)
      return []
    }
    
    return data || []
  },

  // Authentication helpers
  async signUp(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || ''
        }
      }
    })
    
    return { data, error }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  }
}