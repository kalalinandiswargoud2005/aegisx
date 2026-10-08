import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Globe, Maximize, Minimize, GraduationCap, Play, Shield } from 'lucide-react';
import { Tooltip } from '@/components/ui';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { triggerCollegeLogoShowcase } from '@/components/CollegeLogoShowcaseModal';
import { triggerVideoShowcase } from '@/components/VideoShowcaseModal';
import { motion } from 'framer-motion';

export function Header() {
  const navigate = useNavigate();
  const { isConnected } = useWebSocket();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between glass-panel !overflow-visible border-b border-x-0 border-t-0 px-4 md:px-6 backdrop-blur-xl">
      {/* Left Title / Status Indicator (Search box removed) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <Shield size={18} className="text-primary animate-pulse" />
          <span className="font-mono text-xs sm:text-sm tracking-widest font-bold text-primary uppercase">
            ASTRA AUTONOMOUS DEFENSE
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Live C2 Backend Connection Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-mono font-bold border transition-all ${
          isConnected
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            : 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]'
        }`}>
          <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-400 animate-ping'}`} />
          <span className="hidden sm:inline">{isConnected ? 'C2 ACTIVE' : 'WAKING UP C2...'}</span>
          <span className="sm:hidden">{isConnected ? 'C2' : 'SYNC'}</span>
        </div>

        {/* College Logo Showcase Button */}
        <Tooltip content="Showcase Malla Reddy University Crest (Full Screen 4K)">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              triggerCollegeLogoShowcase();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 hover:border-amber-400 transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer"
          >
            <GraduationCap size={16} className="text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">COLLEGE LOGO</span>
            <span className="sm:hidden">MRU</span>
          </motion.button>
        </Tooltip>

        {/* Cinematic Video Showcase Button (Pure Fullscreen Modal) */}
        <Tooltip content="Watch Hardware Demo Video (Full Screen)">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              triggerVideoShowcase();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
          >
            <Play size={16} className="text-cyan-400 fill-cyan-400" />
            <span className="hidden sm:inline">VIDEO DEMO</span>
            <span className="sm:hidden">VIDEO</span>
          </motion.button>
        </Tooltip>


        {/* On-Screen Fullscreen / Kiosk Toggle for Touchscreen */}
        <Tooltip content={isFullscreen ? "Exit Fullscreen (Kiosk)" : "Enter Fullscreen (Kiosk)"}>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="rounded-full p-2 text-white/80 hover:text-white transition-colors border border-white/10 hover:border-white/30"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </motion.button>
        </Tooltip>

        {/* Manual World Threat Map Button */}
        <Tooltip content="Launch World Threat Map War Room">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('trigger-idle-screensaver'));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-mono font-bold bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 transition-all shadow-[0_0_15px_rgba(5,217,232,0.3)]"
          >
            <Globe size={16} className="animate-spin text-primary" style={{ animationDuration: '12s' }} />
            <span className="hidden sm:inline">THREAT MAP</span>
            <span className="sm:hidden">MAP</span>
          </motion.button>
        </Tooltip>

        {/* Notifications & Threat Radar */}
        <Tooltip content="Notifications & Threat Radar">
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/threats')}
            className="relative rounded-full p-2 text-white/80 hover:text-white transition-colors border border-white/10 hover:border-white/30 cursor-pointer"
          >
            <Bell size={18} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(255,61,113,0.8)]" />
          </motion.button>
        </Tooltip>

        {/* Clock */}
        <div className="text-xs sm:text-sm font-mono font-bold text-white/70 hidden md:block pl-1">
          {new Date().toLocaleTimeString(navigator.language, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </header>
  );
}

