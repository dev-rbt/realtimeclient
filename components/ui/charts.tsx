"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BarChart3Icon, LineChartIcon, PieChartIcon } from "lucide-react";

// New interfaces for the chart components
interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: ChartDataPoint[];
  tooltipTitle?: string;
  tooltipFormatter?: (value: number) => string;
  colors?: string[];
  className?: string;
}

interface LineChartProps {
  data: ChartDataPoint[];
  tooltipTitle?: string;
  tooltipFormatter?: (value: number) => string;
  colors?: string[];
  className?: string;
}

interface PieChartProps {
  data: ChartDataPoint[];
  tooltipTitle?: string;
  tooltipFormatter?: (value: number) => string;
  className?: string;
}

export function BarChart({
  data,
  tooltipTitle = "Value",
  tooltipFormatter = (value) => `${value}`,
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
  className,
}: BarChartProps) {
  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  // Add state to handle client-side rendering
  const [isClient, setIsClient] = useState(false);
  
  // Use useEffect to update state after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div className={cn("w-full h-full", className)}>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-end justify-between gap-1 px-1">
          {data.map((item, index) => {
            const height = `${Math.max((item.value / maxValue) * 100, 3)}%`;
            const color = colors[index % colors.length];
            
            return (
              <div key={index} className="group relative flex flex-col items-center flex-1 min-w-0">
                <div className="w-full px-1">
                  <div 
                    className="w-full rounded-t-sm transition-all duration-300 group-hover:opacity-80"
                    style={{ 
                      height, 
                      backgroundColor: color,
                      minHeight: "4px"
                    }}
                  />
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background border rounded-md shadow-md p-2 text-xs pointer-events-none z-10 min-w-[100px] text-center">
                  <p className="font-medium">{item.name}</p>
                  <p className="font-bold">{tooltipFormatter(item.value)}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-1 text-xs text-muted-foreground">
          {data.map((item, index) => (
            <div key={index} className="truncate text-center flex-1 min-w-0 px-1">
              {/* Only render on client-side to avoid hydration mismatch */}
              {isClient ? item.name : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LineChart({
  data,
  tooltipTitle = "Value",
  tooltipFormatter = (value) => `${value}`,
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
  className,
}: LineChartProps) {
  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  // Add state to handle client-side rendering
  const [isClient, setIsClient] = useState(false);
  
  // Use useEffect to update state after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Calculate points for the line
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (item.value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className={cn("w-full h-full", className)}>
      <div className="flex flex-col h-full">
        <div className="flex-1 relative">
          {/* Line */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={points}
              fill="none"
              stroke={colors[0]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          
          {/* Data points */}
          <div className="absolute inset-0 flex items-center justify-between">
            {data.map((item, index) => {
              const top = `${100 - (item.value / maxValue) * 100}%`;
              
              return (
                <div 
                  key={index} 
                  className="group relative flex-1 h-full flex items-center justify-center"
                >
                  <div 
                    className="w-2 h-2 rounded-full bg-background border-2 transition-all duration-300 group-hover:w-3 group-hover:h-3"
                    style={{ 
                      borderColor: colors[0],
                      position: 'absolute',
                      top,
                      transform: 'translateY(-50%)'
                    }}
                  />
                  
                  {/* Tooltip */}
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background border rounded-md shadow-md p-2 text-xs pointer-events-none z-10 min-w-[100px] text-center"
                    style={{ 
                      top: `calc(${top} - 10px)`,
                      transform: 'translateY(-100%)'
                    }}
                  >
                    <p className="font-medium">{item.name}</p>
                    <p className="font-bold">{tooltipFormatter(item.value)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-1 text-xs text-muted-foreground">
          {data.map((item, index) => (
            <div key={index} className="truncate text-center flex-1 min-w-0 px-1">
              {/* Only render on client-side to avoid hydration mismatch */}
              {isClient ? item.name : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PieChart({
  data,
  tooltipTitle = "Value",
  tooltipFormatter = (value) => `${value}`,
  className,
}: PieChartProps) {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Add state to handle client-side rendering
  const [isClient, setIsClient] = useState(false);
  
  // Use useEffect to update state after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Generate pie segments
  let cumulativePercent = 0;
  const segments = data.map((item, index) => {
    const percent = total > 0 ? (item.value / total) * 100 : 0;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    
    return {
      ...item,
      percent,
      startPercent,
      endPercent: cumulativePercent,
      color: item.color || `hsl(${index * (360 / data.length)}, 70%, 60%)`
    };
  });
  
  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="relative flex-1 flex items-center justify-center">
        {/* SVG Pie Chart */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="20" />
          
          {segments.map((segment, index) => {
            const startAngle = (segment.startPercent / 100) * 360;
            const endAngle = (segment.endPercent / 100) * 360;
            
            // Calculate the SVG arc path
            const x1 = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180));
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180));
            const x2 = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180));
            const y2 = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180));
            
            // Determine if the arc should be drawn the long way around
            const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
            
            const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            return (
              <path 
                key={index}
                d={pathData}
                fill={segment.color}
                stroke="white"
                strokeWidth="1"
                className="transition-opacity duration-300 hover:opacity-80"
              >
                <title>{segment.name}: {tooltipFormatter(segment.value)} ({segment.percent.toFixed(1)}%)</title>
              </path>
            );
          })}
        </svg>
        
        {/* Center text showing total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-muted-foreground">Total</p>
          <p className="text-xl font-bold">
            {isClient ? tooltipFormatter(total) : ''}
          </p>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-sm mr-2" 
              style={{ backgroundColor: segment.color }}
            />
            <div className="flex-1 truncate">
              {isClient ? segment.name : ''}
            </div>
            <div className="font-medium ml-1">
              {isClient ? `${segment.percent.toFixed(1)}%` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
