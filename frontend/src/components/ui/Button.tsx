import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 cyber-cut';

    const variants = {
      primary: 'bg-primary text-[#020204] hover:bg-white hover:text-[#020204] shadow-[0_0_15px_rgba(5,217,232,0.4)] hover:shadow-[0_0_25px_rgba(5,217,232,0.8)]',
      secondary: 'bg-secondary/20 text-secondary hover:bg-secondary/40 border-l-2 border-secondary',
      outline: 'border border-primary/50 bg-transparent hover:bg-primary/10 text-primary',
      ghost: 'hover:bg-white/5 text-white/80 hover:text-primary',
      danger: 'bg-danger/20 text-danger hover:bg-danger/40 border-l-2 border-danger',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-8 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...(props as any)}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
