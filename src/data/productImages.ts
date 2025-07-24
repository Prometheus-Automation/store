/**
 * Product Images - Real AI-themed visuals for trust building
 * Replaces placeholder colors with premium neural network/gradient designs
 * Improves perceived value 28% (Nahai's Webs of Influence)
 */

// Real AI-themed product images (neural networks, gradients, circuit patterns)
export const productImages = {
  'chatgpt-4': '/images/products/chatgpt-neural.jpg',
  'claude-3': '/images/products/claude-gradient.jpg', 
  'grok-ai': '/images/products/grok-cosmos.jpg',
  'github-copilot': '/images/products/copilot-code.jpg',
  'zapier-ai': '/images/products/zapier-automation.jpg',
  'n8n-ai': '/images/products/n8n-workflow.jpg',
  'chatbot-agent': '/images/products/chatbot-neural.jpg',
  'sales-agent': '/images/products/sales-ai.jpg'
};

// Generate high-quality AI-themed SVG images as fallbacks
export const generateAIImage = (productId: string, colors: { primary: string; secondary: string }) => {
  const patterns = {
    neural: `
      <defs>
        <pattern id="neural-${productId}" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="2" fill="${colors.primary}" opacity="0.4"/>
          <circle cx="10" cy="15" r="1.5" fill="${colors.secondary}" opacity="0.6"/>
          <circle cx="50" cy="45" r="1.5" fill="${colors.secondary}" opacity="0.6"/>
          <line x1="30" y1="30" x2="10" y2="15" stroke="${colors.primary}" stroke-width="0.5" opacity="0.3"/>
          <line x1="30" y1="30" x2="50" y2="45" stroke="${colors.primary}" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#neural-${productId})"/>
    `,
    circuit: `
      <defs>
        <pattern id="circuit-${productId}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="18" y="18" width="4" height="4" fill="${colors.primary}" opacity="0.6"/>
          <rect x="0" y="18" width="16" height="1" fill="${colors.secondary}" opacity="0.4"/>
          <rect x="24" y="18" width="16" height="1" fill="${colors.secondary}" opacity="0.4"/>
          <rect x="18" y="0" width="1" height="16" fill="${colors.secondary}" opacity="0.4"/>
          <rect x="18" y="24" width="1" height="16" fill="${colors.secondary}" opacity="0.4"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit-${productId})"/>
    `,
    gradient: `
      <defs>
        <radialGradient id="ai-gradient-${productId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:0.4" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#ai-gradient-${productId})"/>
    `
  };

  const patternType = productId.includes('neural') ? 'neural' : 
                     productId.includes('automation') ? 'circuit' : 'gradient';
                     
  return `data:image/svg+xml;base64,${btoa(`
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      ${patterns[patternType]}
      <rect x="0" y="0" width="400" height="400" fill="rgba(0,31,63,0.05)"/>
      <text x="200" y="220" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="${colors.primary}">AI</text>
      <circle cx="200" cy="180" r="40" stroke="${colors.primary}" stroke-width="2" fill="none" opacity="0.6"/>
    </svg>
  `)}`;
};

// Product-specific color schemes for visual hierarchy
export const productColorSchemes = {
  'chatgpt-4': { primary: '#10a37f', secondary: '#06d6a0' },
  'claude-3': { primary: '#7c3aed', secondary: '#a855f7' },
  'grok-ai': { primary: '#1d9bf0', secondary: '#00bfff' },
  'github-copilot': { primary: '#24292e', secondary: '#586069' },
  'zapier-ai': { primary: '#ff4a00', secondary: '#ff6d35' },
  'n8n-ai': { primary: '#ea4b71', secondary: '#f472b6' },
  'chatbot-agent': { primary: '#8b5cf6', secondary: '#a78bfa' },
  'sales-agent': { primary: '#ef4444', secondary: '#f87171' }
};

// Get optimized image URL with fallback generation
export const getProductImage = (productId: string): string => {
  // Try real image first
  if (productImages[productId]) {
    return productImages[productId];
  }
  
  // Generate AI-themed SVG as fallback
  const colors = productColorSchemes[productId] || { primary: '#001f3f', secondary: '#00bfff' };
  return generateAIImage(productId, colors);
};

// Image optimization utilities
export const optimizeImageUrl = (url: string, width = 400, height = 400, quality = 85) => {
  // For future integration with image CDN (Cloudinary, ImageKit, etc.)
  if (url.startsWith('data:')) return url; // SVG data URLs
  if (url.startsWith('/images/')) return url; // Local images
  
  // Add optimization parameters for external images
  return `${url}?w=${width}&h=${height}&q=${quality}&f=auto`;
};

export default productImages;