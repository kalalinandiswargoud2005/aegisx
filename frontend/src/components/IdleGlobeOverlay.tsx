import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Globe, Activity, Radio, Cpu, Lock, CheckCircle2, Terminal, AlertTriangle, Monitor } from 'lucide-react';

interface City {
  name: string;
  x: number;
  y: number;
  country: string;
  threats: number;
  ip: string;
}

const GLOBAL_NODES: City[] = [
  { name: 'SAN FRANCISCO', x: 0.18, y: 0.38, country: 'USA', threats: 1420, ip: '108.162.192.1' },
  { name: 'NEW YORK', x: 0.29, y: 0.35, country: 'USA', threats: 2890, ip: '198.51.100.24' },
  { name: 'LONDON', x: 0.48, y: 0.28, country: 'UK', threats: 3100, ip: '185.199.108.153' },
  { name: 'BERLIN', x: 0.53, y: 0.26, country: 'GERMANY', threats: 1950, ip: '194.12.234.12' },
  { name: 'TOKYO', x: 0.85, y: 0.38, country: 'JAPAN', threats: 4120, ip: '202.214.194.88' },
  { name: 'SEOUL', x: 0.82, y: 0.36, country: 'SOUTH KOREA', threats: 2310, ip: '175.207.29.11' },
  { name: 'MUMBAI', x: 0.69, y: 0.48, country: 'INDIA', threats: 3780, ip: '103.21.244.0' },
  { name: 'SINGAPORE', x: 0.78, y: 0.58, country: 'SINGAPORE', threats: 1640, ip: '128.199.200.1' },
  { name: 'SYDNEY', x: 0.89, y: 0.78, country: 'AUSTRALIA', threats: 980, ip: '139.130.4.5' },
  { name: 'SAO PAULO', x: 0.35, y: 0.72, country: 'BRAZIL', threats: 1210, ip: '177.12.44.8' },
  { name: 'CAIRO', x: 0.57, y: 0.44, country: 'EGYPT', threats: 850, ip: '156.204.12.9' },
];

interface LaserBeam {
  id: number;
  src: City;
  dst: City;
  progress: number;
  color: string;
  speed: number;
}

const ATTACK_TYPES = [
  'Ransomware.LockBit.v3 Payload',
  'CVE-2026-8812 Remote Code Execution',
  'DNS Amplification DDoS Attack',
  'APT-41 Zero-Day Exploit Attempt',
  'SqlInjection.BlindBypass.Query',
  'Trojan.Win32.MemoryInjector',
  'C2 CobaltStrike Beacon Handshake',
  'BruteForce.SSH.RootCreds'
];

const BEAM_COLORS = ['#ef4444', '#05d9e8', '#f97316', '#a855f7', '#10b981'];

