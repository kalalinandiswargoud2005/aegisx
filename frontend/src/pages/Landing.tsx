import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

// ── Particle canvas background ──────────────────────────────────────────────
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

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      r: number; alpha: number;
      decay: number;
    }

    // Create sparse, slow-drifting dust particles
    const count = 120;
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      decay: (Math.random() - 0.5) * 0.002,
    }));

    // Slowly pulsing connection lines
    const draw = () => {
      ctx.fillStyle = 'rgba(2, 2, 6, 0.25)';
      ctx.fillRect(0, 0, W, H);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.decay;
        if (p.alpha <= 0.05) p.decay = Math.abs(p.decay);
        if (p.alpha >= 0.55) p.decay = -Math.abs(p.decay);
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        // Particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(5, 217, 232, ${p.alpha})`;
        ctx.fill();

        // Connect close particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const strength = (1 - dist / 130) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(5, 217, 232, ${strength})`;
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

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
    />
  );
}

// ── Animated spotlight that follows mouse ────────────────────────────────────
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
        background: `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, rgba(5,217,232,0.04) 0%, transparent 70%)`,
        transition: 'background 0.1s ease',
      }}
    />
  );
}

// ── Pulsing circle rings ─────────────────────────────────────────────────────
export function PulseRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
      {[1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-primary/10"
          initial={{ width: 200, height: 200, opacity: 0 }}
          animate={{
            width: [200 + i * 120, 260 + i * 120],
            height: [200 + i * 120, 260 + i * 120],
            opacity: [0.18, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// ── Main Landing Page ────────────────────────────────────────────────────────
export function Landing() {
  const navigate = useNavigate();

  const tagline = ['DETECT', 'DEFEND', 'DEFEAT'];

  const letterVariants: any = {
    hidden: { opacity: 0, y: 80 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.4 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-[#02020a]">
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



      {/* MAIN HERO */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 select-none">

        {/* Shield icon */}





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
          transition={{ delay: 1.2, duration: 0.9 }}
          className="mb-14 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-4 md:gap-8">
            {tagline.map((word, idx) => (
              <React.Fragment key={word}>
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + idx * 0.15, duration: 0.6 }}
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
                    transition={{ delay: 1.5 + idx * 0.15 }}
                    className="text-white/15 text-3xl font-thin"
                  >
                    ·
                  </motion.span>
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.7, type: 'spring', stiffness: 150 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group relative flex items-center gap-4 px-10 py-4 rounded-full font-bold text-base uppercase tracking-[0.15em] overflow-hidden transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(5,217,232,0.12) 0%, rgba(255,0,127,0.08) 100%)',
              border: '1px solid rgba(5,217,232,0.4)',
              color: '#05D9E8',
              boxShadow: '0 0 30px rgba(5,217,232,0.12)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.boxShadow = '0 0 50px rgba(5,217,232,0.3), 0 0 100px rgba(5,217,232,0.1)';
              el.style.borderColor = 'rgba(5,217,232,0.8)';
              el.style.background = 'linear-gradient(135deg, rgba(5,217,232,0.18) 0%, rgba(255,0,127,0.12) 100%)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.boxShadow = '0 0 30px rgba(5,217,232,0.12)';
              el.style.borderColor = 'rgba(5,217,232,0.4)';
              el.style.background = 'linear-gradient(135deg, rgba(5,217,232,0.12) 0%, rgba(255,0,127,0.08) 100%)';
            }}
          >
            {/* Sweep shimmer */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <span className="relative">Access Command Center</span>
            <ArrowRight size={18} className="relative group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>


        </motion.div>


      </div>


    </div>
  );
}
