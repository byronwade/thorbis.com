"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  TrendingUp, 
  TrendingDown,
  Activity, 
  DollarSign, 
  Users, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Calendar,
  RefreshCw,
  Download,
  Settings,
  MoreHorizontal,
  Maximize2,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
  Home,
  Phone,
  MapPin,
  Timer,
  Wrench
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TradingViewWrapper, TradingViewChartData } from "@/components/analytics/advanced-charts/trading-view-wrapper";
import chartsModule from "@/lib/analytics/charts.js";

// Import our enhanced chart components
import { 
  EnhancedLineChart,
  ModernBarChart,
  ModernDoughnutChart
} from '@/components/analytics/chart-components';

import {
  SparkLine,
  TrendIndicator,
  ActivityPulse,
  MetricGrid,
  StatusDots,
  DataFlowViz,
  SystemHealthMatrix,
  PerformanceRing
} from '@/components/analytics/abstract-visualizations';

export default function AnalyticsPlatform() {
  const searchParams = useSearchParams();
  const fromIndustry = searchParams.get('from') || 'homeservices';

  // State management for enterprise dashboard
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const realTimeStreamRef = useRef(null);
  
  // Initialize dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Generate industry-specific data using our charts module
      const industryGenerator = chartsModule.generators[
        fromIndustry === 'hs' ? 'homeServices' :
        fromIndustry === 'rest' ? 'restaurant' :
        fromIndustry === 'auto' ? 'automotive' :
        'retail'
      ];
      
      const rawData = industryGenerator(30, true);
      
      // Process data for different chart types and KPIs
      setDashboardData({
        revenue: rawData.revenue || rawData.serviceOrders || rawData.transactions || [],
        primaryMetric: rawData.jobsCompleted || rawData.orderVolume || rawData.serviceOrders || rawData.transactions || [],
        secondaryMetric: rawData.customerSatisfaction || rawData.averageOrderValue || rawData.averageRepairValue || rawData.averageBasketSize || [],
        technicalData: chartsModule.formatters.candlestick(rawData.revenue || rawData.transactions || [], 0.12),
        volumeData: chartsModule.formatters.histogram(rawData.primaryMetric || rawData.revenue || [], 0.4),
        indicators: chartsModule.formatters.technicalIndicators(rawData.revenue || [], {
          smaLength: 7,
          emaLength: 14,
          addBollingerBands: true,
          addRSI: true
        })
      });
      
      setIsLoading(false);
    };
    
    loadDashboardData();
  }, [fromIndustry]);
  
  // Real-time data streaming
  useEffect(() => {
    if (isRealTimeActive) {
      realTimeStreamRef.current = new chartsModule.realTime(fromIndustry, 2500);
      
      realTimeStreamRef.current.subscribe('revenue', (dataPoint) => {
        setDashboardData(prev => ({
          ...prev,
          revenue: [...prev.revenue.slice(-29), dataPoint]
        }));
      });
      
      return () => {
        if (realTimeStreamRef.current) {
          realTimeStreamRef.current.stop();
        }
      };
    }
  }, [isRealTimeActive, fromIndustry]);
  
  // Calculate KPI metrics from data
  const calculateKPIs = () => {
    if (!dashboardData.revenue || dashboardData.revenue.length === 0) {
      return {
        totalRevenue: 0,
        revenueChange: 0,
        primaryCount: 0,
        primaryChange: 0,
        avgValue: 0,
        avgChange: 0,
        efficiency: 0,
        efficiencyChange: 0
      };
    }
    
    const revenueData = dashboardData.revenue;
    const recent = revenueData.slice(-7);
    const previous = revenueData.slice(-14, -7);
    
    const recentTotal = recent.reduce((sum, item) => sum + item.value, 0);
    const previousTotal = previous.reduce((sum, item) => sum + item.value, 0);
    const revenueChange = previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal) * 100 : 0;
    
    return {
      totalRevenue: recentTotal,
      revenueChange: Math.round(revenueChange * 10) / 10,
      primaryCount: Math.round(recent.length > 0 ? recent[recent.length - 1].value * 0.15 : 0),
      primaryChange: Math.round((Math.random() - 0.4) * 20 * 10) / 10,
      avgValue: Math.round(recentTotal / recent.length),
      avgChange: Math.round((Math.random() - 0.3) * 15 * 10) / 10,
      efficiency: Math.round(75 + Math.random() * 20),
      efficiencyChange: Math.round((Math.random() - 0.4) * 10 * 10) / 10
    };
  };
  
  const kpis = calculateKPIs();

  // Generate sample data for abstract visualizations
  const generateSparkData = (count: number) => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: 50 + Math.random() * 50
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(15),
      generateSparkData(15),
      generateSparkData(15),
      generateSparkData(15)
    ],
    performanceMetrics: [
      { label: 'Response Time', value: 87, maxValue: 100, color: '#1C8BFF' },
      { label: 'Quality Score', value: 94, maxValue: 100, color: '#10b981' },
      { label: 'Efficiency', value: 78, maxValue: 100, color: '#f59e0b' }
    ],
    systemHealth: [
      { name: 'Dispatch System', metrics: [95, 87, 92, 88] },
      { name: 'Field Operations', metrics: [88, 91, 85, 89] },
      { name: 'Customer Portal', metrics: [96, 98, 95, 97] }
    ],
    dataFlows: [
      { from: 'Service Calls', to: 'Dispatch', volume: 1250, color: '#1C8BFF' },
      { from: 'Dispatch', to: 'Technicians', volume: 1180, color: '#10b981' },
      { from: 'Completion', to: 'Billing', volume: 1140, color: '#f59e0b' }
    ]
  };

  // Industry-specific metric labels
  const getIndustryMetrics = (industry: string) => {
    const metrics = {
      hs: {
        primary: { label: 'Jobs Completed', unit: ', icon: Target },
        secondary: { label: 'Avg Job Value', unit: '$', icon: DollarSign },
        tertiary: { label: 'Tech Utilization', unit: '%', icon: Activity },
        quaternary: { label: 'Response Time', unit: 'min', icon: Clock }
      },
      rest: {
        primary: { label: 'Orders', unit: ', icon: Target },
        secondary: { label: 'Avg Order Value', unit: '$', icon: DollarSign },
        tertiary: { label: 'Table Turnover', unit: '/day', icon: Activity },
        quaternary: { label: 'Prep Time', unit: 'min', icon: Clock }
      },
      auto: {
        primary: { label: 'Service Orders', unit: ', icon: Target },
        secondary: { label: 'Avg Repair Value', unit: '$', icon: DollarSign },
        tertiary: { label: 'Parts Margin', unit: '%', icon: Activity },
        quaternary: { label: 'Completion Time', unit: 'hrs', icon: Clock }
      },
      ret: {
        primary: { label: 'Transactions', unit: ', icon: Target },
        secondary: { label: 'Basket Size', unit: '$', icon: DollarSign },
        tertiary: { label: 'Conversion Rate', unit: '%', icon: Activity },
        quaternary: { label: 'Dwell Time', unit: 'min', icon: Clock }
      }
    };
    
    return metrics[industry] || metrics.hs;
  };
  
  const industryMetrics = getIndustryMetrics(fromIndustry);

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading enterprise analytics platform...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Professional Analytics Header - Bloomberg Style */}
      <div className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded border border-blue-500/20 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-100">Analytics Platform</h1>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="capitalize">{fromIndustry === 'hs' ? 'Home Services' : fromIndustry} Intelligence</span>
                  <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                  <span>Real-time Operations</span>
                  {isRealTimeActive && (
                    <>
                      <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-emerald-400">Live Stream</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time Controls */}
            <div className="flex items-center border border-neutral-700 rounded-md">
              <button
                onClick={() => setSelectedTimeframe('1d')}
                className={'px-3 py-1.5 text-xs transition-colors ${
                  selectedTimeframe === '1d'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                1D
              </button>
              <button
                onClick={() => setSelectedTimeframe('7d')}
                className={'px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 ${
                  selectedTimeframe === '7d'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                7D
              </button>
              <button
                onClick={() => setSelectedTimeframe('30d')}
                className={'px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 ${
                  selectedTimeframe === '30d'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                30D
              </button>
              <button
                onClick={() => setSelectedTimeframe('90d')}
                className={'px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 ${
                  selectedTimeframe === '90d'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                90D
              </button>
            </div>
            
            {/* Live Data Toggle */}
            <button
              onClick={() => setIsRealTimeActive(!isRealTimeActive)}
              className={'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors ${
                isRealTimeActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'text-neutral-400 hover:text-neutral-300 border-neutral-700'
              }'}
            >
              {isRealTimeActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {isRealTimeActive ? 'Pause' : 'Live'}
            </button>
            
            <div className="w-px h-4 bg-neutral-700" />
            
            {/* Control Actions */}
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
      </div>

      {/* Data-at-a-Glance Section - No Cards */}
      <div className="border-b border-neutral-800">
        <div className="px-6 py-4">
          {/* Primary KPIs Row */}
          <div className="grid grid-cols-8 gap-8 mb-6">
            {/* Revenue */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-300">Total Revenue</span>
                <div className={'flex items-center gap-1 text-xs ${
                  kpis.revenueChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {kpis.revenueChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(kpis.revenueChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">${kpis.totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-neutral-500 mb-2">7-day period</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={140} 
                height={20} 
                color="#10b981"
              />
            </div>

            {/* Primary Metric */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <industryMetrics.primary.icon className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">{industryMetrics.primary.label}</span>
                <div className={'flex items-center gap-1 text-xs ${
                  kpis.primaryChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {kpis.primaryChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(kpis.primaryChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{kpis.primaryCount.toLocaleString()}</div>
              <div className="text-xs text-neutral-500 mb-2">This period</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={140} 
                height={20} 
                color="#1C8BFF"
              />
            </div>

            {/* Customer Satisfaction */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-300">Customer Satisfaction</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  2.3%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">4.8/5</div>
              <div className="text-xs text-neutral-500 mb-2">Average rating</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: '96%` }}></div>
              </div>
            </div>

            {/* Efficiency */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-neutral-300">{industryMetrics.tertiary.label}</span>
                <TrendIndicator 
                  trend={kpis.efficiencyChange >= 0 ? "up" : "down"} 
                  value={Math.abs(kpis.efficiencyChange)} 
                  label="Change" 
                  size="sm"
                />
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{kpis.efficiency}{industryMetrics.tertiary.unit}</div>
              <div className="text-xs text-neutral-500 mb-2">Current efficiency</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: '${kpis.efficiency}%' }}></div>
              </div>
            </div>
          </div>

          {/* Secondary Metrics Row */}
          <div className="grid grid-cols-8 gap-8 pt-4 border-t border-neutral-800">
            {/* Average Value */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <industryMetrics.secondary.icon className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-neutral-300">{industryMetrics.secondary.label}</span>
                <div className={'flex items-center gap-1 text-xs ${
                  kpis.avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {kpis.avgChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(kpis.avgChange)}%
                </div>
              </div>
              <div className="text-xl font-semibold text-neutral-100 mb-1">
                {industryMetrics.secondary.unit}{kpis.avgValue.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500">Average per transaction</div>
            </div>

            {/* Response Time */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-neutral-300">Response Time</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowDownRight className="h-3 w-3" />
                  8.2%
                </div>
              </div>
              <div className="text-xl font-semibold text-neutral-100 mb-1">14 min</div>
              <div className="text-xs text-neutral-500">Average response</div>
            </div>

            {/* Total Transactions */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-pink-400" />
                <span className="text-sm font-medium text-neutral-300">Total Transactions</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  12.4%
                </div>
              </div>
              <div className="text-xl font-semibold text-neutral-100 mb-1">8,247</div>
              <div className="text-xs text-neutral-500">This month</div>
            </div>

            {/* Active Users */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-neutral-300">Active Technicians</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  5.8%
                </div>
              </div>
              <div className="text-xl font-semibold text-neutral-100 mb-1">23</div>
              <div className="text-xs text-neutral-500">Currently in field</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="overflow-y-auto">
        {/* TradingView Chart - Full Width Professional */}
        <div className="w-full bg-neutral-950 border-b border-neutral-800">
          <div className="px-6 py-3 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LineChart className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-medium text-neutral-100">Revenue Performance Analytics</h3>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                  TradingView Professional
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Updated {new Date().toLocaleTimeString()}</span>
                <button className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded transition-colors">
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="h-96 w-full">
            {dashboardData.revenue && (
              <TradingViewWrapper
                data={dashboardData.revenue as TradingViewChartData[]}
                type="area"
                height="100%"
                theme="dark"
                className="w-full"
                showTimeScale={true}
                showPriceScale={true}
              />
            )}
          </div>
        </div>

        {/* Professional Data Analysis Section */}
        <div className="px-6 py-6 space-y-8">
          
          {/* Performance Analysis Row - Data-Focused */}
          <div className="border-b border-neutral-800 pb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-neutral-100">Performance Analysis</h2>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                  Real-time
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Stream active</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              {/* Enhanced Line Chart - No Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-neutral-200">Operational Trends</h3>
                    <span className="text-xs text-neutral-500">Chart.js Enhanced</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-emerald-400">+12.3% vs last period</span>
                    <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  </div>
                </div>
                <div className="h-56 bg-neutral-900/50 border border-neutral-800 p-4">
                  {dashboardData.primaryMetric && (
                    <EnhancedLineChart
                      data={dashboardData.primaryMetric}
                      height={200}
                    />
                  )}
                </div>
              </div>

              {/* Modern Bar Chart - No Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-neutral-200">Volume Analysis</h3>
                    <span className="text-xs text-neutral-500">Chart.js Professional</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-blue-400">Peak: 1,247 units</span>
                    <BarChart3 className="h-3 w-3 text-blue-400" />
                  </div>
                </div>
                <div className="h-56 bg-neutral-900/50 border border-neutral-800 p-4">
                  {dashboardData.primaryMetric && (
                    <ModernBarChart
                      data={dashboardData.primaryMetric.slice(-12)}
                      height={200}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* System Monitoring Row - Data-Focused */}
          <div className="border-b border-neutral-800 pb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-neutral-100">System Health & Operations</h2>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                  All systems operational
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400">99.8% uptime</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-8">
              {/* System Health Matrix - No Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-400" />
                    <h3 className="text-sm font-medium text-neutral-200">System Health</h3>
                  </div>
                  <span className="text-xs text-purple-400">94.2% avg</span>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 p-4">
                  <SystemHealthMatrix systems={abstractData.systemHealth} />
                </div>
              </div>

              {/* Data Flow Visualization - No Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-medium text-neutral-200">Operations Flow</h3>
                  </div>
                  <span className="text-xs text-cyan-400">3.57K/hr throughput</span>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 p-4">
                  <DataFlowViz flows={abstractData.dataFlows} />
                </div>
              </div>

              {/* Performance Ring - No Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-400" />
                    <h3 className="text-sm font-medium text-neutral-200">Performance Metrics</h3>
                  </div>
                  <span className="text-xs text-orange-400">86.3% efficiency</span>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 p-4 flex items-center justify-center">
                  <PerformanceRing 
                    metrics={abstractData.performanceMetrics}
                    size={120}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Monitor - Data-Focused */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-neutral-100">Real-time Activity Monitor</h2>
                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs">
                  Live pulses
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400">2.1M events today</span>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              {/* Activity Pulses - No Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-neutral-200">System Activity</h3>
                    <span className="text-xs text-neutral-500">Live performance indicators</span>
                  </div>
                  <span className="text-xs text-cyan-400">Avg: 77.8% load</span>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 p-6">
                  <div className="grid grid-cols-4 gap-6 h-24 items-center">
                    <ActivityPulse intensity={85} label="Dispatch" color="#1C8BFF" />
                    <ActivityPulse intensity={62} label="Field Ops" color="#10b981" />
                    <ActivityPulse intensity={91} label="Billing" color="#f59e0b" />
                    <ActivityPulse intensity={73} label="Support" color="#ef4444" />
                  </div>
                </div>
              </div>

              {/* Distribution Chart - No Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-purple-400" />
                    <h3 className="text-sm font-medium text-neutral-200">Service Distribution</h3>
                  </div>
                  <span className="text-xs text-purple-400">6 categories tracked</span>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 p-4">
                  {dashboardData.secondaryMetric && (
                    <ModernDoughnutChart
                      data={dashboardData.secondaryMetric.slice(-6)}
                      segments={['HVAC', 'Plumbing', 'Electrical', 'General Repair', 'Emergency', 'Maintenance']}
                      height={180}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Status Bar */}
      <div className="border-t border-neutral-800 bg-neutral-950">
        <div className="flex items-center justify-between px-6 py-2 text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-neutral-400">Platform Status:</span>
              <span className="text-emerald-400">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Data Stream:</span>
              <span className="text-neutral-300">{isRealTimeActive ? 'Live' : 'Paused'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Data Points:</span>
              <span className="text-neutral-300">{dashboardData.revenue?.length || 0}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Industry:</span>
              <span className="text-blue-400 capitalize">{fromIndustry === 'hs' ? 'Home Services' : fromIndustry}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Timeframe:</span>
              <span className="text-neutral-300">{selectedTimeframe}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Updated:</span>
              <span className="text-neutral-300">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}