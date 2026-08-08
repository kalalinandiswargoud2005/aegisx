import React from 'react';
import { Card } from './Card';
import { cn } from '@/utils/cn';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartCard({ title, description, children, className, action }: ChartCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">{title}</h3>
          {description && <p className="mt-1 text-sm text-white/50">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        {children}
      </div>
    </Card>
  );
}
