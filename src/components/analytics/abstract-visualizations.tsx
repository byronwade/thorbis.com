"use client";

import React, { useMemo } from 'react';
import { Activity, TrendingUp, Target, Users, DollarSign, Clock, Zap, BarChart3 } from 'lucide-react';

interface DataPoint {
  time: number;
  value: number;
}

// Spark Line - Minimal line chart for inline metrics
export const SparkLine: React.FC<{
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}> = ({ data, width = 100, height = 30, color = '#1C8BFF', className = '' }) => {
  const pathData = useMemo(() => {
    if (!data || data.length === 0) return '';
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;
    
    if (range === 0) return 'M 0,${height/2} L ${width},${height/2}';
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.value - minValue) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    });
    
    return points.join(' ');
  }, [data, width, height]);

  if (!data || data.length === 0) return null;

  return (
    <svg width={width} height={height} className={className}>
      <path
        d={pathData}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Mini Bar Chart - Compact bar visualization
export const MiniBarChart: React.FC<{
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}> = ({ data, width = 100, height = 30, color = '#10b981', className = ' }) => {
  const maxValue = Math.max(...data);
  const barWidth = width / data.length;

  return (
    <svg width={width} height={height} className={className}>
      {data.map((value, index) => {
        const barHeight = (value / maxValue) * height;
        const x = index * barWidth;
        const y = height - barHeight;
        
        return (
          <rect
            key={index}
            x={x + 1}
            y={y}
            width={barWidth - 2}
            height={barHeight}
            fill={color}
            rx={1}
          />
        );
      })}
    </svg>
  );
};

// Trend Indicator - Abstract trend visualization
export const TrendIndicator: React.FC<{
  trend: 'up' | 'down' | 'neutral';
  value: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ trend, value, label, size = 'md', className = ' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  const colors = {
    up: 'text-emerald-400 bg-emerald-500/20',
    down: 'text-red-400 bg-red-500/20',
    neutral: 'text-blue-400 bg-blue-500/20'
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down` ? TrendingUp : Activity;

  return (
    <div className={'${sizeClasses[size]} rounded-full ${colors[trend]} flex flex-col items-center justify-center border border-current/20 ${className}'}>
      <TrendIcon 
        className={'h-4 w-4 ${trend === 'down' ? 'rotate-180' : '}'} 
      />
      <div className="text-xs font-bold mt-1">{Math.abs(value)}%</div>
      <div className="text-[10px] opacity-75">{label}</div>
    </div>
  );
};

// Activity Pulse - Animated activity indicator
export const ActivityPulse: React.FC<{
  intensity: number; // 0-100
  label: string;
  color?: string;
  className?: string;
}> = ({ intensity, label, color = '#1C8BFF', className = ` }) => {
  const pulseSpeed = Math.max(0.5, 3 - (intensity / 50)); // Faster pulse for higher intensity

  return (
    <div className={`flex flex-col items-center p-3 ${className}`}>
      <div className="relative">
        <div 
          className="w-12 h-12 rounded-full border-2 flex items-center justify-center"
          style={{ borderColor: color }}
        >
          <div 
            className="w-6 h-6 rounded-full"
            style={{ 
              backgroundColor: color,
              animation: `pulse ${pulseSpeed}s ease-in-out infinite`
            }}
          />
          {/* Outer pulse ring */}
          <div 
            className="absolute inset-0 rounded-full border-2 animate-ping"
            style={{ 
              borderColor: color,
              animationDuration: `${pulseSpeed}s`
            }}
          />
        </div>
      </div>
      <div className="text-xs text-neutral-300 mt-2 text-center">{label}</div>
      <div className="text-xs font-bold" style={{ color }}>{intensity}%</div>
    </div>
  );
};

// Metric Grid - Compact metrics display
export const MetricGrid: React.FC<{
  metrics: Array<{
    label: string;
    value: string | number;
    change?: number;
    icon?: React.ReactNode;
    color?: string;
  }>;
  className?: string;
}> = ({ metrics, className = ` }) => {
  return (
    <div className={'grid grid-cols-2 gap-3 ${className}'}>
      {metrics.map((metric, index) => (
        <div 
          key={index}
          className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-700/50"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {metric.icon && (
                <div className={'text-${metric.color || 'blue'}-400'}>
                  {metric.icon}
                </div>
              )}
            </div>
            {metric.change !== undefined && (
              <div className={'text-xs ${metric.change >= 0 ? 'text-emerald-400' : 'text-red-400'}'}>
                {metric.change > 0 ? '+' : '}{metric.change}%
              </div>
            )}
          </div>
          <div className="text-lg font-bold text-neutral-100">{metric.value}</div>
          <div className="text-xs text-neutral-400">{metric.label}</div>
        </div>
      ))}
    </div>
  );
};

// Status Dots - Connection/health status indicators
export const StatusDots: React.FC<{
  statuses: Array<{
    label: string;
    status: 'online' | 'warning' | 'offline';
    value?: string;
  }>;
  className?: string;
}> = ({ statuses, className = ' }) => {
  const statusColors = {
    online: 'bg-emerald-500',
    warning: 'bg-yellow-500',
    offline: 'bg-red-500`
  };

  return (
    <div className={'space-y-2 ${className}'}>
      {statuses.map((status, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className={'w-2 h-2 rounded-full ${statusColors[status.status]} ${
                status.status === 'online' ? 'animate-pulse' : `
              }`}
            />
            <span className="text-sm text-neutral-300">{status.label}</span>
          </div>
          {status.value && (
            <span className="text-xs text-neutral-400">{status.value}</span>
          )}
        </div>
      ))}
    </div>
  );
};

// Performance Ring - Circular performance indicator
export const PerformanceRing: React.FC<{
  metrics: Array<{
    label: string;
    value: number;
    maxValue: number;
    color: string;
  }>;
  size?: number;
  className?: string;
}> = ({ metrics, size = 120, className = ` }) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {metrics.map((metric, index) => {
          const offset = (circumference / metrics.length) * index;
          const progress = (metric.value / metric.maxValue) * 100;
          const strokeDasharray = `${(progress / 100) * (circumference / metrics.length)} ${circumference}`;
          
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius - (index * (strokeWidth + 2))}
              stroke={metric.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold text-neutral-100">
            {Math.round(metrics.reduce((acc, m) => acc + (m.value / m.maxValue), 0) / metrics.length * 100)}%
          </div>
          <div className="text-xs text-neutral-400">Avg Performance</div>
        </div>
      </div>
    </div>
  );
};

// Data Flow Visualization - Abstract data flow indicator
export const DataFlowViz: React.FC<{
  flows: Array<{
    from: string;
    to: string;
    volume: number;
    color?: string;
  }>;
  className?: string;
}> = ({ flows, className = ' }) => {
  const maxVolume = Math.max(...flows.map(f => f.volume));

  return (
    <div className={className}>
      <div className="space-y-3">
        {flows.map((flow, index) => {
          const intensity = flow.volume / maxVolume;
          const width = Math.max(20, intensity * 100);
          
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="text-xs text-neutral-400 w-16 text-right">{flow.from}</div>
              <div className="flex-1 flex items-center">
                <div 
                  className="h-1 rounded-full transition-all duration-500"
                  style={{ 
                    width: '${width}%',
                    backgroundColor: flow.color || '#1C8BFF',
                    opacity: 0.3 + (intensity * 0.7)
                  }}
                />
                <div 
                  className="w-2 h-2 rounded-full ml-1"
                  style={{ backgroundColor: flow.color || '#1C8BFF' }}
                />
              </div>
              <div className="text-xs text-neutral-400 w-16">{flow.to}</div>
              <div className="text-xs font-mono text-neutral-300 w-12 text-right">
                {flow.volume}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// System Health Matrix - Grid-based system status
export const SystemHealthMatrix: React.FC<{
  systems: Array<{
    name: string;
    metrics: number[]; // Array of 0-100 values
  }>;
  className?: string;
}> = ({ systems, className = ' }) => {
  const getHealthColor = (value: number) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 60) return 'bg-yellow-500';
    if (value >= 40) return 'bg-orange-500';
    return 'bg-red-500`;
  };

  return (
    <div className={className}>
      <div className="space-y-2">
        {systems.map((system, sysIndex) => (
          <div key={sysIndex} className="flex items-center gap-2">
            <div className="text-xs text-neutral-300 w-24 text-right">
              {system.name}
            </div>
            <div className="flex gap-1">
              {system.metrics.map((metric, metIndex) => (
                <div
                  key={metIndex}
                  className={`w-3 h-3 rounded-sm ${getHealthColor(metric)}'}
                  style={{ opacity: 0.3 + (metric / 100) * 0.7 }}
                  title={'${system.name} Metric ${metIndex + 1}: ${metric}%'}
                />
              ))}
            </div>
            <div className="text-xs text-neutral-400 ml-auto">
              {Math.round(system.metrics.reduce((acc, val) => acc + val, 0) / system.metrics.length)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  SparkLine,
  MiniBarChart,
  TrendIndicator,
  ActivityPulse,
  MetricGrid,
  StatusDots,
  PerformanceRing,
  DataFlowViz,
  SystemHealthMatrix
};