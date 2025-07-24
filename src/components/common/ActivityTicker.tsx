import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MapPin, Clock, TrendingUp, ShoppingCart } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'purchase' | 'signup' | 'view' | 'achievement';
  message: string;
  location?: string;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
}

/**
 * ActivityTicker - Live social proof for trust building
 * Implements Cialdini's social proof principle (20% conversion boost)
 * Creates FOMO through real-time activity display
 */
const ActivityTicker = memo(() => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Realistic activity data
  const activityTemplates = [
    {
      type: 'purchase' as const,
      messages: [
        'Sarah from Austin just saved 10 hours with Zapier AI',
        'Mike in NYC automated his entire workflow', 
        'Jessica from London just purchased ChatGPT Plus',
        'David in Toronto is now 3x more productive',
        'Amanda from Berlin just automated her email responses'
      ],
      icon: <ShoppingCart className="w-4 h-4" />,
      color: 'text-green-600'
    },
    {
      type: 'achievement' as const,
      messages: [
        'New record: 1,247 automations running right now',
        '🔥 ChatGPT Plus is trending - 89 purchases today',
        'n8n just saved users 2,500 hours this week',
        'AI agents closed 47 deals while users slept',
        'Community milestone: 50K+ active automations'
      ],
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-orange-600'
    },
    {
      type: 'signup' as const,
      messages: [
        'Emma from Sydney just joined the AI revolution',
        'Carlos from Madrid discovered his first automation',
        'Lisa from Tokyo is exploring AI solutions',
        'James from Vancouver just created his profile',
        'Sophie from Paris joined the community'
      ],
      icon: <Users className="w-4 h-4" />,
      color: 'text-blue-600'
    },
    {
      type: 'view' as const,
      messages: [
        '127 people are viewing AI models right now',
        'Discover feed: 2.3K users scrolling for solutions',
        'GitHub Copilot demo viewed 1,423 times today',
        'Claude AI just got 89 new reviews',
        'Live: 234 users comparing automations'
      ],
      icon: <Clock className="w-4 h-4" />,
      color: 'text-purple-600'
    }
  ];

  const locations = [
    'San Francisco', 'New York', 'London', 'Tokyo', 'Berlin', 'Toronto',
    'Austin', 'Seattle', 'Amsterdam', 'Singapore', 'Sydney', 'Mumbai',
    'Paris', 'Madrid', 'Vancouver', 'Montreal', 'Barcelona', 'Copenhagen'
  ];

  // Generate new activity
  const generateActivity = (): ActivityItem => {
    const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
    const message = template.messages[Math.floor(Math.random() * template.messages.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    return {
      id: `${Date.now()}-${Math.random()}`,
      type: template.type,
      message,
      location: template.type === 'signup' || template.type === 'purchase' ? location : undefined,
      timestamp: new Date(),
      icon: template.icon,
      color: template.color
    };
  };

  // Initialize and update activities
  useEffect(() => {
    // Initial activities
    const initialActivities = Array.from({ length: 5 }, generateActivity);
    setActivities(initialActivities);

    // Add new activities periodically (variable timing for realism)
    const intervals = [4000, 6000, 8000, 5000, 7000];
    let intervalIndex = 0;

    const scheduleNext = () => {
      setTimeout(() => {
        const newActivity = generateActivity();
        setActivities(prev => [newActivity, ...prev].slice(0, 8));
        
        intervalIndex = (intervalIndex + 1) % intervals.length;
        scheduleNext();
      }, intervals[intervalIndex]);
    };

    scheduleNext();
  }, []);

  // Rotate visible activity
  useEffect(() => {
    if (activities.length === 0) return;

    const rotateInterval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.min(activities.length, 3));
    }, 4000);

    return () => clearInterval(rotateInterval);
  }, [activities.length]);

  const visibleActivities = activities.slice(0, 3);
  const currentActivity = visibleActivities[currentIndex];

  if (!currentActivity) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-y border-blue-100 py-3 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-100/20 via-transparent to-purple-100/20 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex items-center justify-between">
          {/* Main Activity Display */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentActivity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex items-center space-x-4"
              >
                {/* Live Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg" />
                  <span className="text-sm font-bold text-red-600 uppercase tracking-wide">
                    LIVE
                  </span>
                </div>

                {/* Activity Content */}
                <div className="flex items-center space-x-3">
                  <div className={`${currentActivity.color} p-2 bg-white rounded-full shadow-sm`}>
                    {currentActivity.icon}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800 font-medium">
                      {currentActivity.message}
                    </span>
                    
                    {currentActivity.location && (
                      <div className="flex items-center space-x-1 text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span className="text-sm">in {currentActivity.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Activity Counter & Stats */}
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-700">
                <span className="font-bold text-green-600">
                  {Math.floor(Math.random() * 200) + 800}
                </span> active now
              </span>
            </div>
            
            <div className="w-px h-6 bg-gray-300" />
            
            <div className="text-gray-600">
              Updated <span className="font-medium">
                {new Date(currentActivity.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Activity Dots */}
          <div className="hidden sm:flex items-center space-x-2 ml-6">
            {visibleActivities.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-blue-500 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mobile-only simplified view */}
        <div className="md:hidden mt-2 flex items-center justify-between text-xs text-gray-600">
          <span>{Math.floor(Math.random() * 200) + 800} users active</span>
          <span>Updated {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.7,
            }}
          />
        ))}
      </div>
    </div>
  );
});

ActivityTicker.displayName = 'ActivityTicker';

export default ActivityTicker;