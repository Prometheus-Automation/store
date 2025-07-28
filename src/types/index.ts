export interface Product {
  id: number | string;
  name: string;
  tagline: string;
  provider?: string;
  category: 'Language Model' | 'Customer Service' | 'Sales' | 'Marketing' | 'Data' | 'Workflow' | 'Integration' | 'tools' | 'agents' | 'automations';
  price: number;
  originalPrice?: number;
  unit?: string;
  image: string;
  badge?: string;
  badgeColor?: string;
  rating: number;
  reviews: number;
  features: string[];
  stats?: Record<string, string>;
  description?: string;
  videoUrl?: string;
  apiPricing?: {
    input: string;
    output: string;
  };
  externalLink?: string;
  source?: 'n8n' | 'Zapier' | 'Python' | 'OpenAI' | 'Anthropic' | 'xAI' | 'Make';
  useCase?: 'productivity' | 'marketing' | 'sales' | 'support' | 'data' | 'content';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  estimatedSetupTime?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'buyer' | 'seller' | 'admin';
  createdAt: Date;
  avatar?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface QuizAnswer {
  questionIndex: number;
  answerIndex: number;
  answer: string;
}

export interface FilterState {
  category: string;
  priceRange: [number, number];
  sources: string[];
  useCases: string[];
  rating: number;
  difficulty: string[];
  searchQuery: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripeSessionId?: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  verified: boolean;
}

export interface SellerProfile {
  id: string;
  userId: string;
  companyName: string;
  description: string;
  website?: string;
  verified: boolean;
  products: Product[];
  totalSales: number;
  rating: number;
}

export interface LiveStats {
  activeUsers: number;
  automationsRunning: number;
  timeSaved: number;
}

export interface CommunityPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: 'question' | 'showcase' | 'tutorial' | 'discussion';
  upvotes: number;
  replies: CommunityReply[];
  createdAt: Date;
}

export interface CommunityReply {
  id: string;
  postId: string;
  userId: string;
  content: string;
  upvotes: number;
  createdAt: Date;
}

// Additional interfaces for App.tsx
export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  showCheckout: boolean;
  setShowCheckout: (show: boolean) => void;
}


export interface CheckoutFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

// Component interfaces for App.tsx
export interface FacetedFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState | ((prev: FilterState) => FilterState)) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

// Next.js environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
      readonly NEXT_PUBLIC_APP_URL: string;
      readonly NEXT_PUBLIC_APP_NAME: string;
      readonly NEXT_PUBLIC_SUPABASE_URL: string;
      readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      readonly STRIPE_SECRET_KEY: string;
      readonly SUPABASE_SERVICE_ROLE_KEY: string;
    }
  }
}

export interface RocketAnimation {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
}