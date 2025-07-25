import React, { memo } from 'react';

/**
 * VideoBackground - Neural network video background
 * Low opacity cosmic energy burst theme for immersive AI marketplace feel
 * Implements dark-first approach with subtle neural flows
 */
const VideoBackground = memo(() => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Cosmic gradient overlay */}
      <div className="absolute inset-0 bg-cosmic-gradient opacity-90" />
      
      {/* Video background with low opacity */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        style={{
          filter: 'blur(1px) brightness(0.7) contrast(1.2)',
        }}
      >
        <source src="/AI_Marketplace_Video_Background_Request.mp4" type="video/mp4" />
        {/* Fallback for unsupported video */}
        <div className="absolute inset-0 bg-cosmic-gradient" />
      </video>
      
      {/* Additional overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cosmic-bg/10 to-cosmic-bg/30" />
      
      {/* Subtle neural pulse overlay */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, #00bfff 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, #00ffaa 0%, transparent 50%),
              radial-gradient(circle at 60% 20%, #b22222 0%, transparent 50%)
            `,
            animation: 'neural-pulse 8s ease-in-out infinite alternate',
          }}
        />
      </div>
    </div>
  );
});

VideoBackground.displayName = 'VideoBackground';

export default VideoBackground;