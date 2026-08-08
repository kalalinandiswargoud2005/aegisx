import React from 'react';
import { cn } from '@/utils/cn';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  glow?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'glass-panel rounded-none p-6 transition-all duration-300 border-t-0 border-r-0 border-b-0 border-l-2 border-l-primary/50',
          glow && 'hover:box-glow hover:border-l-primary',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = 'Card';

export { Card };
