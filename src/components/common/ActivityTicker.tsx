import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  message: string;
  timestamp: Date;
}

/**
 * ActivityTicker - Subtle social proof for premium AI marketplace
 * Clean, minimal design with professional trust signals
 * Navy color scheme for sophisticated appearance
 */
const ActivityTicker = memo(() => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Professional activity messages
  const activityMessages = [
    'Enterprise client automated 40 hours of weekly tasks',
    'Fortune 500 company integrated Claude AI workflow',
    'Research team achieved 3x faster data analysis',
    'Startup scaled to 100K users with AI automation',
    'Development team reduced code review time by 60%',
    'Marketing agency automated client reporting pipeline',
    'Financial firm enhanced compliance monitoring'
  ];

  // Generate new activity
  const generateActivity = (): ActivityItem => {
    const message = activityMessages[Math.floor(Math.random() * activityMessages.length)];
    
    return {
      id: `${Date.now()}-${Math.random()}`,
      message,
      timestamp: new Date()
    };
  };

  // Initialize and update activities
  useEffect(() => {
    // Initial activities
    const initialActivities = Array.from({ length: 3 }, generateActivity);
    setActivities(initialActivities);

    // Add new activities periodically
    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setActivities(prev => [newActivity, ...prev].slice(0, 5));
    }, 12000); // Every 12 seconds

    return () => clearInterval(interval);
  }, []);

  // Rotate visible activity
  useEffect(() => {
    if (activities.length === 0) return;

    const rotateInterval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.min(activities.length, 3));
    }, 6000); // Every 6 seconds

    return () => clearInterval(rotateInterval);
  }, [activities.length]);

  const visibleActivities = activities.slice(0, 3);
  const currentActivity = visibleActivities[currentIndex];

  if (!currentActivity) return null;

  return (
    <div className="bg-gray-50 border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Main Activity Display */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentActivity.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center space-x-4"
              >
                {/* Live Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-600">
                    Live
                  </span>
                </div>

                {/* Activity Content */}
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-gray-700 font-medium">
                    {currentActivity.message}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-primary" />
              <span>
                <span className="font-semibold text-navy">
                  {Math.floor(Math.random() * 100) + 500}
                </span> active users
              </span>
            </div>
            
            <div className="w-px h-4 bg-gray-300" />
            
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Updated live</span>
            </div>
          </div>

          {/* Activity Dots */}
          <div className="hidden sm:flex items-center space-x-2 ml-6">
            {visibleActivities.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-primary'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mobile-only simplified view */}
        <div className="md:hidden mt-2 text-center text-xs text-gray-600">
          {Math.floor(Math.random() * 100) + 500} active users • Updated live
        </div>
      </div>
    </div>
  );
});

ActivityTicker.displayName = 'ActivityTicker';

export default ActivityTicker;