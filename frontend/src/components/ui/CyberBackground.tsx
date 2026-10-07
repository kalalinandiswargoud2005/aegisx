import React, { useEffect, useRef, memo } from 'react';

// Static memoized node coordinates to avoid runtime allocations and garbage collection
const STATIC_NODES = [
  { id: 1, size: 3, startX: 12, startY: 25, duration: '28s', delay: '0s', color: 'bg-primary' },
  { id: 2, size: 2, startX: 85, startY: 15, duration: '34s', delay: '2s', color: 'bg-primary' },
  { id: 3, size: 4, startX: 45, startY: 80, duration: '22s', delay: '4s', color: 'bg-secondary' },
  { id: 4, size: 2, startX: 70, startY: 65, duration: '30s', delay: '1s', color: 'bg-primary' },
  { id: 5, size: 3, startX: 25, startY: 70, duration: '26s', delay: '3s', color: 'bg-primary' },
  { id: 6, size: 2, startX: 90, startY: 88, duration: '38s', delay: '5s', color: 'bg-secondary' },
  { id: 7, size: 3, startX: 5,  startY: 40, duration: '25s', delay: '2s', color: 'bg-primary' },
  { id: 8, size: 2, startX: 60, startY: 30, duration: '32s', delay: '6s', color: 'bg-primary' },
];

export const CyberBackground = memo(function CyberBackground() {
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        if (glowRef.current) {
          glowRef.current.style.transform = `translate3d(${e.clientX - 250}px, ${e.clientY - 250}px, 0)`;
        }
        rafRef.current = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none will-change-transform">
      {/* High-Performance Direct Hardware-Accelerated Glow */}
      <div 
        ref={glowRef}
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-15 bg-primary blur-[80px] pointer-events-none transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: 'translate3d(-500px, -500px, 0)' }}
      />
      
      {/* Cyber Background Grid */}
      <div className="absolute inset-0 cyber-grid opacity-25" />
      
      {/* Subtle Static Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,2,4,0.75)_100%)]" />

      {/* Lightweight Floating Nodes with pure CSS transitions (Zero React Overhead) */}
      {STATIC_NODES.map(node => (
        <div
          key={node.id}
          className={`absolute rounded-full ${node.color} opacity-40 shadow-[0_0_6px_currentColor] pointer-events-none`}
          style={{
            width: `${node.size}px`,
            height: `${node.size}px`,
            left: `${node.startX}%`,
            top: `${node.startY}%`,
            animation: `floatNode ${node.duration} ease-in-out infinite alternate`,
            animationDelay: node.delay,
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </div>
  );
});
