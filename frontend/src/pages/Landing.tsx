import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Terminal } from 'lucide-react';
import { Button } from '@/components/ui';

// ── Exported Background Utilities (used by IdleGlobeOverlay) ─────────────────
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const count = 70;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      decay: (Math.random() - 0.5) * 0.002,
    }));

    const draw = () => {
      ctx.fillStyle = 'rgba(6, 9, 14, 0.25)';
      ctx.fillRect(0, 0, W, H);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.decay;
        if (p.alpha <= 0.05) p.decay = Math.abs(p.decay);
        if (p.alpha >= 0.55) p.decay = -Math.abs(p.decay);
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const strength = (1 - dist / 120) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${strength})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />;
}

export function MouseSpotlight() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{
        background: `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, rgba(0,229,255,0.04) 0%, transparent 70%)`,
        transition: 'background 0.1s ease',
      }}
    />
  );
}

export function PulseRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-cyan-500/10 animate-ping"
          style={{
            width: `${200 + i * 140}px`,
            height: `${200 + i * 140}px`,
            animationDuration: `${3 + i}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Main Landing Page (Classic App Name Showcase) ───────────────────────────
export function Landing() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleEnter = () => {
    navigate('/dashboard'); 
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020204] overflow-hidden flex flex-col items-center justify-center font-rajdhani">
      {/* Background Interactive Glow */}
      <motion.div 
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-[100px] bg-primary"
        animate={{
          x: mousePosition.x - 300,
          y: mousePosition.y - 300,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
      />
      
      {/* Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="mb-6 relative">
             <ShieldAlert size={100} className="text-primary text-glow drop-shadow-[0_0_25px_rgba(5,217,232,0.8)]" />
             <motion.div
               animate={{ opacity: [0, 1, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 bg-primary/20 blur-xl rounded-full"
             />
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary tracking-[0.2em] uppercase mb-3" style={{ WebkitTextStroke: '2px rgba(5,217,232,0.5)', textShadow: '0 0 20px rgba(5,217,232,0.4)' }}>
            ASTRA
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-lg sm:text-xl md:text-2xl text-primary/80 font-mono tracking-widest mb-8 sm:mb-14 uppercase flex items-center gap-3"
          >
            <span className="text-secondary animate-pulse">{'>'}</span> 
            Vigilance Beyond Boundaries
            <span className="text-secondary animate-pulse">_</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <Button 
              size="lg" 
              onClick={handleEnter}
              className="text-lg px-10 py-5 bg-primary/10 text-primary border border-primary hover:bg-primary hover:text-[#020204] shadow-[0_0_30px_rgba(5,217,232,0.3)] hover:shadow-[0_0_50px_rgba(5,217,232,0.8)] transition-all duration-300 group relative overflow-hidden cyber-cut cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              <Terminal size={24} className="mr-3" />
              INITIALIZE SYSTEM
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Footer text */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-4 sm:bottom-8 text-white/40 font-mono text-xs sm:text-sm flex gap-4"
      >
        <span>v2.0.4-CYBER</span>
        <span>|</span>
        <span className="animate-pulse">SECURE CONNECTION ESTABLISHED</span>
      </motion.div>
    </div>
  );
}
