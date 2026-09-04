import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ParticleField, MouseSpotlight, PulseRings } from '@/pages/Landing';

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

  // 1. Inactivity & Manual Trigger Listener
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

  const tagline = ['DETECT', 'DEFEND', 'DEFEAT'];
  const letterVariants: any = {
    hidden: { opacity: 0, y: 80 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.2 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleExitToDashboard}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#02020a] text-white font-mono select-none overflow-hidden cursor-pointer"
      >
        {/* Layered background */}
        <ParticleField />
        <MouseSpotlight />
        <PulseRings />

        {/* Deep radial glow in center */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(5,217,232,0.06) 0%, rgba(255,0,127,0.03) 50%, transparent 80%)',
          }}
        />

        {/* Corner decorations */}
        {/* TL */}
        <div className="absolute top-0 left-0 z-10 pointer-events-none">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <path d="M2 60 L2 2 L60 2" stroke="rgba(5,217,232,0.25)" strokeWidth="1.5" fill="none"/>
            <circle cx="2" cy="2" r="3" fill="#05D9E8" opacity="0.5"/>
          </svg>
        </div>
        {/* TR */}
        <div className="absolute top-0 right-0 z-10 pointer-events-none">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <path d="M118 60 L118 2 L60 2" stroke="rgba(5,217,232,0.25)" strokeWidth="1.5" fill="none"/>
            <circle cx="118" cy="2" r="3" fill="#05D9E8" opacity="0.5"/>
          </svg>
        </div>
        {/* BL */}
        <div className="absolute bottom-0 left-0 z-10 pointer-events-none">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <path d="M2 60 L2 118 L60 118" stroke="rgba(255,0,127,0.2)" strokeWidth="1.5" fill="none"/>
            <circle cx="2" cy="118" r="3" fill="#FF007F" opacity="0.4"/>
          </svg>
        </div>
        {/* BR */}
        <div className="absolute bottom-0 right-0 z-10 pointer-events-none">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <path d="M118 60 L118 118 L60 118" stroke="rgba(255,0,127,0.2)" strokeWidth="1.5" fill="none"/>
            <circle cx="118" cy="118" r="3" fill="#FF007F" opacity="0.4"/>
          </svg>
        </div>

        {/* Top Right Exit Button */}
        <div className="absolute top-0 right-0 z-30 flex justify-end p-6 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExitToDashboard();
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/60 hover:bg-primary/20 border border-primary/40 text-primary text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(5,217,232,0.2)]"
          >
            <X size={14} />
            <span>RETURN TO DASHBOARD</span>
          </button>
        </div>

        {/* MAIN HERO */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
          
          {/* Title — split into individual letters */}
          <div
            className="flex justify-center font-black text-[clamp(7rem,22vw,16rem)] leading-none mb-3"
            aria-label="ASTRA"
          >
            {'ASTRA'.split('').map((ch, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                style={{
                  background: 'linear-gradient(170deg, #ffffff 20%, #05D9E8 55%, #FF007F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  WebkitTextStroke: '1px rgba(5,217,232,0.15)',
                  filter: 'drop-shadow(0 0 40px rgba(5,217,232,0.6)) drop-shadow(0 0 80px rgba(5,217,232,0.25))',
                  letterSpacing: '-0.03em',
                  fontWeight: 900,
                }}
              >
                {ch}
              </motion.span>
            ))}
          </div>

          {/* TAGLINE — DETECT · DEFEND · DEFEAT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.9 }}
            className="mb-14 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-4 md:gap-8">
              {tagline.map((word, idx) => (
                <React.Fragment key={word}>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 + idx * 0.15, duration: 0.6 }}
                    className="text-xl md:text-3xl font-black tracking-[0.15em] uppercase"
                    style={{
                      color: ['#05D9E8', '#FF007F', '#F3E600'][idx],
                      textShadow: `0 0 20px ${['rgba(5,217,232,0.5)', 'rgba(255,0,127,0.5)', 'rgba(243,230,0,0.5)'][idx]}`,
                    }}
                  >
                    {word}
                  </motion.span>
                  {idx < 2 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1 + idx * 0.15 }}
                      className="text-white/15 text-3xl font-thin"
                    >
                      ·
                    </motion.span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 1 }}
            className="mt-8 inline-block px-4 py-2 bg-black/80 border border-primary/40 text-[11px] font-mono font-bold text-white/60 tracking-[0.2em] uppercase animate-pulse"
          >
            PRESS ANY KEY OR CLICK TO RETURN TO DASHBOARD
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
