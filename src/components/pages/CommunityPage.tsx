import React, { memo } from 'react';
import { MessageCircle, Users, Heart } from 'lucide-react';
import SEO from '../SEO';

/**
 * CommunityPage - Social commerce stub (Phase 2)  
 * Future: Real-time chat, forums for social proof (Cialdini's influence)
 * Placeholder demonstrates upcoming community features
 */
const CommunityPage = memo(() => {
  return (
    <div className="min-h-screen bg-bg">
      <SEO 
        title="AI Community - Coming Soon"
        description="Join the AI community for discussions, support, and collaboration"
      />
      
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="w-24 h-24 mx-auto mb-8 bg-primary/10 rounded-3xl flex items-center justify-center">
          <MessageCircle className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold text-navy mb-6">
          AI Community Hub
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Connect with AI enthusiasts, share workflows, and build together. 
          A thriving community for the next generation of AI adoption.
        </p>
        
        <div className="bg-surface rounded-xl p-8 border border-gray-200 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-navy mb-2">Live Discussions</h3>
              <p className="text-gray-600 text-sm">Real-time chat and forums for AI topics</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-navy mb-2">Peer Support</h3>
              <p className="text-gray-600 text-sm">Get help from experienced AI users</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-navy mb-2">Showcase Work</h3>
              <p className="text-gray-600 text-sm">Share your AI creations and workflows</p>
            </div>
          </div>
        </div>
        
        <p className="text-gray-500 mt-8">
          Phase 2 Feature - Social proof for 35% loyalty boost (Harvard Business Review 2021)
        </p>
      </div>
    </div>
  );
});

CommunityPage.displayName = 'CommunityPage';

export default CommunityPage;