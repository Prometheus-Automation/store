import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Heart, Share, ShoppingCart, Eye, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import ReactPlayer from 'react-player';
import { getDiscoverPage, generateLiveStats, type DiscoverVideo } from '../data/discoverContent';
import { useCart } from '../contexts/CartContext';
import { getProductById } from '../data/products';
import SEO from '../components/SEO';
import OptimizedImage from '../components/common/OptimizedImage';

/**
 * DiscoverPage - TikTok-style infinite scroll feed
 * Variable reward mechanism for 47% engagement boost (Eyal 2014: Hooked)
 * Implements addiction mechanics through endless discovery
 */
const DiscoverPage = memo(() => {
  const { addItem } = useCart();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [liveStats, setLiveStats] = useState<Record<string, { views: number; likes: number }>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Infinite scroll query for addictive content loading
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['discover-feed'],
    queryFn: ({ pageParam = 0 }) => getDiscoverPage(pageParam, 3),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const allVideos = data?.pages.flatMap(page => page.videos) || [];

  // Auto-scroll to next video (TikTok behavior)
  const scrollToVideo = useCallback((index: number) => {
    const container = containerRef.current;
    if (container) {
      const videoHeight = window.innerHeight;
      container.scrollTo({
        top: index * videoHeight,
        behavior: 'smooth'
      });
      setCurrentVideoIndex(index);
    }
  }, []);

  // Intersection observer for auto-play and infinite loading
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoIndex = parseInt(entry.target.getAttribute('data-video-index') || '0');
          
          if (entry.isIntersecting) {
            setCurrentVideoIndex(videoIndex);
            
            // Load more content when near the end (infinite scroll)
            if (videoIndex >= allVideos.length - 2 && hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.5,
        rootMargin: '0px'
      }
    );

    // Observe all video elements
    const videoElements = container.querySelectorAll('[data-video-index]');
    videoElements.forEach(el => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [allVideos.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Live stats updates for social proof (variable rewards)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentVideo = allVideos[currentVideoIndex];
      if (currentVideo) {
        setLiveStats(prev => ({
          ...prev,
          [currentVideo.id]: generateLiveStats(currentVideo.id)
        }));
      }
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [currentVideoIndex, allVideos]);

  // Handle video like (dopamine reward)
  const handleLike = (videoId: string) => {
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });

    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  // Handle product purchase from video
  const handlePurchase = (videoId: string) => {
    const video = allVideos.find(v => v.id === videoId);
    if (video) {
      const product = getProductById(video.productId);
      if (product) {
        addItem(product);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
            <Play className="w-8 h-8 text-primary" />
          </div>
          <p className="text-white text-lg">Loading AI Discoveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <SEO 
        title="Discover AI - Infinite Feed of AI Demos"
        description="Endless scroll of AI product demos, tutorials, and trending solutions. TikTok-style discovery for the AI age."
      />
      
      {/* Main video feed container */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allVideos.map((video, index) => (
          <VideoCard
            key={video.id}
            video={video}
            index={index}
            isActive={index === currentVideoIndex}
            isMuted={isMuted}
            isLiked={likedVideos.has(video.id)}
            liveStats={liveStats[video.id]}
            onLike={() => handleLike(video.id)}
            onPurchase={() => handlePurchase(video.id)}
            onShare={() => {
              if (navigator.share) {
                navigator.share({
                  title: video.title,
                  text: video.description,
                  url: window.location.href
                });
              }
            }}
          />
        ))}
        
        {/* Loading indicator for infinite scroll */}
        {isFetchingNextPage && (
          <div className="h-screen flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-white">Loading more discoveries...</p>
            </div>
          </div>
        )}
      </div>

      {/* Global controls overlay */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>

      {/* Video counter */}
      <div className="fixed top-4 left-4 z-50 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
        {currentVideoIndex + 1} / {allVideos.length}
      </div>
    </div>
  );
});

// Individual video card component with TikTok-style UI
const VideoCard = memo(({ 
  video, 
  index, 
  isActive, 
  isMuted, 
  isLiked, 
  liveStats,
  onLike, 
  onPurchase, 
  onShare 
}: {
  video: DiscoverVideo;
  index: number;
  isActive: boolean;
  isMuted: boolean;
  isLiked: boolean;
  liveStats?: { views: number; likes: number };
  onLike: () => void;
  onPurchase: () => void;
  onShare: () => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play when active
  useEffect(() => {
    setIsPlaying(isActive);
  }, [isActive]);

  return (
    <div 
      className="relative h-screen snap-start flex items-center justify-center"
      data-video-index={index}
    >
      {/* Background video/image */}
      <div className="absolute inset-0">
        {video.videoUrl ? (
          <ReactPlayer
            url={video.videoUrl}
            playing={isPlaying && isActive}
            loop
            muted={isMuted}
            width="100%"
            height="100%"
            className="object-cover"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <OptimizedImage
            productId={video.productId}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex h-full">
        {/* Left side - Video info */}
        <div className="flex-1 flex flex-col justify-end p-6 pb-24">
          {/* Creator info */}
          <div className="flex items-center space-x-3 mb-4">
            <OptimizedImage
              src={video.creator.avatar}
              alt={video.creator.name}
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">{video.creator.name}</span>
                {video.creator.verified && (
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-gray-300 text-sm">AI Expert</p>
            </div>
          </div>

          {/* Video title and description */}
          <h2 className="text-white text-xl font-bold mb-2 leading-tight">
            {video.title}
          </h2>
          <p className="text-gray-200 text-sm mb-4 line-clamp-2">
            {video.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {video.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            onClick={onPurchase}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center space-x-3 w-fit"
          >
            <ShoppingCart className="w-5 h-5" />
            <div className="text-left">
              <div>{video.cta.text}</div>
              <div className="text-sm opacity-90">
                ${video.cta.price}{video.cta.originalPrice && (
                  <span className="line-through ml-2 opacity-60">${video.cta.originalPrice}</span>
                )}
              </div>
            </div>
          </motion.button>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex flex-col justify-end items-center p-6 space-y-6">
          {/* Like button */}
          <motion.button
            onClick={onLike}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center space-y-1"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isLiked ? 'bg-red-500' : 'bg-white/20 backdrop-blur-sm'
            }`}>
              <Heart className={`w-7 h-7 ${isLiked ? 'text-white fill-current' : 'text-white'}`} />
            </div>
            <span className="text-white text-xs font-medium">
              {liveStats?.likes || video.likes}
            </span>
          </motion.button>

          {/* Share button */}
          <motion.button
            onClick={onShare}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Share className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">Share</span>
          </motion.button>

          {/* Comment button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">Comment</span>
          </motion.button>

          {/* View count */}
          <div className="flex flex-col items-center space-y-1">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">
              {liveStats?.views || video.views}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoCard.displayName = 'VideoCard';
DiscoverPage.displayName = 'DiscoverPage';

export default DiscoverPage;