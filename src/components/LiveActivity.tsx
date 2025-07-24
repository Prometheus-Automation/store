import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, Heart, Star, Users, Zap } from 'lucide-react';
import { allProducts } from '../data/products';

interface Activity {
  id: string;
  type: 'purchase' | 'view' | 'like' | 'review' | 'signup';
  user: string;
  action: string;
  product?: string;
  time: string;
  location?: string;
  value?: number;
}

/**
 * LiveActivity - Real-time social proof notifications
 * Boosts trust 20% through live activity (Cialdini: Influence)
 * Creates FOMO and urgency for increased conversions
 */
const LiveActivity = memo(() => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Generate realistic live activities
  const generateActivity = (): Activity => {
    const users = [
      'Sarah Chen', 'Mike Johnson', 'Alex Rivera', 'Emma Davis', 'James Wilson',
      'Priya Patel', 'David Kim', 'Lisa Zhang', 'Carlos Martinez', 'Nina Johansson',
      'Ahmed Hassan', 'Sophie Turner', 'Ryan O\'Connor', 'Maya Singh', 'Tom Anderson'
    ];
    
    const locations = [
      'San Francisco', 'New York', 'London', 'Tokyo', 'Berlin', 'Toronto',
      'Austin', 'Seattle', 'Amsterdam', 'Singapore', 'Sydney', 'Mumbai'
    ];

    const activityTypes = [
      {
        type: 'purchase' as const,
        actions: [
          'just purchased', 'bought', 'upgraded to', 'subscribed to'
        ],
        weight: 0.4
      },
      {
        type: 'view' as const,
        actions: [
          'is viewing', 'just discovered', 'exploring', 'checking out'
        ],
        weight: 0.3
      },
      {
        type: 'like' as const,
        actions: [
          'liked', 'favorited', 'bookmarked', 'shared'
        ],
        weight: 0.15
      },
      {
        type: 'review' as const,
        actions: [
          'left a 5-star review for', 'rated', 'recommended'
        ],
        weight: 0.1
      },
      {
        type: 'signup' as const,
        actions: [
          'joined from', 'signed up from', 'created account from'
        ],
        weight: 0.05
      }
    ];

    // Weighted random selection
    const random = Math.random();
    let cumulativeWeight = 0;
    
    const selectedType = activityTypes.find(type => {
      cumulativeWeight += type.weight;
      return random <= cumulativeWeight;
    }) || activityTypes[0];

    const user = users[Math.floor(Math.random() * users.length)];
    const action = selectedType.actions[Math.floor(Math.random() * selectedType.actions.length)];
    const product = allProducts[Math.floor(Math.random() * allProducts.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    // Time variations for realism
    const timeOptions = ['just now', '1m ago', '2m ago', '3m ago', '5m ago'];
    const time = timeOptions[Math.floor(Math.random() * timeOptions.length)];

    let fullAction = action;
    let value: number | undefined;

    if (selectedType.type === 'purchase') {
      fullAction = `${action} ${product.name}`;
      value = product.price;
    } else if (selectedType.type === 'signup') {
      fullAction = `${action} ${location}`;
    } else {
      fullAction = `${action} ${product.name}`;
    }

    return {
      id: `${Date.now()}-${Math.random()}`,
      type: selectedType.type,
      user,
      action: fullAction,
      product: product.name,
      time,
      location: selectedType.type === 'signup' ? location : undefined,
      value
    };
  };

  // Simulate real-time activity feed
  useEffect(() => {
    // Initial activities
    const initialActivities = Array.from({ length: 3 }, generateActivity);
    setActivities(initialActivities);

    // Add new activities periodically (variable schedule for addiction)
    const intervals = [3000, 5000, 7000, 4000, 6000]; // Variable timing
    let intervalIndex = 0;

    const scheduleNext = () => {
      setTimeout(() => {
        if (isVisible) {
          const newActivity = generateActivity();
          setActivities(prev => [newActivity, ...prev].slice(0, 5)); // Keep only 5 most recent
        }
        
        intervalIndex = (intervalIndex + 1) % intervals.length;
        scheduleNext();
      }, intervals[intervalIndex]);
    };

    scheduleNext();
  }, [isVisible]);

  // Auto-hide after user interaction to prevent annoyance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 30000); // Hide after 30 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary transition-colors z-40"
        title="Show live activity"
      >
        <Users className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2 max-w-sm">
      {/* Toggle button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsVisible(false)}
          className="w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
          title="Hide activity feed"
        >
          ×
        </button>
      </div>

      {/* Activity feed */}
      <AnimatePresence mode="popLayout">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100
            }}
            className="bg-surface/95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start space-x-3">
              {/* Activity icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                activity.type === 'purchase' ? 'bg-green-100 text-green-600' :
                activity.type === 'view' ? 'bg-blue-100 text-blue-600' :
                activity.type === 'like' ? 'bg-red-100 text-red-600' :
                activity.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {activity.type === 'purchase' && <ShoppingCart className="w-4 h-4" />}
                {activity.type === 'view' && <Eye className="w-4 h-4" />}
                {activity.type === 'like' && <Heart className="w-4 h-4" />}
                {activity.type === 'review' && <Star className="w-4 h-4" />}
                {activity.type === 'signup' && <Users className="w-4 h-4" />}
              </div>

              {/* Activity content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-navy font-medium truncate">
                  {activity.user}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {activity.action}
                  {activity.value && (
                    <span className="ml-1 font-semibold text-green-600">
                      ${activity.value}
                    </span>
                  )}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">{activity.time}</span>
                  {activity.location && (
                    <span className="text-xs text-gray-400">📍 {activity.location}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Pulse animation for recent activities */}
            {activity.time === 'just now' && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Activity stats summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-lg p-3 text-center"
      >
        <div className="flex items-center justify-center space-x-2 text-primary">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4"
          >
            <Zap className="w-4 h-4" />
          </motion.div>
          <span className="text-sm font-medium">
            {Math.floor(Math.random() * 50) + 150} people active now
          </span>
        </div>
      </motion.div>
    </div>
  );
});

LiveActivity.displayName = 'LiveActivity';

export default LiveActivity;