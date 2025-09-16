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
  MousePointer,
  Eye,
  Share2,
  Mail,
  Globe,
  Smartphone,
  Monitor,
  Equal
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ChannelData {
  channel: string;
  visitors: number;
  conversions: number;
  revenue: number;
  cpa: number; // cost per acquisition
  roas: number; // return on ad spend
  trend: "up" | "down" | "stable";
  trendValue: number;
}

interface FunnelStep {
  name: string;
  visitors: number;
  conversionRate: number;
  dropOff: number;
}

export default function MarketingAnalyticsPlatform() {
  const searchParams = useSearchParams();
  const fromIndustry = searchParams.get('from') || 'homeservices';

  // State management for marketing dashboard
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('conversions');
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const realTimeStreamRef = useRef(null);
  
  // Initialize dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Generate marketing-specific data using our charts module
      const industryGenerator = chartsModule.generators[
        fromIndustry === 'hs' ? 'homeServices' :
        fromIndustry === 'rest' ? 'restaurant' :
        fromIndustry === 'auto' ? 'automotive' :
        'retail'
      ];
      
      const rawData = industryGenerator(30, true);
      
      // Process data for different chart types and marketing KPIs
      setDashboardData({
        conversions: rawData.revenue || rawData.serviceOrders || rawData.transactions || [],
        traffic: rawData.primaryMetric || rawData.jobsCompleted || rawData.orderVolume || [],
        roas: rawData.secondaryMetric || rawData.customerSatisfaction || rawData.averageOrderValue || [],
        technicalData: chartsModule.formatters.candlestick(rawData.revenue || rawData.transactions || [], 0.15),
        volumeData: chartsModule.formatters.histogram(rawData.primaryMetric || rawData.revenue || [], 0.35),
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
  
  // Real-time data streaming for marketing metrics
  useEffect(() => {
    if (isRealTimeActive) {
      realTimeStreamRef.current = new chartsModule.realTime(fromIndustry, 5000);
      
      realTimeStreamRef.current.subscribe('conversions', (dataPoint) => {
        setDashboardData(prev => ({
          ...prev,
          conversions: [...prev.conversions.slice(-29), dataPoint]
        }));
      });
      
      return () => {
        if (realTimeStreamRef.current) {
          realTimeStreamRef.current.stop();
        }
      };
    }
  }, [isRealTimeActive, fromIndustry]);

  // Mock data for marketing channels
  const channelData: ChannelData[] = [
    {
      channel: "Direct",
      visitors: 45230,
      conversions: 2845,
      revenue: 142500,
      cpa: 12.50,
      roas: 4.2,
      trend: "up",
      trendValue: 15.2,
    },
    {
      channel: "Organic Search",
      visitors: 38940,
      conversions: 2156,
      revenue: 108900,
      cpa: 8.75,
      roas: 5.8,
      trend: "up", 
      trendValue: 8.7,
    },
    {
      channel: "Email Marketing",
      visitors: 18420,
      conversions: 1890,
      revenue: 94500,
      cpa: 4.25,
      roas: 12.3,
      trend: "up",
      trendValue: 23.1,
    },
    {
      channel: "Social Media",
      visitors: 25680,
      conversions: 1234,
      revenue: 61700,
      cpa: 18.90,
      roas: 2.9,
      trend: "down",
      trendValue: -5.4,
    },
    {
      channel: "Paid Search",
      visitors: 12340,
      conversions: 892,
      revenue: 71360,
      cpa: 24.50,
      roas: 3.1,
      trend: "stable",
      trendValue: 1.2,
    },
    {
      channel: "Display Ads",
      visitors: 8950,
      conversions: 445,
      revenue: 35600,
      cpa: 32.10,
      roas: 2.1,
      trend: "down",
      trendValue: -12.8,
    },
  ];

  const funnelData: FunnelStep[] = [
    { name: "Website Visitors", visitors: 149560, conversionRate: 100, dropOff: 0 },
    { name: "Engaged Users", visitors: 67402, conversionRate: 45.1, dropOff: 54.9 },
    { name: "Product Views", visitors: 33701, conversionRate: 22.5, dropOff: 22.6 },
    { name: "Add to Cart", visitors: 13480, conversionRate: 9.0, dropOff: 13.5 },
    { name: "Checkout Started", visitors: 8088, conversionRate: 5.4, dropOff: 3.6 },
    { name: "Purchase Completed", visitors: 4462, conversionRate: 3.0, dropOff: 2.4 },
  ];

  const topPages = [
    { page: "/", views: 89420, conversions: 1245, conversionRate: 1.39 },
    { page: "/pricing", views: 34560, conversions: 2890, conversionRate: 8.36 },
    { page: "/features", views: 28930, conversions: 456, conversionRate: 1.58 },
    { page: "/about", views: 12340, conversions: 123, conversionRate: 1.00 },
    { page: "/contact", views: 8950, conversions: 892, conversionRate: 9.97 },
  ];

  // Generate sample data for abstract visualizations
  const generateSparkData = (count: number) => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: 40 + Math.random() * 60
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(15),
      generateSparkData(15),
      generateSparkData(15)
    ],
    performanceMetrics: [
      { label: 'Campaign ROI', value: 84, maxValue: 100, color: '#10b981' },
      { label: 'Attribution', value: 76, maxValue: 100, color: '#1C8BFF' },
      { label: 'Conversion Rate', value: 92, maxValue: 100, color: '#f59e0b' }
    ],
    systemHealth: [
      { name: 'Google Ads', metrics: [94, 96, 92, 98] },
      { name: 'Facebook Ads', metrics: [91, 89, 95, 93] },
      { name: 'Analytics', metrics: [98, 97, 99, 96] }
    ],
    dataFlows: [
      { from: 'Traffic', to: 'Landing', volume: 3240, color: '#10b981' },
      { from: 'Landing', to: 'Conversion', volume: 1890, color: '#1C8BFF' },
      { from: 'Ads', to: 'Revenue', volume: 2450, color: '#f59e0b' }
    ]
  };

  const getTrendIcon = (trend: string, value: number) => {
    if (trend === "up") return <ArrowUpRight className="h-3 w-3 text-green-600" />;
    if (trend === "down") return <ArrowDownRight className="h-3 w-3 text-red-600" />;
    return <Equal className="h-3 w-3 text-gray-600" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-gray-600";
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-purple-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading Marketing analytics...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Fixed Analytics Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-neutral-900/95 backdrop-blur border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-100">Marketing Analytics</h1>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="capitalize">Attribution & ROI Intelligence</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <span>Multi-Channel Tracking</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  <span className="text-purple-400">Live Campaigns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedTimeframe('7d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '7d'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            7D
          </button>
          <button
            onClick={() => setSelectedTimeframe('30d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '30d'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            30D
          </button>
          <button
            onClick={() => setSelectedTimeframe('90d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '90d'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            90D
          </button>
          
          <div className="w-px h-4 bg-neutral-700 mx-2" />
          
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

      {/* Main Scrollable Content */}
      <div className="overflow-y-auto">
        {/* Marketing KPIs */}
        <div className="px-8 py-6 bg-neutral-950">
          <div className="grid grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-300">Total Revenue</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +12.5%
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-400">$514,560</div>
              <div className="text-xs text-neutral-500 mb-3">Marketing attributed</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={120} 
                height={24} 
                color="#10b981"
              />
            </div>

            {/* Total Conversions */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Conversions</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +8.2%
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-400">9,462</div>
              <div className="text-xs text-neutral-500 mb-3">Cross-channel</div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full transition-all duration-1000" style={{ width: '76%' }}></div>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Order Value</span>
                <div className="flex items-center gap-1 text-xs text-red-400">
                  <ArrowDownRight className="h-3 w-3" />
                  -2.1%
                </div>
              </div>
              <div className="text-3xl font-bold text-orange-400">$54.32</div>
              <div className="text-xs text-neutral-500 mb-3">Per transaction</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={120} 
                height={24} 
                color="#f59e0b"
              />
            </div>

            {/* ROAS */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-300">ROAS</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +0.8x
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-400">4.2x</div>
              <div className="text-xs text-neutral-500 mb-3">Return on ad spend</div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: '84%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Marketing Performance Chart - Full Width */}
        <div className="w-full bg-neutral-950 relative">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-purple-400" />
                <h3 className="text-lg font-medium text-neutral-100">Marketing Performance & Attribution</h3>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">Multi-Channel Attribution</Badge>
              </div>
            </div>
          </div>
          <div className="h-96 w-full pointer-events-auto">
            {dashboardData.conversions && (
              <TradingViewWrapper
                data={dashboardData.conversions as TradingViewChartData[]}
                type="area"
                height="100%"
                theme="dark"
                className="w-full"
                showTimeScale={false}
                showPriceScale={true}
              />
            )}
          </div>
        </div>

        {/* Marketing Analytics Sections */}
        <div className="space-y-8 px-8 py-6 bg-neutral-950">
          
          {/* Channel Performance */}
          <div className="bg-neutral-900/50 border border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-cyan-400" />
                <h3 className="text-lg font-medium text-neutral-100">Channel Performance</h3>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">Revenue & Conversion Data</Badge>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-2 border border-neutral-700 bg-neutral-800 text-neutral-300 rounded-md text-sm"
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                >
                  <option value="conversions">Conversions</option>
                  <option value="revenue">Revenue</option>
                  <option value="visitors">Visitors</option>
                  <option value="roas">ROAS</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              {channelData.map((channel) => (
                <div key={channel.channel} className="flex items-center justify-between p-4 bg-neutral-800/30 border border-neutral-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      {channel.channel === "Direct" && <Globe className="h-5 w-5 text-purple-400" />}
                      {channel.channel === "Organic Search" && <Target className="h-5 w-5 text-emerald-400" />}
                      {channel.channel === "Email Marketing" && <Mail className="h-5 w-5 text-blue-400" />}
                      {channel.channel === "Social Media" && <Share2 className="h-5 w-5 text-cyan-400" />}
                      {channel.channel === "Paid Search" && <MousePointer className="h-5 w-5 text-orange-400" />}
                      {channel.channel === "Display Ads" && <Eye className="h-5 w-5 text-yellow-400" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-100">{channel.channel}</h4>
                      <div className="text-sm text-neutral-400">
                        {channel.visitors.toLocaleString()} visitors
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 text-sm">
                    <div className="text-right">
                      <div className="font-medium text-neutral-100">{channel.conversions.toLocaleString()}</div>
                      <div className="text-neutral-400">Conversions</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-neutral-100">${channel.revenue.toLocaleString()}</div>
                      <div className="text-neutral-400">Revenue</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-neutral-100">${channel.cpa}</div>
                      <div className="text-neutral-400">CPA</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-neutral-100">{channel.roas}x</div>
                      <div className="text-neutral-400">ROAS</div>
                    </div>
                    <div className={`text-right ${getTrendColor(channel.trend)}'}>
                      <div className="flex items-center gap-1 font-medium">
                        {getTrendIcon(channel.trend, channel.trendValue)}
                        {channel.trendValue > 0 ? "+" : ""}{channel.trendValue}%
                      </div>
                      <div className="text-neutral-400">Trend</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Funnel and Top Pages */}
          <div className="grid grid-cols-2 gap-6">
            {/* Conversion Funnel */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-medium text-neutral-100">Conversion Funnel</h3>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">User Journey</Badge>
              </div>
              <div className="space-y-4">
                {funnelData.map((step, index) => (
                  <div key={step.name} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-neutral-300">{step.name}</div>
                      <div className="text-sm text-neutral-400">
                        {step.visitors.toLocaleString()} ({step.conversionRate}%)
                      </div>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <div
                        className="bg-blue-400 rounded-full h-2 transition-all duration-300"
                        style={{ width: '${step.conversionRate}%' }}
                      />
                    </div>
                    {index < funnelData.length - 1 && step.dropOff > 0 && (
                      <div className="text-xs text-red-400 mt-1">
                        -{step.dropOff}% drop-off to next step
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Top Converting Pages */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-neutral-100">Top Converting Pages</h3>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">High Performance</Badge>
              </div>
              <div className="space-y-4">
                {topPages.map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-xs font-medium text-emerald-400">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-100">{page.page}</div>
                        <div className="text-sm text-neutral-400">
                          {page.views.toLocaleString()} views
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-neutral-100">{page.conversions}</div>
                      <div className="text-sm text-emerald-400">
                        {page.conversionRate}% CVR
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Device Analytics and Attribution */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-neutral-100">Device Types</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-300">Desktop</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-neutral-100">54.2%</div>
                    <div className="text-sm text-neutral-400">81,023 visits</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-300">Mobile</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-neutral-100">38.7%</div>
                    <div className="text-sm text-neutral-400">57,891 visits</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-300">Tablet</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-neutral-100">7.1%</div>
                    <div className="text-sm text-neutral-400">10,646 visits</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-medium text-neutral-100">Attribution Model</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Last Click</span>
                  <div className="text-right">
                    <div className="font-medium text-neutral-100">45.2%</div>
                    <div className="text-sm text-neutral-400">4,279 conv.</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">First Click</span>
                  <div className="text-right">
                    <div className="font-medium text-neutral-100">28.9%</div>
                    <div className="text-sm text-neutral-400">2,734 conv.</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Linear</span>
                  <div className="text-right">
                    <div className="font-medium text-neutral-100">15.7%</div>
                    <div className="text-sm text-neutral-400">1,485 conv.</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Position Based</span>
                  <div className="text-right">
                    <div className="font-medium text-neutral-100">10.2%</div>
                    <div className="text-sm text-neutral-400">964 conv.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-medium text-neutral-100">Marketing Performance</h3>
              </div>
              <div className="flex items-center justify-center h-32">
                <PerformanceRing 
                  metrics={abstractData.performanceMetrics}
                  size={120}
                />
              </div>
            </div>
          </div>

          {/* System Health and Data Flow */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-medium text-neutral-100">Marketing System Health</h3>
              </div>
              <SystemHealthMatrix systems={abstractData.systemHealth} />
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-neutral-100">Conversion Flow</h3>
              </div>
              <DataFlowViz flows={abstractData.dataFlows} />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/50 border-t border-neutral-800 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-neutral-400">Marketing APIs: </span>
            <span className="text-purple-400">Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Last Update: </span>
            <span className="text-neutral-300">1 minute ago</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Campaigns: </span>
            <span className="text-neutral-300">12 active</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">ROAS: </span>
            <span className="text-emerald-400">4.2x</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Attribution: </span>
            <span className="text-blue-300">Multi-Touch</span>
          </div>
          <button className="flex items-center gap-1 text-neutral-400 hover:text-neutral-100 transition-colors">
            <RefreshCw className="h-3 w-3" />
            Sync Campaigns
          </button>
        </div>
      </div>
    </div>
  );
}