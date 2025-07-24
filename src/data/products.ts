import type { Product } from '../types';

export const allProducts: Product[] = [
  // AI Models
  {
    id: 'chatgpt-4',
    name: 'ChatGPT-4 API Access',
    tagline: 'OpenAI\'s most advanced language model',
    description: 'Access to GPT-4 for advanced natural language processing, reasoning, and content generation.',
    price: 29,
    originalPrice: 39,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    category: 'ai-models',
    rating: 4.9,
    reviews: 1247,
    tags: ['OpenAI', 'NLP', 'Content Generation', 'API'],
    features: ['Advanced reasoning', '32K context window', 'Multi-modal capabilities'],
    demoUrl: 'https://chat.openai.com',
    documentation: '/docs/chatgpt-4',
    compatibility: ['Python', 'JavaScript', 'REST API'],
    difficulty: 'beginner',
    estimatedSetupTime: '5 minutes'
  },
  {
    id: 'claude-3',
    name: 'Claude 3 Sonnet',
    tagline: 'Anthropic\'s powerful AI assistant',
    description: 'Claude 3 Sonnet offers exceptional performance for complex reasoning and analysis tasks.',
    price: 25,
    originalPrice: 35,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop',
    category: 'ai-models',
    rating: 4.8,
    reviews: 892,
    tags: ['Anthropic', 'Analysis', 'Reasoning', 'Safety'],
    features: ['200K context window', 'Enhanced safety', 'Code generation'],
    demoUrl: 'https://claude.ai',
    documentation: '/docs/claude-3',
    compatibility: ['Python', 'JavaScript', 'REST API'],
    difficulty: 'beginner',
    estimatedSetupTime: '5 minutes'
  },
  // Add more products...
];

// Helper functions
export const getProductById = (id: string): Product | undefined => {
  return allProducts.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return allProducts;
  return allProducts.filter(product => product.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return allProducts.filter(product => product.rating >= 4.8).slice(0, 6);
};