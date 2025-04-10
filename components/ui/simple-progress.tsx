'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SimpleProgressProps {
  value?: number;
  className?: string;
  indicatorClassName?: string;
}

const SimpleProgress = React.forwardRef<
  HTMLDivElement,
  SimpleProgressProps
>(({ className, value = 0, indicatorClassName, ...props }, ref) => {
  // Simple value validation
  const safeValue = typeof value === 'number' 
    ? Math.max(0, Math.min(100, value)) 
    : 0;

  return (
    <div
      ref={ref}
      className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    >
      <div
        className={cn('h-full bg-primary transition-all', indicatorClassName)}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
});

SimpleProgress.displayName = 'SimpleProgress';

export { SimpleProgress };
