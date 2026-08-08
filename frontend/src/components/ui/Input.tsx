import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'flex h-10 w-full rounded-md border border-border-color bg-surface/50 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all',
            icon && 'pl-10',
            error && 'border-danger focus:ring-danger focus:border-danger',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="mt-1 text-xs text-danger">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
