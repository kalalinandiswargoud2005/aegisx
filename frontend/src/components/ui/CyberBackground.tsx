import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CyberBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate random floating nodes for the cyber aesthetic
  const nodes = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    duration: Math.random() * 30 + 20,
    delay: Math.random() * 10,
    color: Math.random() > 0.7 ? 'bg-secondary' : 'bg-primary'
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Mouse tracker glow */}
      <motion.div 
        className="absolute w-[500px] h-[500px] rounded-full opacity-10 blur-[100px] mix-blend-screen bg-primary"
        animate={{
          x: mousePosition.x - 250,
          y: mousePosition.y - 250,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 1.5 }}
      />
      
      {/* 3D Base Grid */}
      <div className="absolute inset-0 overflow-hidden perspective-[1000px]">
        <div className="cyber-grid-3d opacity-30"></div>
      </div>
      
      {/* Slow Moving Scanline */}
      <motion.div 
        animate={{ y: ["-100vh", "100vh"] }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        className="absolute inset-0 w-full h-[30vh] bg-gradient-to-b from-transparent via-primary/5 to-transparent border-b border-primary/10"
      />

      {/* Floating Data Nodes */}
      {nodes.map(node => (
        <motion.div
          key={node.id}
          className={`absolute rounded-full ${node.color} shadow-[0_0_8px_currentColor]`}
          style={{
            width: node.size,
            height: node.size,
            left: `${node.startX}%`,
            top: `${node.startY}%`,
          }}
          animate={{
            y: [0, -200, 0],
            x: [0, Math.random() * 100 - 50, 0],
            opacity: [0, 0.8, 0]
          }}
          transition={{
            duration: node.duration,
            repeat: Infinity,
            delay: node.delay,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Vignette effect to darken edges and make content pop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,2,4,0.8)_100%)]" />
    </div>
  );
}
