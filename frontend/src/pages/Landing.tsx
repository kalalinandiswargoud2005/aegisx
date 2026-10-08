import React, { useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui';

// ── Exported Background Utilities (used by IdleGlobeOverlay) ─────────────────
export const ParticleField = memo(function ParticleField() {
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
    window.addEventListener('resize', resize, { passive: true });

    const count = 45;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      decay: (Math.random() - 0.5) * 0.002,
    }));

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const draw = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(draw);
        return;
      }
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.decay;
        if (p.alpha <= 0.1) p.decay = Math.abs(p.decay);
        if (p.alpha >= 0.8) p.decay = -Math.abs(p.decay);
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(5, 217, 232, ${p.alpha})`;
        ctx.shadowColor = '#05D9E8';
        ctx.shadowBlur = 8;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const strength = (1 - dist / 110) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(5, 217, 232, ${strength})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none will-change-transform" />;
});

export const MouseSpotlight = memo(function MouseSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        if (spotlightRef.current) {
          spotlightRef.current.style.transform = `translate3d(${e.clientX - 250}px, ${e.clientY - 250}px, 0)`;
        }
        rafRef.current = null;
      });
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      className="pointer-events-none fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-cyan-400/15 blur-[90px] z-[1] will-change-transform transition-transform duration-150 ease-out"
      style={{ transform: 'translate3d(-1000px, -1000px, 0)' }}
    />
  );
});

export const PulseRings = memo(function PulseRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-cyan-500/15 animate-ping pointer-events-none"
          style={{
            width: `${200 + i * 140}px`,
            height: `${200 + i * 140}px`,
            animationDuration: `${3 + i}s`,
          }}
        />
      ))}
    </div>
  );
});

// ── Main Landing / First Home Page ──────────────────────────────────────────
export function Landing() {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate('/dashboard'); 
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-center font-mono select-none">
      <style>{`
        @keyframes highGlowPulse {
          0%, 100% {
            filter: drop-shadow(0 0 35px #05D9E8) drop-shadow(0 0 70px #00E5FF) drop-shadow(0 0 110px rgba(5,217,232,0.85));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 50px #05D9E8) drop-shadow(0 0 95px #00E5FF) drop-shadow(0 0 140px rgba(0,229,255,1));
            transform: scale(1.02);
          }
        }
        .astra-highlight-title {
          background: linear-gradient(180deg, #FFFFFF 0%, #E0F2FE 20%, #38BDF8 55%, #05D9E8 85%, #0284C7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: highGlowPulse 3s ease-in-out infinite alternate;
        }
      `}</style>

      {/* Space Starry Particle Field */}
      <ParticleField />
      <MouseSpotlight />
      <PulseRings />

      {/* Deep ambient radial glow */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(5,217,232,0.2) 0%, rgba(0,229,255,0.06) 45%, rgba(0,0,0,0.92) 80%)',
        }}
      />

      {/* Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none"></div>

      {/* Main Centerpiece Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-6xl">
        {/* ASTRA Title - Super Highlighted */}
        <motion.h1
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-8xl sm:text-9xl md:text-[11rem] font-black tracking-[0.24em] uppercase astra-highlight-title leading-none select-none my-3"
          style={{
            WebkitTextStroke: '2px rgba(255, 255, 255, 0.6)',
          }}
        >
          ASTRA
        </motion.h1>

        {/* Super Highlighted Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-6 sm:mt-8 mb-10 sm:mb-12 flex items-center justify-center gap-3 sm:gap-6 flex-wrap"
        >
          <span
            className="text-xl sm:text-3xl md:text-4xl font-black tracking-[0.18em] uppercase px-3 py-1"
            style={{
              color: '#05D9E8',
              textShadow: '0 0 20px #05D9E8, 0 0 40px #05D9E8, 0 0 70px rgba(5,217,232,0.9)',
            }}
          >
            AI-POWERED
          </span>
          <span className="text-white/40 text-2xl hidden sm:inline">•</span>
          <span
            className="text-xl sm:text-3xl md:text-4xl font-black tracking-[0.18em] uppercase px-3 py-1"
            style={{
              color: '#FF007F',
              textShadow: '0 0 20px #FF007F, 0 0 40px #FF007F, 0 0 70px rgba(255,0,127,0.9)',
            }}
          >
            CYBER DEFENSE
          </span>
          <span className="text-white/40 text-2xl hidden sm:inline">•</span>
          <span
            className="text-xl sm:text-3xl md:text-4xl font-black tracking-[0.18em] uppercase px-3 py-1"
            style={{
              color: '#F3E600',
              textShadow: '0 0 20px #F3E600, 0 0 40px #F3E600, 0 0 70px rgba(243,230,0,0.9)',
            }}
          >
            SYSTEM
          </span>
        </motion.div>

        {/* Enter System Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button 
            size="lg" 
            onClick={handleEnter}
            className="text-base sm:text-lg px-10 sm:px-14 py-5 sm:py-6 bg-gradient-to-r from-primary/30 via-cyan-400/40 to-primary/30 text-white font-mono font-black tracking-widest border-2 border-primary hover:border-cyan-200 hover:bg-primary hover:text-black shadow-[0_0_35px_rgba(5,217,232,0.6)] hover:shadow-[0_0_70px_rgba(5,217,232,1)] transition-all duration-300 group relative overflow-hidden cyber-cut cursor-pointer uppercase rounded-md"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
            <Terminal size={22} className="mr-3 text-cyan-300 group-hover:text-black transition-colors" />
            INITIALIZE SYSTEM
          </Button>
        </motion.div>
      </div>
      
      {/* Footer text */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 sm:bottom-6 text-white/50 font-mono text-xs sm:text-sm flex gap-3 tracking-widest uppercase font-bold"
      >
        <span>PRESS ANY KEY OR CLICK TO ENTER SOC</span>
      </motion.div>
    </div>
  );
}

export default Landing;
