import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';

interface CinematicMetallicAstraLogoProps {
  size?: 'normal' | 'large' | 'idle';
  showTagline?: boolean;
  interactive?: boolean;
  taglineText?: string;
}

export function CinematicMetallicAstraLogo({
  size = 'normal',
  showTagline = true,
  interactive = true,
  taglineText = 'Vigilance Beyond Boundaries',
}: CinematicMetallicAstraLogoProps) {
  // Mouse parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for 3D tilt
  const springConfig = { damping: 25, stiffness: 120 };
  const smoothRotateX = useSpring(useTransform(mouseY, [-400, 400], [14, -14]), springConfig);
  const smoothRotateY = useSpring(useTransform(mouseX, [-600, 600], [-18, 18]), springConfig);
  const smoothTranslateZ = useSpring(useTransform(mouseX, [-600, 600], [-10, 10]), springConfig);

  useEffect(() => {
    if (!interactive) return;
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive, mouseX, mouseY]);

  const shieldDimension = size === 'idle' ? 140 : size === 'large' ? 160 : 120;
  const titleSize = size === 'idle' ? 'text-7xl sm:text-8xl md:text-9xl' : size === 'large' ? 'text-7xl sm:text-8xl md:text-9xl' : 'text-6xl sm:text-7xl md:text-8xl';

  return (
    <div className="relative flex flex-col items-center justify-center select-none perspective-[1400px]">
      <style>{`
        @keyframes metallicChromeSheen {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 250% 0;
          }
        }

        @keyframes corePulseGlow {
          0%, 100% {
            filter: drop-shadow(0 0 25px rgba(5,217,232,0.65)) drop-shadow(0 0 60px rgba(5,217,232,0.35));
          }
          50% {
            filter: drop-shadow(0 0 45px rgba(5,217,232,0.95)) drop-shadow(0 0 90px rgba(0,255,200,0.55));
          }
        }

        .metallic-text {
          background: linear-gradient(
            135deg,
            #ffffff 0%,
            #e2e8f0 18%,
            #7dd3fc 35%,
            #05d9e8 50%,
            #0284c7 65%,
            #ffffff 82%,
            #38bdf8 100%
          );
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: metallicChromeSheen 8s ease-in-out infinite alternate;
        }
      `}</style>

      {/* ── Refined Dark Volumetric Glow (No Cross Lines, No Middle Lines) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
        {/* Soft Volumetric Depth of Field Glow */}
        <div className="absolute w-[700px] h-[450px] bg-gradient-to-r from-primary/10 via-cyan-400/15 to-transparent rounded-full blur-[130px] opacity-70 pointer-events-none" />
        <div className="absolute w-[500px] h-[300px] bg-gradient-to-r from-indigo-500/10 via-primary/15 to-emerald-400/10 rounded-full blur-[90px] opacity-50 pointer-events-none" />
      </div>

      {/* ── 3D Floating Metallic Emblem & Mark ────────────────────────────── */}
      <motion.div
        style={{
          rotateX: smoothRotateX,
          rotateY: smoothRotateY,
          translateZ: smoothTranslateZ,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center justify-center text-center cursor-pointer"
      >
        {/* Clean Centerpiece Shield (No Enclosing Box) */}
        <div className="relative mb-3 sm:mb-5 group">
          {/* Depth of Field Backing Aura */}
          <div className="absolute inset-0 bg-primary/25 rounded-full blur-[45px] scale-125 group-hover:scale-150 transition-all duration-700 pointer-events-none" />

          {/* Glossy Center Mark */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative z-10 flex items-center justify-center"
            style={{ animation: 'corePulseGlow 4s ease-in-out infinite' }}
          >
            <Shield
              size={shieldDimension}
              className="text-cyan-300 drop-shadow-[0_0_30px_rgba(5,217,232,0.85)] filter drop-shadow(0 15px 25px rgba(0,0,0,0.8))"
              strokeWidth={1.8}
            />
            {/* Internal Star Core */}
            <Sparkles
              size={shieldDimension * 0.45}
              className="absolute text-white animate-spin-slow drop-shadow-[0_0_20px_rgba(255,255,255,0.95)]"
            />
          </motion.div>
        </div>

        {/* ── Glossy Metallic Centerpiece Title: ASTRA (No Middle Line) ───── */}
        <div className="relative">
          <h1 
            className={`font-black tracking-[0.24em] uppercase metallic-text leading-none select-none ${titleSize}`}
            style={{
              textShadow: '0 10px 40px rgba(0, 0, 0, 0.9), 0 0 35px rgba(5, 217, 232, 0.5)',
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.95))',
              WebkitTextStroke: '1px rgba(255, 255, 255, 0.35)',
            }}
          >
            ASTRA
          </h1>
        </div>

        {/* ── Tagline: Minimal Design & Smooth Motion ─────────────────────── */}
        {showTagline && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-6 flex items-center gap-3 font-mono tracking-[0.3em] uppercase text-xs sm:text-sm md:text-base text-cyan-200/90"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(5,217,232,0.9)] animate-ping" />
            <span className="text-white/40 tracking-normal">&lt;</span>
            <span className="font-bold text-glow tracking-widest">{taglineText}</span>
            <span className="text-white/40 tracking-normal">&gt;</span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(5,217,232,0.9)]" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default CinematicMetallicAstraLogo;
