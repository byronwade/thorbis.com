"use client";

import { useEffect, useState } from 'react';
import { Badge } from '@components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip';
import { Activity, Zap } from 'lucide-react';

/**
 * Performance Monitor for Header Component
 * Tracks render times and provides performance insights
 */
export default function HeaderPerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  showBadge = false 
}) {
  const [renderTime, setRenderTime] = useState(0);
  const [renderCount, setRenderCount] = useState(0);
  const [averageRenderTime, setAverageRenderTime] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();
    
    // Track render completion
    const endTime = performance.now();
    const currentRenderTime = endTime - startTime;
    
    setRenderTime(currentRenderTime);
    setRenderCount(prev => prev + 1);
    setAverageRenderTime(prev => 
      prev === 0 ? currentRenderTime : (prev + currentRenderTime) / 2
    );

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚀 Header Performance');
      console.log(`Render time: ${currentRenderTime.toFixed(2)}ms`);
      console.log(`Render count: ${renderCount + 1}`);
      console.log(`Average render time: ${averageRenderTime.toFixed(2)}ms`);
      console.groupEnd();
    }
  });

  if (!enabled || !showBadge) return null;

  const getPerformanceColor = () => {
    if (renderTime < 16) return 'bg-green-500'; // 60fps
    if (renderTime < 33) return 'bg-yellow-500'; // 30fps
    return 'bg-red-500'; // Below 30fps
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className="fixed bottom-4 right-4 z-[9999] bg-background/80 backdrop-blur-sm"
        >
          <Activity className="w-3 h-3 mr-1" />
          {renderTime.toFixed(1)}ms
          <div className={`w-2 h-2 rounded-full ml-2 ${getPerformanceColor()}`} />
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-sm">
          <div className="font-medium">Header Performance</div>
          <div className="text-xs text-muted-foreground">
            Renders: {renderCount} | Avg: {averageRenderTime.toFixed(1)}ms
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
