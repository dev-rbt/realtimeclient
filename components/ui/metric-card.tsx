"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp } from "lucide-react";

const metricCardVariants = cva(
  "transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-card hover:shadow-md",
        primary: "bg-primary/10 hover:bg-primary/15 border-primary/20",
        success: "bg-success/10 hover:bg-success/15 border-success/20",
        warning: "bg-warning/10 hover:bg-warning/15 border-warning/20",
        destructive: "bg-destructive/10 hover:bg-destructive/15 border-destructive/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: number;
  loading?: boolean;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  description,
  trend,
  loading = false,
  variant = "default",
  className,
}: MetricCardProps) {
  const [isAnimated, setIsAnimated] = useState(false);

  // Animate the card when it first appears
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card 
      className={cn(
        metricCardVariants({ variant }),
        "border overflow-hidden",
        isAnimated ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="w-4 h-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-[100px] mb-2" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        
        {(description || trend !== undefined) && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {trend !== undefined && (
              <div 
                className={cn(
                  "flex items-center mr-2",
                  trend > 0 ? "text-success" : trend < 0 ? "text-destructive" : ""
                )}
              >
                {trend > 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : trend < 0 ? (
                  <ArrowDown className="h-3 w-3 mr-1" />
                ) : null}
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
            {description && <p>{description}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
