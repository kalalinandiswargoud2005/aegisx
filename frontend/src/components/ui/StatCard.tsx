import React from 'react';
import { Card } from './Card';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <Card glow className={cn('relative flex flex-col justify-between gap-4 group overflow-hidden', className)}>
      {/* Scanning Line Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <motion.div 
          animate={{ y: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-full h-[50%] bg-gradient-to-b from-transparent via-primary/10 to-transparent border-b border-primary/30"
        />
      </div>

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-white/60 tracking-wider uppercase">{title}</p>
          <motion.h3 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-3xl font-mono font-bold text-white text-glow tracking-tight"
          >
            {value}
          </motion.h3>
        </div>
        {icon && (
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary cyber-cut group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_rgba(5,217,232,0.5)] transition-all"
          >
            {icon}
          </motion.div>
        )}
      </div>
      
      {trend && (
        <div className="relative z-10 flex items-center text-sm font-mono mt-2">
          <span
            className={cn(
              'font-medium px-2 py-0.5 rounded-sm cyber-cut mr-2',
              trend.isPositive ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
            )}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-white/50 text-[10px] tracking-widest uppercase">{trend.label}</span>
        </div>
      )}
    </Card>
  );
}
