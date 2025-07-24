import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatsTooltipProps {
  children: React.ReactNode;
  content: string;
  position?: string;
}

const StatsTooltip = ({ children, content, position = "bottom" }: StatsTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isVisible && tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };
    
    if (isVisible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isVisible]);
  
  return (
    <div 
      ref={tooltipRef}
      className="relative inline-block tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsVisible(!isVisible);
      }}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? -5 : 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? -5 : 5 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-sm whitespace-nowrap
              ${position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'} 
              left-1/2 transform -translate-x-1/2
              before:content-[''] before:absolute before:w-2 before:h-2 before:bg-gray-900 before:rotate-45 before:left-1/2 before:transform before:-translate-x-1/2
              ${position === 'bottom' ? 'before:-top-1' : 'before:-bottom-1'}`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatsTooltip;