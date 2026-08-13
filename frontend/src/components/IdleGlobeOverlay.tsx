import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface City {
  name: string;
  x: number;
  y: number;
  country: string;
}

const GLOBAL_NODES: City[] = [
  { name: 'SAN FRANCISCO', x: 0.18, y: 0.38, country: 'USA' },
  { name: 'NEW YORK', x: 0.29, y: 0.35, country: 'USA' },
  { name: 'LONDON', x: 0.48, y: 0.28, country: 'UK' },
  { name: 'BERLIN', x: 0.53, y: 0.26, country: 'GERMANY' },
  { name: 'TOKYO', x: 0.85, y: 0.38, country: 'JAPAN' },
  { name: 'SEOUL', x: 0.82, y: 0.36, country: 'SOUTH KOREA' },
  { name: 'MUMBAI', x: 0.69, y: 0.48, country: 'INDIA' },
  { name: 'SINGAPORE', x: 0.78, y: 0.58, country: 'SINGAPORE' },
  { name: 'SYDNEY', x: 0.89, y: 0.78, country: 'AUSTRALIA' },
  { name: 'SAO PAULO', x: 0.35, y: 0.72, country: 'BRAZIL' },
  { name: 'CAIRO', x: 0.57, y: 0.44, country: 'EGYPT' },
];

interface LaserBeam {
  id: number;
  src: City;
  dst: City;
  progress: number;
  color: string;
  speed: number;
}

const BEAM_COLORS = ['#ef4444', '#05d9e8', '#f97316', '#a855f7', '#10b981'];

export function IdleGlobeOverlay() {
  const navigate = useNavigate();
  const [isIdle, setIsIdle] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const laserBeamsRef = useRef<LaserBeam[]>([]);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleExitToDashboard = () => {
    setIsIdle(false);
    navigate('/dashboard');
  };

  // 1. Inactivity & Manual Trigger Listener
  useEffect(() => {
    const IDLE_THRESHOLD_MS = 60000; // 60s idle threshold

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, IDLE_THRESHOLD_MS);
    };

    // ONLY dismiss and redirect to dashboard when Enter or Escape is pressed
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isIdle && (e.key === 'Enter' || e.key === 'Escape')) {
        handleExitToDashboard();
        resetIdleTimer();
      }
    };

    const handleManualTrigger = () => {
      setIsIdle(true);
    };

    // Reset inactivity timer on mouse movements, but DO NOT dismiss active screen on mouse move!
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

  // 2. Spawn Laser Beams
  useEffect(() => {
    if (!isIdle) return;

    const spawnInterval = setInterval(() => {
      const src = GLOBAL_NODES[Math.floor(Math.random() * GLOBAL_NODES.length)];
      let dst = GLOBAL_NODES[Math.floor(Math.random() * GLOBAL_NODES.length)];
      while (dst.name === src.name) {
        dst = GLOBAL_NODES[Math.floor(Math.random() * GLOBAL_NODES.length)];
      }

      const color = BEAM_COLORS[Math.floor(Math.random() * BEAM_COLORS.length)];
      const newBeam: LaserBeam = {
        id: Date.now() + Math.random(),
        src,
        dst,
        progress: 0,
        color,
        speed: 0.01 + Math.random() * 0.012,
      };

      laserBeamsRef.current = [newBeam, ...laserBeamsRef.current].slice(0, 14);
    }, 900);

    return () => clearInterval(spawnInterval);
  }, [isIdle]);

  // 3. Canvas Rendering
  useEffect(() => {
    if (!isIdle || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = (canvas.width = canvas.offsetWidth);
      const height = (canvas.height = canvas.offsetHeight);

      ctx.clearRect(0, 0, width, height);

      // Draw Connection Lines
      ctx.strokeStyle = 'rgba(5, 217, 232, 0.08)';
      ctx.lineWidth = 1;
      GLOBAL_NODES.forEach((node1, idx) => {
        GLOBAL_NODES.slice(idx + 1).forEach((node2) => {
          ctx.beginPath();
          ctx.moveTo(node1.x * width, node1.y * height);
          ctx.lineTo(node2.x * width, node2.y * height);
          ctx.stroke();
        });
      });

      // Draw Laser Arc Beams
      laserBeamsRef.current.forEach((beam) => {
        beam.progress += beam.speed;
        if (beam.progress > 1) beam.progress = 0;

        const x1 = beam.src.x * width;
        const y1 = beam.src.y * height;
        const x2 = beam.dst.x * width;
        const y2 = beam.dst.y * height;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.25;

        // Firing Arc
        ctx.strokeStyle = beam.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = beam.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(midX, midY, x2, y2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Moving Pulse Bullet
        const t = beam.progress;
        const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
        const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = beam.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Target Impact Ring
        if (t > 0.88) {
          ctx.strokeStyle = beam.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x2, y2, (t - 0.88) * 140, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isIdle]);

  if (!isIdle) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-[#020617] text-white font-mono select-none overflow-hidden"
      >
        {/* Background Visual Layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/40 via-[#020617] to-[#020617] pointer-events-none" />
        <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />

        {/* Vector World Map Background */}
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-50 filter drop-shadow-[0_0_35px_rgba(5,217,232,0.4)] pointer-events-none"
          style={{
            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')`,
            filter: 'invert(58%) sepia(85%) saturate(452%) hue-rotate(140deg) brightness(95%) contrast(92%)',
          }}
        />

        {/* Canvas Animation Layer */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />

        {/* Pulsing City Nodes */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {GLOBAL_NODES.map((city) => (
            <div
              key={city.name}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${city.x * 100}%`, top: `${city.y * 100}%` }}
            >
              <div className="relative flex items-center justify-center w-4 h-4">
                <div className="absolute inset-0 rounded-full bg-primary/60 animate-ping" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary border border-black shadow-[0_0_12px_#05d9e8]" />
              </div>
              <span className="mt-1 text-[9px] font-mono font-bold text-cyan-300 tracking-wider opacity-80">
                {city.name}
              </span>
            </div>
          ))}
        </div>

        {/* Top Right Exit Button */}
        <div className="relative z-30 flex justify-end p-6">
          <button
            onClick={handleExitToDashboard}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/60 hover:bg-primary/20 border border-primary/40 text-primary text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(5,217,232,0.2)]"
          >
            <X size={14} />
            <span>EXIT MAP (ESC / ENTER)</span>
          </button>
        </div>

        {/* Bottom App Name Header (PLACED AFTER / BELOW THE MAP AT THE BOTTOM) */}
        <div className="relative z-30 pb-10 text-center pointer-events-none">
          <h1 className="font-rajdhani font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-[0.25em] text-glow text-primary drop-shadow-[0_0_35px_rgba(5,217,232,0.8)] uppercase">
            ASTRA
          </h1>
          <p className="text-xs sm:text-sm text-cyan-300/80 font-mono tracking-[0.35em] uppercase mt-1 drop-shadow-[0_0_10px_rgba(5,217,232,0.4)]">
            VIGILANCE BEYOND BOUNDARIES
          </p>
          <div className="mt-4 inline-block px-4 py-1 bg-black/80 border border-primary/40 text-[11px] font-mono font-bold text-white/60 tracking-[0.2em] uppercase animate-pulse">
            PRESS ENTER OR ESC TO RESUME CONTROL
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
