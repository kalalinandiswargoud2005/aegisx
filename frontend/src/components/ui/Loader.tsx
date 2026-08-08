import React from 'react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

export function Loader({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-2',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={cn(
          'rounded-full border-primary/20 border-t-primary',
          sizes[size]
        )}
      />
    </div>
  );
}
