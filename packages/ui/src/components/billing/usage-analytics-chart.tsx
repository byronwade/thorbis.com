/**
 * Usage Analytics Chart Component
 * Displays API usage trends and patterns over time
 * Dark-first design with interactive chart
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Filter
} from 'lucide-react';
import { useState } from 'react';

interface UsageDataPoint {
  date: string;
  apiCalls: number;
  dataExports: number;
  aiRequests: number;
  cost: number;
}

interface UsageAnalyticsProps {
  data: UsageDataPoint[];
  timeRange: '7d' | '30d' | '90d';
  onTimeRangeChange: (range: '7d' | '30d' | '90d') => void;
  currentQuota: number;
  totalUsage: {
    apiCalls: number;
    dataExports: number;
    aiRequests: number;
    totalCost: number;
  };
  trend: {
    apiCalls: number; // percentage change
    cost: number; // percentage change
  };
}

const chartConfig = {
  apiCalls: {
    color: '#1C8BFF', // Electric blue
    label: 'API Calls',
  },
  dataExports: {
    color: '#10B981', // Emerald
    label: 'Data Exports',
  },
  aiRequests: {
    color: '#8B5CF6', // Purple
    label: 'AI Requests',
  },
  cost: {
    color: '#F59E0B', // Amber
    label: 'Cost ($)',
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 shadow-lg">
      <p className="text-neutral-200 font-medium mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {`${entry.name}: ${entry.value.toLocaleString()}`}
          {entry.name === 'Cost' && ' cents'}
        </p>
      ))}
    </div>
  );
};

export function UsageAnalyticsChart({
  data,
  timeRange,
  onTimeRangeChange,
  currentQuota,
  totalUsage,
  trend,
}: UsageAnalyticsProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('area');

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (trendValue < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Activity className="w-4 h-4 text-neutral-400" />;
  };

  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return 'text-emerald-400';
    if (trendValue < 0) return 'text-red-400';
    return 'text-neutral-400';
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="apiCalls" 
              fill={chartConfig.apiCalls.color} 
              name={chartConfig.apiCalls.label}
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="dataExports" 
              fill={chartConfig.dataExports.color} 
              name={chartConfig.dataExports.label}
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="aiRequests" 
              fill={chartConfig.aiRequests.color} 
              name={chartConfig.aiRequests.label}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="apiCalls" 
              stroke={chartConfig.apiCalls.color} 
              name={chartConfig.apiCalls.label}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="dataExports" 
              stroke={chartConfig.dataExports.color} 
              name={chartConfig.dataExports.label}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="aiRequests" 
              stroke={chartConfig.aiRequests.color} 
              name={chartConfig.aiRequests.label}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        );
      
      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="apiCalls" 
              stackId="1"
              stroke={chartConfig.apiCalls.color} 
              fill={chartConfig.apiCalls.color}
              fillOpacity={0.6}
              name={chartConfig.apiCalls.label}
            />
            <Area 
              type="monotone" 
              dataKey="aiRequests" 
              stackId="1"
              stroke={chartConfig.aiRequests.color} 
              fill={chartConfig.aiRequests.color}
              fillOpacity={0.6}
              name={chartConfig.aiRequests.label}
            />
            <Area 
              type="monotone" 
              dataKey="dataExports" 
              stackId="1"
              stroke={chartConfig.dataExports.color} 
              fill={chartConfig.dataExports.color}
              fillOpacity={0.6}
              name={chartConfig.dataExports.label}
            />
          </AreaChart>
        );
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-neutral-100">
              Usage Analytics
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Track your API usage patterns and costs over time
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-[120px] bg-neutral-800 border-neutral-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-[100px] bg-neutral-800 border-neutral-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wide">
                  Total API Calls
                </div>
                <div className="text-2xl font-bold text-neutral-100">
                  {totalUsage.apiCalls.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(trend.apiCalls)}
                <span className={`text-sm font-medium ${getTrendColor(trend.apiCalls)}`}>
                  {Math.abs(trend.apiCalls)}%
                </span>
              </div>
            </div>
            <div className="mt-2">
              <Badge 
                variant={totalUsage.apiCalls > currentQuota ? "destructive" : "secondary"}
                className="text-xs"
              >
                {totalUsage.apiCalls > currentQuota 
                  ? `${((totalUsage.apiCalls / currentQuota - 1) * 100).toFixed(0)}% over quota`
                  : `${((totalUsage.apiCalls / currentQuota) * 100).toFixed(0)}% of quota`
                }
              </Badge>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
              Data Exports
            </div>
            <div className="text-2xl font-bold text-neutral-100">
              {totalUsage.dataExports.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-400 mt-1">
              {formatCurrency(totalUsage.dataExports * 10)} total
            </div>
          </div>

          <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
              AI Requests
            </div>
            <div className="text-2xl font-bold text-neutral-100">
              {totalUsage.aiRequests.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-400 mt-1">
              {formatCurrency(totalUsage.aiRequests * 5)} total
            </div>
          </div>

          <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wide">
                  Total Cost
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(totalUsage.totalCost)}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(trend.cost)}
                <span className={`text-sm font-medium ${getTrendColor(trend.cost)}`}>
                  {Math.abs(trend.cost)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-neutral-400">{config.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default UsageAnalyticsChart;