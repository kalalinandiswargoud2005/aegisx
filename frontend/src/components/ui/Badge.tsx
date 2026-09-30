import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-white/10 text-white border-white/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    info: 'bg-secondary/10 text-secondary border-secondary/20',
    outline: 'bg-transparent text-white border-white/20',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-none border border-l-2 px-3 py-1 text-xs md:text-sm font-bold tracking-wider uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-[#020204]',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
