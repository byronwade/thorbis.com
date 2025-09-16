"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Activity, 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp,
  Zap,
  Target,
  DollarSign,
  Users,
  Clock,
  Server,
  Cpu,
  Database,
  Wifi,
  Shield,
  RefreshCw,
  Settings,
  Download,
  Filter,
  Maximize2
} from 'lucide-react';

// Import our new chart components
import { 
  MetricCard,
  EnhancedLineChart,
  ModernBarChart,
  ModernDoughnutChart,
  RadarChart,
  HeatMapChart,
  ProgressRing
} from '@/components/analytics/chart-components';

import {
  SparkLine,
  MiniBarChart,
  TrendIndicator,
  ActivityPulse,
  MetricGrid,
  StatusDots,
  PerformanceRing,
  DataFlowViz,
  SystemHealthMatrix
} from '@/components/analytics/abstract-visualizations';

import { TradingViewWrapper, TradingViewChartData } from '@/components/analytics/advanced-charts/trading-view-wrapper';
import { AnalyticsBackButton } from "@/components/analytics/analytics-back-button";
import chartsModule from '@/lib/analytics/charts.js';

export default function AdvancedAnalyticsPlatform() {
  const searchParams = useSearchParams();
  const fromIndustry = searchParams.get('from') || 'hs';
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isRealTime, setIsRealTime] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [dashboardData, setDashboardData] = useState<unknown>({});

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      const industryGenerator = chartsModule.generators[
        fromIndustry === 'hs' ? 'homeServices' :
        fromIndustry === 'rest' ? 'restaurant' :
        fromIndustry === 'auto' ? 'automotive' :
        'retail'
      ];
      
      const rawData = industryGenerator(30, true);
      
      setDashboardData({
        primary: rawData.revenue || rawData.serviceOrders || rawData.transactions || [],
        secondary: rawData.jobsCompleted || rawData.orderVolume || rawData.serviceOrders || [],
        performance: rawData.customerSatisfaction || rawData.averageOrderValue || [],
        volume: rawData.emergencyCallouts || rawData.peakHourRevenue || [],
        efficiency: rawData.techniciansUtilization || rawData.tableTurnover || []
      });
      
      setIsLoading(false);
    };
    
    loadData();
  }, [fromIndustry]);

  // Generate sample data for abstract visualizations
  const abstractData = useMemo(() => {
    const generateSparkData = (count: number) => 
      Array.from({ length: count }, (_, i) => ({
        time: Date.now() - (count - i) * 86400000,
        value: 50 + Math.random() * 50
      }));

    return {
      sparklines: [
        generateSparkData(20),
        generateSparkData(20),
        generateSparkData(20),
        generateSparkData(20)
      ],
      miniBars: [
        Array.from({ length: 12 }, () => Math.random() * 100),
        Array.from({ length: 12 }, () => Math.random() * 100)
      ],
      heatmapData: Array.from({ length: 7 }, () => 
        Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))
      ),
      performanceMetrics: [
        { label: 'CPU', value: 75, maxValue: 100, color: '#1C8BFF' },
        { label: 'Memory', value: 45, maxValue: 100, color: '#10b981' },
        { label: 'Disk', value: 30, maxValue: 100, color: '#f59e0b' },
        { label: 'Network', value: 90, maxValue: 100, color: '#ef4444' }
      ],
      systemHealth: [
        { name: 'API Gateway', metrics: [95, 87, 92, 88, 94] },
        { name: 'Database', metrics: [82, 79, 85, 91, 87] },
        { name: 'Cache', metrics: [98, 95, 97, 94, 96] },
        { name: 'Queue', metrics: [76, 82, 78, 85, 80] }
      ],
      dataFlows: [
        { from: 'Client', to: 'API', volume: 1250, color: '#1C8BFF' },
        { from: 'API', to: 'DB', volume: 890, color: '#10b981' },
        { from: 'API', to: 'Cache', volume: 2100, color: '#f59e0b' },
        { from: 'Queue', to: 'Workers', volume: 650, color: '#8b5cf6' }
      ]
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading comprehensive analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-neutral-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/50 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <AnalyticsBackButton />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-100">Comprehensive Analytics</h1>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="capitalize">{fromIndustry} Dashboard</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <span>Multi-Chart + Abstract Views</span>
                {isRealTime && (
                  <>
                    <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400">Live</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 rounded-md transition-colors">
            <Filter className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 rounded-md transition-colors">
            <Settings className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 rounded-md transition-colors">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="flex-1 grid grid-cols-16 grid-rows-12 gap-1 bg-neutral-800 p-1">
        {/* Large Primary Chart */}
        <div className="col-span-8 row-span-6 bg-neutral-900 rounded-lg">
          {dashboardData.primary && (
            <TradingViewWrapper
              data={dashboardData.primary as TradingViewChartData[]}
              type="area"
              height="100%"
              theme="dark"
              showTimeScale={true}
              showPriceScale={true}
            />
          )}
        </div>

        {/* Chart.js Enhanced Line Chart - Data-Focused */}
        <div className="col-span-4 row-span-6 bg-neutral-900 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-200">Performance Trends</h3>
            <span className="text-xs text-neutral-500">Chart.js Enhanced</span>
          </div>
          {dashboardData.secondary && (
            <EnhancedLineChart
              data={dashboardData.secondary}
              height={240}
            />
          )}
        </div>

        {/* Metric Cards Row - Data-Focused */}
        <div className="col-span-4 row-span-3 bg-neutral-900 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-medium text-neutral-200">Key Metrics</h3>
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-neutral-400">Total Revenue</span>
              </div>
              <div className="text-lg font-bold text-neutral-100">$125.8K</div>
              <div className="text-xs text-emerald-400">+8.2%</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-neutral-400">Active Users</span>
              </div>
              <div className="text-lg font-bold text-neutral-100">2,847</div>
              <div className="text-xs text-red-400">-2.1%</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-neutral-400">Completion Rate</span>
              </div>
              <div className="text-lg font-bold text-neutral-100">94.2%</div>
              <div className="text-xs text-emerald-400">+3.7%</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-400" />
                <span className="text-xs text-neutral-400">Avg Response</span>
              </div>
              <div className="text-lg font-bold text-neutral-100">1.2s</div>
              <div className="text-xs text-emerald-400">-5.3%</div>
            </div>
          </div>
        </div>

        {/* Abstract Visualizations Row */}
        <div className="col-span-6 row-span-3 bg-neutral-900 rounded-lg p-4">
          <div className="grid grid-cols-4 gap-4 h-full">
            {/* Sparklines */}
            {abstractData.sparklines.slice(0, 4).map((data, index) => (
              <div key={index} className="bg-neutral-800/50 p-3 rounded-lg">
                <div className="text-xs text-neutral-400 mb-2">
                  Metric {index + 1}
                </div>
                <SparkLine 
                  data={data} 
                  width={80} 
                  height={25} 
                  color={['#1C8BFF', '#10b981', '#f59e0b', '#ef4444'][index]}
                />
                <div className="text-sm font-bold text-neutral-100 mt-2">
                  {Math.round(data[data.length - 1]?.value || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Indicators */}
        <div className="col-span-4 row-span-3 bg-neutral-900 rounded-lg p-4">
          <div className="flex items-center justify-between h-full">
            <TrendIndicator trend="up" value={12.5} label="Revenue" size="lg" />
            <TrendIndicator trend="down" value={3.2} label="Costs" size="lg" />
            <TrendIndicator trend="up" value={8.7} label="Efficiency" size="lg" />
          </div>
        </div>

        {/* Modern Bar Chart - Data-Focused */}
        <div className="col-span-4 row-span-3 bg-neutral-900 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-200">Volume Analysis</h3>
            <span className="text-xs text-neutral-500">Chart.js Professional</span>
          </div>
          {dashboardData.volume && (
            <ModernBarChart
              data={dashboardData.volume.slice(-12)}
              height={140}
            />
          )}
        </div>

        {/* Performance Ring */}
        <div className="col-span-2 row-span-3 bg-neutral-900 rounded-lg p-4">
          <PerformanceRing 
            metrics={abstractData.performanceMetrics}
            size={100}
            className="flex items-center justify-center h-full"
          />
        </div>

        {/* Doughnut Chart - Data-Focused */}
        <div className="col-span-4 row-span-3 bg-neutral-900 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-200">Daily Distribution</h3>
            <span className="text-xs text-neutral-500">Chart.js Doughnut</span>
          </div>
          {dashboardData.efficiency && (
            <ModernDoughnutChart
              data={dashboardData.efficiency.slice(-6)}
              segments={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
              height={140}
            />
          )}
        </div>

        {/* Activity Pulses */}
        <div className="col-span-4 row-span-3 bg-neutral-900 rounded-lg p-4">
          <div className="grid grid-cols-4 gap-2 h-full items-center">
            <ActivityPulse intensity={85} label="API" color="#1C8BFF" />
            <ActivityPulse intensity={62} label="DB" color="#10b981" />
            <ActivityPulse intensity={91} label="Cache" color="#f59e0b" />
            <ActivityPulse intensity={73} label="Queue" color="#ef4444" />
          </div>
        </div>

        {/* Data Flow Visualization - Data-Focused */}
        <div className="col-span-6 row-span-3 bg-neutral-900 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-200">Operations Flow</h3>
            <span className="text-xs text-neutral-500">Real-time Data Flow</span>
          </div>
          <DataFlowViz flows={abstractData.dataFlows} />
        </div>

        {/* System Status */}
        <div className="col-span-3 row-span-3 bg-neutral-900 rounded-lg p-4">
          <h3 className="text-sm font-medium text-neutral-100 mb-3 flex items-center gap-2">
            <Server className="h-4 w-4 text-blue-400" />
            System Status
          </h3>
          <StatusDots
            statuses={[
              { label: 'API Gateway', status: 'online', value: '99.9%' },
              { label: 'Database', status: 'online', value: '98.7%' },
              { label: 'Cache Layer', status: 'warning', value: '95.2%' },
              { label: 'Message Queue', status: 'online', value: '99.1%' },
              { label: 'CDN', status: 'online', value: '100%' }
            ]}
          />
        </div>

        {/* Heat Map - Data-Focused */}
        <div className="col-span-7 row-span-3 bg-neutral-900 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-200">Activity Heat Map (24h)</h3>
            <span className="text-xs text-neutral-500">Hourly Activity</span>
          </div>
          <HeatMapChart
            data={abstractData.heatmapData}
            xLabels={Array.from({ length: 24 }, (_, i) => '${i}:00')}
            yLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            height={140}
          />
        </div>

        {/* System Health Matrix - Data-Focused */}
        <div className="col-span-5 row-span-3 bg-neutral-900 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-200">System Health Matrix</h3>
            <span className="text-xs text-neutral-500">Component Health</span>
          </div>
          <SystemHealthMatrix systems={abstractData.systemHealth} />
        </div>

        {/* Mini Progress Rings */}
        <div className="col-span-4 row-span-3 bg-neutral-900 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            <ProgressRing value={78} title="CPU" size={80} color="#1C8BFF" />
            <ProgressRing value={45} title="Memory" size={80} color="#10b981" />
            <ProgressRing value={92} title="Disk" size={80} color="#f59e0b" />
            <ProgressRing value={67} title="Network" size={80} color="#ef4444" />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/50 border-t border-neutral-800 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400">All Systems Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Charts: </span>
            <span className="text-neutral-300">16 Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Data Points: </span>
            <span className="text-neutral-300">{dashboardData.primary?.length || 0}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Update Rate: </span>
            <span className="text-neutral-300">3s</span>
          </div>
          <button className="flex items-center gap-1 text-neutral-400 hover:text-neutral-100 transition-colors">
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}