import React, { useEffect, useRef, useState } from 'react';
import { Shield, Globe, Maximize2, Activity } from 'lucide-react';

interface City {
  name: string;
  x: number;
  y: number;
  country: string;
  threats: number;
}

const DASHBOARD_CITIES: City[] = [
  { name: 'SAN FRANCISCO', x: 0.18, y: 0.38, country: 'USA', threats: 1420 },
  { name: 'NEW YORK', x: 0.29, y: 0.35, country: 'USA', threats: 2890 },
  { name: 'LONDON', x: 0.48, y: 0.28, country: 'UK', threats: 3100 },
  { name: 'BERLIN', x: 0.53, y: 0.26, country: 'GERMANY', threats: 1950 },
  { name: 'TOKYO', x: 0.85, y: 0.38, country: 'JAPAN', threats: 4120 },
  { name: 'MUMBAI', x: 0.69, y: 0.48, country: 'INDIA', threats: 3780 },
  { name: 'SINGAPORE', x: 0.78, y: 0.58, country: 'SINGAPORE', threats: 1640 },
  { name: 'SYDNEY', x: 0.89, y: 0.78, country: 'AUSTRALIA', threats: 980 },
  { name: 'SAO PAULO', x: 0.35, y: 0.72, country: 'BRAZIL', threats: 1210 },
  { name: 'CAIRO', x: 0.57, y: 0.44, country: 'EGYPT', threats: 850 },
];

interface LaserBeam {
  id: number;
  src: City;
  dst: City;
  progress: number;
  color: string;
  speed: number;
}

const COLORS = ['#ef4444', '#05d9e8', '#f97316', '#a855f7'];

export function DashboardThreatMap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredCity, setHoveredCity] = useState<City | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const laserBeamsRef = useRef<LaserBeam[]>([]);

  // Periodically spawn firing attack arcs
  useEffect(() => {
    const interval = setInterval(() => {
      const src = DASHBOARD_CITIES[Math.floor(Math.random() * DASHBOARD_CITIES.length)];
      let dst = DASHBOARD_CITIES[Math.floor(Math.random() * DASHBOARD_CITIES.length)];
      while (dst.name === src.name) {
        dst = DASHBOARD_CITIES[Math.floor(Math.random() * DASHBOARD_CITIES.length)];
      }

      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      const newBeam: LaserBeam = {
        id: Date.now() + Math.random(),
        src,
        dst,
        progress: 0,
        color,
        speed: 0.018 + Math.random() * 0.01,
      };

      laserBeamsRef.current = [newBeam, ...laserBeamsRef.current].slice(0, 8);
    }, 1300);

    return () => clearInterval(interval);
  }, []);

  // Render Canvas Laser Arcs
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = (canvas.width = canvas.offsetWidth);
      const height = (canvas.height = canvas.offsetHeight);

      ctx.clearRect(0, 0, width, height);

      // Render Laser Beams
      laserBeamsRef.current.forEach((beam) => {
        beam.progress += beam.speed;
        if (beam.progress > 1) beam.progress = 0;

        const x1 = beam.src.x * width;
        const y1 = beam.src.y * height;
        const x2 = beam.dst.x * width;
        const y2 = beam.dst.y * height;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.25;

        // Draw Firing Arc
        ctx.strokeStyle = beam.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = beam.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(midX, midY, x2, y2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw Tracer Bullet
        const t = beam.progress;
        const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
        const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = beam.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    let found: City | null = null;
    DASHBOARD_CITIES.forEach((city) => {
      const cx = city.x * width;
      const cy = city.y * height;
      const dx = mx - cx;
      const dy = my - cy;
      if (dx * dx + dy * dy < 400) {
        found = city;
        setHoverPos({ x: cx, y: cy });
      }
    });

    setHoveredCity(found);
  };

  return (
    <div className="flex flex-col h-full relative font-mono select-none">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-3 z-20">
        <div>
          <h3 className="text-lg font-mono font-bold tracking-widest uppercase text-white flex items-center gap-2">
            <span className="text-primary animate-pulse">{'>'}</span> Global Threat Interception Map
          </h3>
          <p className="text-xs text-white/50 mt-0.5">Real-time C2 telemetry and incident attack trajectories</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/40 text-xs font-mono font-bold text-primary shadow-[0_0_10px_rgba(5,217,232,0.2)]">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            LIVE TELEMETRY
          </span>

          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-primary/40 hover:bg-primary/20 text-xs font-mono font-bold text-primary transition-all cursor-pointer"
            title="Toggle Fullscreen Mode"
          >
            <Maximize2 size={13} />
            <span>FULLSCREEN</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div 
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCity(null)}
        className="relative flex-1 min-h-[300px] w-full border border-primary/20 bg-[#020617] overflow-hidden group"
      >
        {/* Background Cyber Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/30 via-[#020617] to-[#020617] pointer-events-none" />
        <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />

        {/* Vector Map Graphic */}
        <div 
          className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-60 filter drop-shadow-[0_0_20px_rgba(5,217,232,0.3)] pointer-events-none"
          style={{
            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')`,
            filter: 'invert(58%) sepia(85%) saturate(452%) hue-rotate(140deg) brightness(95%) contrast(92%)',
          }}
        />

        {/* Static Map City Nodes */}
        {DASHBOARD_CITIES.map((city) => (
          <div
            key={city.name}
            className="absolute z-10 flex items-center gap-1 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${city.x * 100}%`, top: `${city.y * 100}%` }}
          >
            <div className="relative flex items-center justify-center w-3 h-3">
              <div className="absolute inset-0 rounded-full bg-primary/50 animate-ping" />
              <div className="w-2 h-2 rounded-full bg-primary border border-black shadow-[0_0_8px_#05d9e8]" />
            </div>
            <span className="text-[9px] font-mono font-bold text-cyan-300 bg-black/80 px-1 py-0.5 border border-primary/30 hidden sm:inline">
              {city.name}
            </span>
          </div>
        ))}

        {/* Laser Canvas Layer */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-15 pointer-events-none" />

        {/* Interactive Hover Tooltip */}
        {hoveredCity && hoverPos && (
          <div
            className="absolute z-30 p-2.5 bg-black/90 border border-primary/60 backdrop-blur-md rounded-none shadow-[0_0_20px_rgba(5,217,232,0.4)] pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
            style={{ left: hoverPos.x, top: hoverPos.y }}
          >
            <div className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Activity size={13} className="animate-pulse text-primary" />
              {hoveredCity.name}, {hoveredCity.country}
            </div>
            <div className="text-[10px] text-white/70 mt-1">
              THREATS BLOCKED TODAY: <span className="text-cyan-300 font-bold">{hoveredCity.threats.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-bold">
              🛡️ ASTRA ENDPOINT SHIELD ONLINE
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
