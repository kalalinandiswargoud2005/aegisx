import React from 'react';
import { Search, Bell, Moon, Sun, Globe, Mic } from 'lucide-react';
import { Input, Avatar, Tooltip } from '@/components/ui';
import { useTheme } from '@/providers/theme-provider';
import { motion } from 'framer-motion';

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between glass-panel border-b border-x-0 border-t-0 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4 w-1/3">
        <motion.div 
          className="w-full relative group"
          whileFocus="focus"
          whileHover="hover"
        >
          <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
          <Input
            icon={<Search size={16} className="text-white/50 group-hover:text-primary transition-colors" />}
            placeholder="Search endpoints, threats, alerts..."
            className="w-full max-w-md bg-surface/50 border-white/5 focus:border-primary/50 focus:bg-surface/80 transition-all duration-300 relative z-10 hover:border-primary/30"
          />
        </motion.div>
      </div>

      <div className="flex items-center gap-4">
        {/* Manual World Threat Map Button */}
        <Tooltip content="Launch World Threat Map War Room">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('trigger-idle-screensaver'));
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 transition-all shadow-[0_0_15px_rgba(5,217,232,0.25)]"
          >
            <Globe size={15} className="animate-spin text-primary" style={{ animationDuration: '12s' }} />
            <span>WORLD THREAT MAP</span>
          </motion.button>
        </Tooltip>
        <div className="text-sm text-white/50 hidden md:block">
          {new Date().toLocaleTimeString(navigator.language, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
        
        <Tooltip content="Notifications">
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="relative rounded-full p-2 text-white/70 hover:text-white transition-colors border border-transparent hover:border-white/20"
          >
            <Bell size={20} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(255,61,113,0.8)]" />
          </motion.button>
        </Tooltip>

        <Tooltip content="Toggle Theme">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full p-2 text-white/70 hover:text-white transition-colors border border-transparent hover:border-white/20"
          >
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>
        </Tooltip>

        <div className="h-6 w-px bg-white/10 mx-2 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />

        <Tooltip content="Profile & Settings">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-primary/50 transition-all outline-none shadow-[0_0_15px_rgba(5,217,232,0.1)] hover:shadow-[0_0_20px_rgba(5,217,232,0.3)]"
          >
            <Avatar fallback="AX" size="sm" />
          </motion.button>
        </Tooltip>
      </div>
    </header>
  );
}