export function IdleGlobeOverlay() {
  const [isIdle, setIsIdle] = useState(false);
  const [clock, setClock] = useState('');
  const [threatCount, setThreatCount] = useState(14892);
  const [activeLog, setActiveLog] = useState<string>('ASTRA Autonomous Threat Shield active. Monitoring 128 global endpoints.');
  const [hoveredCity, setHoveredCity] = useState<City | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const laserBeamsRef = useRef<LaserBeam[]>([]);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Inactivity & Custom Event Listener
  useEffect(() => {
    const IDLE_THRESHOLD_MS = 60000; // 60s idle threshold

    const handleUserActivity = () => {
      if (isIdle) {
        setIsIdle(false);
      }
      resetIdleTimer();
    };

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, IDLE_THRESHOLD_MS);
    };

    const handleManualTrigger = () => {
      setIsIdle(true);
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((evt) => window.addEventListener(evt, handleUserActivity));
    window.addEventListener('trigger-idle-screensaver', handleManualTrigger);

    resetIdleTimer();

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      window.removeEventListener('trigger-idle-screensaver', handleManualTrigger);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isIdle]);

  // 2. Live UTC Clock & Threat Ticker
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setClock(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 1000);

    const logInterval = setInterval(() => {
      const src = GLOBAL_NODES[Math.floor(Math.random() * GLOBAL_NODES.length)];
      const attack = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
      setActiveLog(`[INTERCEPTED] ${attack} originating from ${src.name} (${src.ip}) — BLOCKED BY ASTRA AGENT in 0.02s`);
      setThreatCount((prev) => prev + 1);
    }, 2800);

    return () => {
      clearInterval(clockInterval);
      clearInterval(logInterval);
    };
  }, []);

  // 3. Spawn Laser Beams
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
        speed: 0.012 + Math.random() * 0.01,
      };

      laserBeamsRef.current = [newBeam, ...laserBeamsRef.current].slice(0, 12);
    }, 1100);

    return () => clearInterval(spawnInterval);
  }, [isIdle]);

  // 4. Canvas Renderer
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

      // Draw Connection Web Grid
      ctx.strokeStyle = 'rgba(5, 217, 232, 0.06)';
      ctx.lineWidth = 1;
      GLOBAL_NODES.forEach((node1, idx) => {
        GLOBAL_NODES.slice(idx + 1).forEach((node2) => {
          ctx.beginPath();
          ctx.moveTo(node1.x * width, node1.y * height);
          ctx.lineTo(node2.x * width, node2.y * height);
          ctx.stroke();
        });
      });

      // Draw Firing Laser Beams
      laserBeamsRef.current.forEach((beam) => {
        beam.progress += beam.speed;
        if (beam.progress > 1) beam.progress = 0;

        const x1 = beam.src.x * width;
        const y1 = beam.src.y * height;
        const x2 = beam.dst.x * width;
        const y2 = beam.dst.y * height;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.22;

        // Curve Line
        ctx.strokeStyle = beam.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = beam.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(midX, midY, x2, y2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Moving Tracer Bullet
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
        if (t > 0.9) {
          ctx.strokeStyle = beam.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x2, y2, (t - 0.9) * 150, 0, Math.PI * 2);
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
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-50 flex flex-col bg-[#020617] text-white font-mono select-none overflow-hidden"
      >
        {/* Ambient Background Visual Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/40 via-[#020617] to-[#020617] pointer-events-none" />
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

        {/* World Map Vector Layer */}
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-40 filter drop-shadow-[0_0_30px_rgba(5,217,232,0.4)] pointer-events-none"
          style={{
            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')`,
            filter: 'invert(58%) sepia(85%) saturate(452%) hue-rotate(140deg) brightness(95%) contrast(92%)',
          }}
        />

        {/* Canvas Layer */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

        {/* City Node Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {GLOBAL_NODES.map((city) => (
            <div
              key={city.name}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5"
              style={{ left: `${city.x * 100}%`, top: `${city.y * 100}%` }}
            >
              <div className="relative flex items-center justify-center w-4 h-4">
                <div className="absolute inset-0 rounded-full bg-primary/60 animate-ping" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary border border-black shadow-[0_0_12px_#05d9e8]" />
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-200 bg-black/80 px-2 py-0.5 border border-primary/40 shadow-[0_0_10px_rgba(5,217,232,0.3)]">
                {city.name}
              </span>
            </div>
          ))}
        </div>

        {/* Top Header HUD Bar */}
        <div className="relative z-30 flex items-center justify-between px-8 py-6 border-b border-primary/20 bg-black/60 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 border border-primary/50 cyber-cut shadow-[0_0_20px_rgba(5,217,232,0.3)]">
              <Shield size={32} className="text-primary animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-rajdhani font-extrabold text-3xl tracking-widest text-glow text-primary">
                  ASTRA
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/40 uppercase">
                  VIGILANCE BEYOND BOUNDARIES
                </span>
              </div>
              <p className="text-xs text-white/60 tracking-wider">
                AUTONOMOUS SECURITY & ENDPOINT THREAT INTELLIGENCE COMMAND
              </p>
            </div>
          </div>

          {/* Right Metrics Header */}
          <div className="flex items-center gap-6 text-right">
            <div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest">SYSTEM CLOCK</div>
              <div className="text-sm font-bold text-primary font-mono">{clock || '2026-08-13 15:05:00 UTC'}</div>
            </div>

            <div className="h-8 w-px bg-primary/20" />

            <div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest">DEFENSE MATRIX</div>
              <div className="text-sm font-bold text-success font-mono flex items-center gap-1.5 justify-end">
                <span className="h-2 w-2 rounded-full bg-success animate-ping" />
                100% OPERATIONAL
              </div>
            </div>
          </div>
        </div>

        {/* Floating HUD Side Cards */}
        <div className="relative z-30 flex-1 p-8 flex justify-between items-start pointer-events-none">
          {/* Left HUD Panel */}
          <div className="w-80 space-y-4">
            <div className="p-4 bg-black/80 border border-primary/40 backdrop-blur-md shadow-[0_0_25px_rgba(5,217,232,0.15)]">
              <div className="text-xs font-bold text-primary tracking-widest uppercase mb-3 flex items-center gap-2">
                <Radio size={16} className="text-primary animate-pulse" /> GLOBAL TELEMETRY STATS
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2">
                  <span className="text-white/60">THREATS INTERCEPTED</span>
                  <span className="font-bold text-danger text-sm">{threatCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2">
                  <span className="text-white/60">ENDPOINTS SHIELDED</span>
                  <span className="font-bold text-primary text-sm">128 ACTIVE</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2">
                  <span className="text-white/60">AVG RESPONSE SPEED</span>
                  <span className="font-bold text-success text-sm">1.2 ms</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">C2 CLOUD PROTOCOL</span>
                  <span className="font-bold text-white text-xs">TLS 1.3 ENCRYPTED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right HUD Panel */}
          <div className="w-80 space-y-4">
            <div className="p-4 bg-black/80 border border-primary/40 backdrop-blur-md shadow-[0_0_25px_rgba(5,217,232,0.15)]">
              <div className="text-xs font-bold text-primary tracking-widest uppercase mb-2 flex items-center gap-2">
                <Cpu size={16} className="text-primary" /> REAL-TIME AGENT HEALTH
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>MEMORY FOOTPRINT</span>
                  <span className="text-primary font-bold">42.8 MB</span>
                </div>
                <div className="w-full bg-white/10 h-1.5">
                  <div className="bg-primary h-full w-[28%]" />
                </div>

                <div className="flex justify-between text-white/70 pt-1">
                  <span>CPU UTILIZATION</span>
                  <span className="text-success font-bold">0.4%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5">
                  <div className="bg-success h-full w-[4%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Ambient HUD Banner & Resume Prompt */}
        <div className="relative z-30 border-t border-primary/20 bg-black/80 backdrop-blur-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-primary font-bold overflow-hidden">
            <Terminal size={16} className="shrink-0 text-primary animate-pulse" />
            <span className="truncate">{activeLog}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0 pl-4">
            <div className="px-4 py-1.5 bg-primary/20 border border-primary/50 text-xs font-mono font-bold text-primary animate-pulse shadow-[0_0_20px_rgba(5,217,232,0.3)]">
              [ MOVE MOUSE OR PRESS ANY KEY TO RESUME ]
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
