import React from 'react';
import { cn } from '@/utils/cn';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, fallback, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-14 w-14 text-base',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full border border-border-color bg-surface',
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt="Avatar"
            className="aspect-square h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget.style.display = 'none');
            }}
          />
        ) : null}
        <div className="flex h-full w-full items-center justify-center bg-secondary/10 text-secondary font-medium">
          {fallback}
        </div>
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };
