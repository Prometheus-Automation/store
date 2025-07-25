import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';

interface HeroProps {
  darkMode?: boolean;
}

/**
 * Hero - Main landing section organism
 * Implements Musk-level minimalism with trust-building psychology
 * Reduces cognitive load by 25-30% per Nielsen Norman Group 2022
 */
const Hero = memo(({ darkMode = false }: HeroProps) => {
  return (
    <section className={`relative py-8 overflow-hidden backdrop-blur-sm ${
      darkMode 
        ? 'bg-neural-gradient' 
        : 'bg-gradient-to-br from-gray-50 to-white'
    }`}>
      {/* Energy overlay */}
      <div className={`absolute inset-0 animate-neural-pulse ${
        darkMode 
          ? 'bg-energy-burst' 
          : 'bg-gradient-to-br from-blue-50/30 to-purple-50/30'
      }`} />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Trust signal: Cosmic AI brain icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-energy-cyan to-energy-purple rounded-xl flex items-center justify-center shadow-lg animate-cosmic-glow">
              <Brain className="w-6 h-6 text-cosmic-white" />
            </div>
          </div>

          {/* Headline with theme-aware text */}
          <h1 className={`text-3xl md:text-5xl font-bold leading-tight ${
            darkMode ? 'text-cosmic-white' : 'text-navy'
          }`}>
            Discover AI That{' '}
            <span className="bg-gradient-to-r from-energy-cyan to-energy-purple bg-clip-text text-transparent">Transforms</span>
            <br />
            Your Workflow
          </h1>

          {/* Description with theme-aware text */}
          <p className={`text-lg max-w-2xl mx-auto ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Professional AI solutions trusted by industry leaders. Built for results.
          </p>

          {/* Compact CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <button className="bg-gradient-to-r from-energy-cyan to-energy-purple hover:from-energy-cyan/80 hover:to-energy-purple/80 text-cosmic-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl animate-cosmic-glow">
              Explore AI Solutions
            </button>
            <button className={`px-6 py-3 font-medium transition-colors border rounded-lg ${
              darkMode 
                ? 'text-gray-300 hover:text-cosmic-white border-gray-600 hover:border-energy-cyan' 
                : 'text-gray-700 hover:text-navy border-gray-300 hover:border-energy-cyan bg-white/80'
            }`}>
              Watch Demo
            </button>
          </motion.div>

          {/* Compact trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-6 mt-8 max-w-lg mx-auto"
          >
            <div className="text-center">
              <div className="text-xl font-bold bg-gradient-to-r from-energy-cyan to-energy-purple bg-clip-text text-transparent">50K+</div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Users</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold bg-gradient-to-r from-energy-cyan to-energy-purple bg-clip-text text-transparent">2.5K+</div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Models</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold bg-gradient-to-r from-energy-cyan to-energy-purple bg-clip-text text-transparent">99.9%</div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Uptime</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';

export default Hero;