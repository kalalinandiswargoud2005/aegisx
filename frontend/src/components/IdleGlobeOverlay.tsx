import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ParticleField } from '@/pages/Landing';

export function IdleGlobeOverlay() {
  const navigate = useNavigate();
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 60000); // 60s idle threshold
  };

  const handleExitToDashboard = () => {
    setIsIdle(false);
    resetIdleTimer();
    navigate('/dashboard');
  };

  // Inactivity & Manual Trigger Listener
  useEffect(() => {
    const handleKeyDown = () => {
      if (isIdle) {
        handleExitToDashboard();
      }
    };

    const handleManualTrigger = () => {
      setIsIdle(true);
    };

    const handleMouseActivity = () => {
      if (!isIdle) {
        resetIdleTimer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseActivity);
    window.addEventListener('mousedown', handleMouseActivity);
    window.addEventListener('touchstart', handleMouseActivity);
    window.addEventListener('trigger-idle-screensaver', handleManualTrigger);

    resetIdleTimer();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseActivity);
      window.removeEventListener('mousedown', handleMouseActivity);
      window.removeEventListener('touchstart', handleMouseActivity);
      window.removeEventListener('trigger-idle-screensaver', handleManualTrigger);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isIdle]);

  if (!isIdle) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleExitToDashboard}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white font-mono select-none overflow-hidden cursor-pointer"
      >
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

        {/* Powerful Center Volumetric Neon Glow */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(5,217,232,0.22) 0%, rgba(0,229,255,0.08) 45%, rgba(0,0,0,0.92) 80%)',
          }}
        />

        {/* Top Right Highlighted Exit Button */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExitToDashboard();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-black/80 hover:bg-primary/30 border-2 border-primary text-primary hover:text-white text-xs sm:text-sm font-mono font-black tracking-widest transition-all cursor-pointer shadow-[0_0_20px_rgba(5,217,232,0.6)] hover:shadow-[0_0_35px_rgba(5,217,232,1)] uppercase rounded-md"
          >
            <X size={16} className="text-primary animate-pulse" />
            <span>RETURN TO DASHBOARD</span>
          </button>
        </div>

        {/* Main Centerpiece Highlighted Container */}
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
            className="mt-6 sm:mt-8 mb-12 sm:mb-16 flex items-center justify-center gap-3 sm:gap-6 flex-wrap"
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

          {/* Super Highlighted Bottom Prompt Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="px-6 sm:px-8 py-3 bg-black/90 border-2 border-primary text-xs sm:text-sm md:text-base font-mono font-black text-white tracking-[0.25em] uppercase animate-pulse shadow-[0_0_30px_rgba(5,217,232,0.75)] rounded-md"
          >
            PRESS ANY KEY OR CLICK TO RETURN TO DASHBOARD
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default IdleGlobeOverlay;
