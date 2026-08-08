import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { 
  LayoutDashboard, ShieldAlert, Laptop, 
  RotateCcw, Activity, FileText, 
  Bot, BookOpen, Settings, Info, Zap,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Laptop, label: 'Devices', path: '/devices' },
  { icon: Zap, label: 'Simulation', path: '/simulation' },
  { icon: ShieldAlert, label: 'Threat Center', path: '/threats' },
  { icon: RotateCcw, label: 'Recovery', path: '/recovery' },
  { icon: Bot, label: 'AI Assistant', path: '/ai-assistant' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Activity, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: BookOpen, label: 'Documentation', path: '/docs' },
  { icon: Info, label: 'About', path: '/about' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full bg-surface/60 backdrop-blur-xl border-r border-primary/20 shadow-[4px_0_24px_rgba(0,0,0,0.6)] z-40 overflow-visible"
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-primary/10">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Link to="/" className="flex items-center gap-2 group cursor-pointer">
                <motion.div 
                  className="flex h-8 w-8 items-center justify-center bg-primary/20 text-primary cyber-cut group-hover:bg-primary/40 group-hover:scale-110 transition-all duration-300"
                  whileHover={{ rotate: 180 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <ShieldAlert size={20} />
                </motion.div>
                <span className="font-mono font-bold text-lg text-glow text-primary tracking-widest group-hover:text-white transition-colors duration-300">AEGISX</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "rgba(5,217,232,0.2)" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex h-8 w-8 items-center justify-center text-primary/70 hover:text-primary transition-colors rounded-lg hover:bg-primary/10",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </motion.button>
      </div>

      <motion.nav 
        variants={containerVariants} 
        initial="hidden" 
        animate="show"
        className="flex-1 space-y-2 px-3 py-6 overflow-y-auto overflow-x-hidden"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.path} variants={itemVariants}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center px-3 py-2.5 text-sm font-medium transition-all duration-300',
                    isActive
                      ? 'text-primary bg-primary/10 border-l-4 border-primary shadow-[inset_10px_0_20px_-10px_rgba(5,217,232,0.3)]'
                      : 'text-white/70 hover:bg-white/5 hover:text-white hover:border-l-4 hover:border-primary/50 border-l-4 border-transparent'
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <motion.div 
                    className="flex items-center gap-4 w-full"
                    whileHover={!isActive ? { x: 5 } : {}}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Icon size={20} className={cn("shrink-0", isActive && "text-glow drop-shadow-[0_0_8px_rgba(5,217,232,0.8)]")} />
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          key="label"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="whitespace-nowrap overflow-hidden flex items-center"
                        >
                          {isActive && <span className="mr-2 text-primary animate-pulse">{'>'}</span>}
                          {item.label}
                          {isActive && <span className="ml-1 text-primary animate-pulse">_</span>}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </motion.nav>
    </motion.aside>
  );
}
