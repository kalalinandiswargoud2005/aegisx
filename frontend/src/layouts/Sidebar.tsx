import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { 
  LayoutDashboard, ShieldAlert, Laptop, Eye,
  RotateCcw, FileText, 
  Bot, Settings, Info, Zap,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Command Center', path: '/dashboard' },
  { icon: Laptop, label: 'Active Nodes', path: '/devices' },
  { icon: Eye, label: 'Global Map', path: '/watch' },
  { icon: Zap, label: 'Threat Vectors', path: '/simulation' },
  { icon: ShieldAlert, label: 'Incident Logs', path: '/threats' },
  { icon: RotateCcw, label: 'Recovery', path: '/recovery' },
  { icon: FileText, label: 'Analytics & Reports', path: '/reports' },
  { icon: Bot, label: 'AI Assistant', path: '/ai-assistant' },
  { icon: Settings, label: 'System Parameters', path: '/settings' },
  { icon: Info, label: 'About', path: '/about' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-surface/80 backdrop-blur-xl border-r border-primary/20 shadow-[4px_0_24px_rgba(0,0,0,0.6)] z-40 transition-[width] duration-200 ease-out select-none",
        isCollapsed ? "w-[76px]" : "w-[260px]"
      )}
    >
      <div className="flex h-16 items-center justify-between px-3.5 border-b border-primary/10">
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center bg-primary/20 text-primary cyber-cut group-hover:bg-primary/30 transition-all duration-200">
              <ShieldAlert size={22} />
            </div>
            <span className="font-mono font-bold text-lg text-glow text-primary tracking-widest group-hover:text-white transition-colors duration-200">ASTRA</span>
          </Link>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex h-9 w-9 items-center justify-center text-primary/80 hover:text-primary transition-colors rounded-lg hover:bg-primary/10 cursor-pointer",
            isCollapsed && "mx-auto"
          )}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 px-2.5 py-3 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'text-primary bg-primary/15 border-l-4 border-primary shadow-[inset_10px_0_20px_-10px_rgba(5,217,232,0.4)]'
                    : 'text-white/80 hover:bg-white/5 hover:text-white hover:border-l-4 hover:border-primary/50 border-l-4 border-transparent'
                )
              }
              title={isCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3 w-full">
                  <Icon size={20} className={cn("shrink-0 transition-colors", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(5,217,232,0.8)]" : "text-white/70 group-hover:text-white")} />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis tracking-wide flex items-center">
                      {isActive && <span className="mr-1.5 text-primary">{'>'}</span>}
                      {item.label}
                      {isActive && <span className="ml-1 text-primary animate-pulse">_</span>}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

