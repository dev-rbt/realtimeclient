'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, ...props }, ref) => {
  // Ensure value is within valid range
  const safeValue = React.useMemo(() => {
    if (value === null || value === undefined) return 0;
    // Ensure value is a number and within range
    const numValue = Number(value);
    return isNaN(numValue) ? 0 : Math.max(0, Math.min(100, numValue));
  }, [value]);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - safeValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
