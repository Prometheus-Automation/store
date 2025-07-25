import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Header from './Header';
import Footer from './Footer';
import VideoBackground from '../common/VideoBackground';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col relative ${darkMode ? 'bg-cosmic-gradient' : 'bg-gray-50'}`}>
      {darkMode && <VideoBackground />}
      
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1"
      >
        {children}
      </motion.main>
      
      <Footer darkMode={darkMode} />
    </div>
  );
}