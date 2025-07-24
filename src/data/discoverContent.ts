/**
 * Discover Feed Content - TikTok-style AI demos for addiction
 * Variable rewards mechanism for 47% engagement boost (Eyal 2014)
 */

export interface DiscoverVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number; // seconds
  views: number;
  likes: number;
  productId: string;
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  tags: string[];
  cta: {
    text: string;
    price: number;
    originalPrice?: number;
  };
  hookText: string; // 0-3s problem hook
  demoText: string; // 3-12s solution
  resultText: string; // 12-15s outcome
}

// 15-second AI demo videos for infinite scroll addiction
export const discoverVideos: DiscoverVideo[] = [
  {
    id: 'chatgpt-sales-page',
    title: 'ChatGPT Writing a $10K Sales Page in 30 Seconds',
    description: 'Watch GPT-4 create a complete sales funnel that converts at 12%',
    thumbnailUrl: '/images/discover/chatgpt-demo-thumb.jpg',
    videoUrl: '/videos/discover/chatgpt-sales-demo.mp4',
    duration: 15,
    views: 2847563,
    likes: 184720,
    productId: 'chatgpt-4',
    creator: {
      name: 'AI Marketing Pro',
      avatar: '/images/avatars/ai-marketer.jpg',
      verified: true
    },
    tags: ['sales', 'copywriting', 'gpt4', 'marketing'],
    cta: {
      text: 'Start Writing Now',
      price: 20,
      originalPrice: 25
    },
    hookText: "Spending 10 hours writing sales copy?",
    demoText: "Watch ChatGPT create a complete sales page with headlines, bullet points, and CTAs",
    resultText: "$10K in sales from a page built in 30 seconds"
  },
  {
    id: 'claude-document-analysis',
    title: 'Claude Analyzing 100 Documents Instantly',
    description: 'See Claude 3 process legal contracts, extract key terms, and summarize risks',
    thumbnailUrl: '/images/discover/claude-docs-thumb.jpg',
    videoUrl: '/videos/discover/claude-analysis-demo.mp4',
    duration: 15,
    views: 1923847,
    likes: 156389,
    productId: 'claude-3',
    creator: {
      name: 'Legal Tech Expert',
      avatar: '/images/avatars/legal-expert.jpg',
      verified: true
    },
    tags: ['analysis', 'documents', 'claude', 'legal'],
    cta: {
      text: 'Analyze Documents',
      price: 25,
      originalPrice: 35
    },
    hookText: "Drowning in contract reviews?",
    demoText: "Claude reads 100 pages, extracts risks, and creates executive summaries",
    resultText: "From 8 hours to 8 minutes - 99.2% accuracy"
  },
  {
    id: 'zapier-automation-empire',
    title: 'Zapier Automation Saving 10 Hours/Week',
    description: 'Complete workflow automation: emails, CRM updates, social posts - all automatic',
    thumbnailUrl: '/images/discover/zapier-automation-thumb.jpg',
    videoUrl: '/videos/discover/zapier-workflow-demo.mp4',
    duration: 15,
    views: 3456789,
    likes: 267891,
    productId: 'zapier-ai',
    creator: {
      name: 'Productivity Hacker',
      avatar: '/images/avatars/productivity-guru.jpg',
      verified: true
    },
    tags: ['automation', 'productivity', 'zapier', 'workflow'],
    cta: {
      text: 'Automate Everything',
      price: 29,
      originalPrice: 39
    },
    hookText: "Manual tasks eating your day?",
    demoText: "One trigger = 12 automated actions across Gmail, Slack, CRM, and social media",
    resultText: "10 hours back per week, zero manual work"
  },
  {
    id: 'n8n-empire-builder',
    title: 'n8n Workflow Building Your Empire While You Sleep',
    description: 'Self-hosted automation that runs your business 24/7 without monthly fees',
    thumbnailUrl: '/images/discover/n8n-empire-thumb.jpg',
    videoUrl: '/videos/discover/n8n-workflow-demo.mp4',
    duration: 15,
    views: 1567234,
    likes: 189456,
    productId: 'n8n-ai',
    creator: {
      name: 'Automation Architect',
      avatar: '/images/avatars/automation-expert.jpg',
      verified: true
    },
    tags: ['n8n', 'self-hosted', 'automation', 'opensource'],
    cta: {
      text: 'Start Building',
      price: 0,
      originalPrice: undefined
    },
    hookText: "Tired of paying for every automation?",
    demoText: "n8n runs on your server - unlimited workflows, no monthly fees, complete control",
    resultText: "Business running 24/7, $0/month, infinite scale"
  },
  {
    id: 'ai-sales-agent-3am',
    title: 'AI Agent Closing Deals at 3AM',
    description: 'Watch an AI sales agent qualify leads, book meetings, and follow up automatically',
    thumbnailUrl: '/images/discover/sales-agent-thumb.jpg',
    videoUrl: '/videos/discover/sales-agent-demo.mp4',
    duration: 15,
    views: 2789456,
    likes: 234567,
    productId: 'sales-agent',
    creator: {
      name: 'Sales AI Pioneer',
      avatar: '/images/avatars/sales-expert.jpg',
      verified: true
    },
    tags: ['sales', 'ai-agent', 'lead-qualification', 'automation'],
    cta: {
      text: 'Get Your Agent',
      price: 199,
      originalPrice: 299
    },
    hookText: "Missing deals while you sleep?",
    demoText: "AI agent qualifies leads, schedules meetings, sends follow-ups - never sleeps",
    resultText: "3AM deal closed, $50K contract signed automatically"
  },
  {
    id: 'github-copilot-coding',
    title: 'GitHub Copilot Building Apps in Minutes',
    description: 'AI pair programmer writes functions, fixes bugs, and explains code instantly',
    thumbnailUrl: '/images/discover/copilot-coding-thumb.jpg',
    videoUrl: '/videos/discover/copilot-demo.mp4',
    duration: 15,
    views: 4123789,
    likes: 389456,
    productId: 'github-copilot',
    creator: {
      name: 'Code Wizard',
      avatar: '/images/avatars/developer.jpg',
      verified: true
    },
    tags: ['coding', 'github', 'programming', 'ai-assistant'],
    cta: {
      text: 'Code Faster',
      price: 10,
      originalPrice: undefined
    },
    hookText: "Spending hours debugging code?",
    demoText: "Copilot writes functions, fixes bugs, explains complex code - like having a senior dev",
    resultText: "App built in 20 minutes instead of 20 hours"
  }
];

// Infinite scroll pagination utility
export const getDiscoverPage = (page: number, pageSize: number = 3) => {
  const start = page * pageSize;
  const end = start + pageSize;
  const videos = discoverVideos.slice(start, end);
  
  return {
    videos,
    nextCursor: end < discoverVideos.length ? page + 1 : null,
    hasMore: end < discoverVideos.length,
    total: discoverVideos.length
  };
};

// Generate mock real-time stats for engagement
export const generateLiveStats = (videoId: string) => {
  const base = discoverVideos.find(v => v.id === videoId);
  if (!base) return { views: 0, likes: 0 };
  
  // Add small random increments for "live" feel
  const viewBoost = Math.floor(Math.random() * 50);
  const likeBoost = Math.floor(Math.random() * 10);
  
  return {
    views: base.views + viewBoost,
    likes: base.likes + likeBoost
  };
};

export default discoverVideos;