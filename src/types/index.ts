export interface Product {
  id: number | string;
  name: string;
  tagline: string;
  provider: string;
  category: 'Language Model' | 'Customer Service' | 'Sales' | 'Marketing' | 'Data' | 'Workflow' | 'Integration';
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  badge?: string;
  badgeColor?: string;
  rating: number;
  reviews: number;
  features: string[];
  stats: Record<string, string>;
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
  rocketAnimations: RocketAnimation[];
  showCheckout: boolean;
  setShowCheckout: (show: boolean) => void;
}

export interface RocketAnimation {
  id: number;
  product: Product;
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

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_APP_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}