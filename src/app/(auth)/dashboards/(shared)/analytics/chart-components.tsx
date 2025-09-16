"use client";

import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
  TimeScale
} from 'chart.js';
import {
  Line,
  Bar,
  Doughnut,
  Polar,
  Radar,
  Scatter
} from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
  TimeScale
);

interface ChartProps {
  data: unknown[];
  title?: string;
  height?: number;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: string;
  className?: string;
}

// Abstract Metric Card Component
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  color = 'blue',
  className = ''
}) => {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-neutral-400'
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;

  return (
    <div className={`bg-neutral-900/90 p-4 rounded-lg border border-neutral-800 hover:bg-neutral-800/50 transition-colors ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <div className={`text-${color}-400'}>{icon}</div>}
          <span className="text-sm font-medium text-neutral-300">{title}</span>
        </div>
        {change !== undefined && (
          <div className={'flex items-center gap-1 text-xs ${trendColors[trend]}'}>
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="text-xl font-bold text-neutral-100">{value}</div>
    </div>
  );
};

// Enhanced Line Chart with gradient and animations
export const EnhancedLineChart: React.FC<ChartProps> = ({ data, title, height = 300, className = ' }) => {
  const chartRef = useRef(null);

  const chartData = {
    labels: data.map(item => new Date(item.time * 1000).toLocaleDateString()),
    datasets: [
      {
        label: title || 'Metric',
        data: data.map(item => item.value),
        borderColor: '#1C8BFF',
        backgroundColor: (ctx: unknown) => {
          const canvas = ctx.chart.ctx;
          const gradient = canvas.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(28, 139, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(28, 139, 255, 0)');
          return gradient;
        },
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#1C8BFF',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(23, 23, 23, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e5e5e5',
        borderColor: '#404040',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#737373',
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(64, 64, 64, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#737373',
          font: {
            size: 11,
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div className={className}>
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-medium text-neutral-100">{title}</h3>
        </div>
      )}
      <div style={{ height: '${height}px' }}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

// Modern Bar Chart with gradients
export const ModernBarChart: React.FC<ChartProps> = ({ data, title, height = 300, className = ' }) => {
  const chartData = {
    labels: data.map(item => new Date(item.time * 1000).toLocaleDateString()),
    datasets: [
      {
        label: title || 'Metric',
        data: data.map(item => item.value),
        backgroundColor: (ctx: unknown) => {
          const canvas = ctx.chart.ctx;
          const gradient = canvas.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.2)');
          return gradient;
        },
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(23, 23, 23, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e5e5e5',
        borderColor: '#404040',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#737373',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(64, 64, 64, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#737373',
          font: {
            size: 11,
          },
        },
      },
    },
    animation: {
      duration: 800,
      easing: 'easeInOutCubic',
    },
  };

  return (
    <div className={className}>
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-medium text-neutral-100">{title}</h3>
        </div>
      )}
      <div style={{ height: '${height}px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// Modern Doughnut Chart with custom styling
export const ModernDoughnutChart: React.FC<ChartProps & { segments?: string[] }> = ({ 
  data, 
  title, 
  height = 300, 
  className = ',
  segments = []
}) => {
  const colors = [
    '#1C8BFF', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];

  const chartData = {
    labels: segments.length > 0 ? segments : data.map((_, index) => 'Segment ${index + 1}'),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length).map(color => color),
        borderWidth: 2,
        hoverBorderWidth: 3,
        cutout: '60%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#e5e5e5',
          font: {
            size: 12,
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(23, 23, 23, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e5e5e5',
        borderColor: '#404040`,
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
    },
  };

  return (
    <div className={className}>
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-medium text-neutral-100">{title}</h3>
        </div>
      )}
      <div style={{ height: `${height}px` }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

// Radar Chart for multi-dimensional metrics
export const RadarChart: React.FC<ChartProps & { labels?: string[] }> = ({ 
  data, 
  title, 
  height = 300, 
  className = ',
  labels = []
}) => {
  const chartData = {
    labels: labels.length > 0 ? labels : data.map((_, index) => 'Metric ${index + 1}'),
    datasets: [
      {
        label: title || 'Performance',
        data: data.map(item => item.value),
        backgroundColor: 'rgba(28, 139, 255, 0.2)',
        borderColor: '#1C8BFF',
        borderWidth: 2,
        pointBackgroundColor: '#1C8BFF',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#1C8BFF',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(23, 23, 23, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e5e5e5',
        borderColor: '#404040',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(64, 64, 64, 0.3)',
        },
        grid: {
          color: 'rgba(64, 64, 64, 0.3)',
        },
        pointLabels: {
          color: '#e5e5e5',
          font: {
            size: 11,
          },
        },
        ticks: {
          color: '#737373',
          backdropColor: 'transparent',
          font: {
            size: 10,
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart`,
    },
  };

  return (
    <div className={`bg-neutral-900/90 p-4 rounded-lg border border-neutral-800 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-medium text-neutral-100">{title}</h3>
        </div>
      )}
      <div style={{ height: `${height}px` }}>
        <Radar data={chartData} options={options} />
      </div>
    </div>
  );
};

// Abstract Heat Map using gradients
export const HeatMapChart: React.FC<{
  data: number[][];
  xLabels: string[];
  yLabels: string[];
  title?: string;
  height?: number;
  className?: string;
}> = ({ data, xLabels, yLabels, title, height = 300, className = ` }) => {
  const maxValue = Math.max(...data.flat());
  const minValue = Math.min(...data.flat());

  const getIntensity = (value: number) => {
    return (value - minValue) / (maxValue - minValue);
  };

  const getColor = (intensity: number) => {
    // Blue to red gradient based on intensity
    const red = Math.round(28 + intensity * (239 - 28));
    const green = Math.round(139 - intensity * (139 - 68));
    const blue = Math.round(255 - intensity * (255 - 68));
    return `rgb(${red}, ${green}, ${blue})`;
  };

  return (
    <div className={`bg-neutral-900/90 p-4 rounded-lg border border-neutral-800 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-orange-400" />
          <h3 className="text-sm font-medium text-neutral-100">{title}</h3>
        </div>
      )}
      <div className="relative" style={{ height: `${height}px` }}>
        <div className="grid gap-1" style={{ 
          gridTemplateColumns: `50px repeat(${xLabels.length}, 1fr)`,
          gridTemplateRows: `30px repeat(${yLabels.length}, 1fr)'
        }}>
          {/* Empty top-left cell */}
          <div></div>
          
          {/* X-axis labels */}
          {xLabels.map((label, index) => (
            <div key={index} className="text-xs text-neutral-400 text-center flex items-center justify-center">
              {label}
            </div>
          ))}
          
          {/* Data cells with Y-axis labels */}
          {yLabels.map((yLabel, yIndex) => (
            <React.Fragment key={yIndex}>
              <div className="text-xs text-neutral-400 flex items-center justify-end pr-2">
                {yLabel}
              </div>
              {xLabels.map((xLabel, xIndex) => {
                const value = data[yIndex][xIndex];
                const intensity = getIntensity(value);
                return (
                  <div
                    key={'${yIndex}-${xIndex}'}
                    className="rounded border border-neutral-700 flex items-center justify-center text-xs font-medium hover:border-neutral-500 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: getColor(intensity),
                      color: intensity > 0.5 ? 'white' : 'black'
                    }}
                    title={'${yLabel} × ${xLabel}: ${value}'}
                  >
                    {value}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// Abstract Progress Ring
export const ProgressRing: React.FC<{
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  title?: string;
  className?: string;
}> = ({ 
  value, 
  maxValue = 100, 
  size = 120, 
  strokeWidth = 8, 
  color = '#1C8BFF',
  title,
  className = '`
}) => {
  const normalizedValue = (value / maxValue) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${(normalizedValue / 100) * circumference} ${circumference}';

  return (
    <div className={'bg-neutral-900/90 p-4 rounded-lg border border-neutral-800 flex flex-col items-center ${className}'}>
      {title && (
        <h3 className="text-sm font-medium text-neutral-100 mb-3">{title}</h3>
      )}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(64, 64, 64, 0.3)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-bold text-neutral-100">{Math.round(normalizedValue)}%</div>
            <div className="text-xs text-neutral-400">{value}/{maxValue}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  MetricCard,
  EnhancedLineChart,
  ModernBarChart,
  ModernDoughnutChart,
  RadarChart,
  HeatMapChart,
  ProgressRing
};