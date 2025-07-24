import { motion, AnimatePresence } from 'framer-motion';
import { RocketAnimation as RocketAnimationType } from '../types';

interface RocketAnimationProps {
  rockets: RocketAnimationType[];
}

const RocketAnimation = ({ rockets }: RocketAnimationProps) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {rockets.map((rocket: RocketAnimationType) => (
          <motion.div
            key={rocket.id}
            initial={{ 
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 400, 
              y: typeof window !== 'undefined' ? window.innerHeight - 100 : 500,
              scale: 0,
              rotate: 0
            }}
            animate={{ 
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 600,
              y: -100,
              scale: [0, 1.5, 0],
              rotate: [0, 360, 720]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 2,
              ease: "easeOut"
            }}
            className="absolute text-4xl"
          >
            🚀
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RocketAnimation;