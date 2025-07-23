import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface Connection {
  from: number;
  to: number;
  opacity: number;
}

export default function NeuralBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5
    }));

    // Generate connections between nearby particles
    const newConnections: Connection[] = [];
    for (let i = 0; i < newParticles.length; i++) {
      for (let j = i + 1; j < newParticles.length; j++) {
        const dx = newParticles[i].x - newParticles[j].x;
        const dy = newParticles[i].y - newParticles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 25) { // Only connect nearby particles
          newConnections.push({
            from: i,
            to: j,
            opacity: Math.max(0.1, 0.4 - distance / 60)
          });
        }
      }
    }

    setParticles(newParticles);
    setConnections(newConnections);
  }, []);

  // Particle animation variants
  const particleVariants = {
    animate: (particle: Particle) => ({
      x: [particle.x + '%', (particle.x + 10) + '%', particle.x + '%'],
      y: [particle.y + '%', (particle.y - 15) + '%', particle.y + '%'],
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.8, 0.3],
      transition: {
        duration: particle.duration,
        delay: particle.delay,
        repeat: Infinity,
        ease: "easeInOut"
      }
    })
  };

  // Connection animation variants
  const connectionVariants = {
    animate: {
      opacity: [0.1, 0.4, 0.1],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient background */}
      <motion.div 
        className="absolute inset-0 bg-neural-gradient"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />
      
      {/* SVG for particles and connections */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          {/* Glowing effect filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Gradient for connections */}
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00bfff" stopOpacity="0.6"/>
            <stop offset="50%" stopColor="#0080ff" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#00bfff" stopOpacity="0.6"/>
          </linearGradient>
        </defs>

        {/* Render connections */}
        {connections.map((connection, index) => {
          const fromParticle = particles[connection.from];
          const toParticle = particles[connection.to];
          
          if (!fromParticle || !toParticle) return null;
          
          return (
            <motion.line
              key={`connection-${index}`}
              x1={`${fromParticle.x}%`}
              y1={`${fromParticle.y}%`}
              x2={`${toParticle.x}%`}
              y2={`${toParticle.y}%`}
              stroke="url(#connectionGradient)"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              variants={connectionVariants}
              animate="animate"
              style={{ filter: 'url(#glow)' }}
            />
          );
        })}

        {/* Render particles */}
        {particles.map((particle) => (
          <motion.g key={particle.id}>
            {/* Main particle */}
            <motion.circle
              cx={`${particle.x}%`}
              cy={`${particle.y}%`}
              r={particle.size}
              fill="#00bfff"
              initial={{ opacity: 0, scale: 0 }}
              custom={particle}
              variants={particleVariants}
              animate="animate"
              style={{ filter: 'url(#glow)' }}
            />
            
            {/* Pulsing outer ring */}
            <motion.circle
              cx={`${particle.x}%`}
              cy={`${particle.y}%`}
              r={particle.size * 2}
              fill="none"
              stroke="#00bfff"
              strokeWidth="0.5"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: particle.duration * 0.7,
                delay: particle.delay + 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.g>
        ))}

        {/* Floating data nodes */}
        {particles.slice(0, 5).map((particle, index) => (
          <motion.g key={`node-${index}`}>
            <motion.rect
              x={`${particle.x - 1}%`}
              y={`${particle.y - 1}%`}
              width="8"
              height="8"
              rx="2"
              fill="#ffcc00"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                rotate: [0, 180, 360],
                x: [`${particle.x - 1}%`, `${particle.x + 3}%`, `${particle.x - 1}%`],
              }}
              transition={{
                duration: particle.duration * 1.2,
                delay: particle.delay + 2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ filter: 'url(#glow)' }}
            />
          </motion.g>
        ))}
      </svg>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        {particles.slice(0, 3).map((particle, index) => (
          <motion.div
            key={`shape-${index}`}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.1, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: particle.duration * 2,
              delay: particle.delay + 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div 
              className="w-6 h-6 border border-neon-blue/30 rounded-full"
              style={{
                boxShadow: '0 0 10px rgba(0, 191, 255, 0.3)',
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Scanning line effect */}
      <motion.div
        className="absolute inset-0 opacity-20"
        initial={{ background: 'linear-gradient(90deg, transparent 0%, rgba(0, 191, 255, 0.1) 50%, transparent 100%)' }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          width: '200%',
          height: '2px',
          top: '30%',
        }}
      />
    </div>
  );
}