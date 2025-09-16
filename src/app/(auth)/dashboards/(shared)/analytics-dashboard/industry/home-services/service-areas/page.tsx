"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  MapPin,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Target,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Settings,
  Download,
  RefreshCw,
  Navigation,
  Truck,
  Phone,
  Star,
  AlertTriangle,
  CheckCircle,
  Zap,
  Timer,
  Route,
  Building2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TradingViewWrapper, TradingViewChartData } from "@/components/analytics/advanced-charts/trading-view-wrapper";
import chartsModule from "@/lib/analytics/charts.js";

// Import enhanced chart components
import { 
  EnhancedLineChart,
  ModernBarChart,
  ModernDoughnutChart
} from '@/components/analytics/chart-components';

import {
  SparkLine,
  TrendIndicator,
  ActivityPulse,
  DataFlowViz,
  SystemHealthMatrix,
  PerformanceRing
} from '@/components/analytics/abstract-visualizations';

export default function ServiceAreaPerformanceAnalytics() {
  const searchParams = useSearchParams();
  const timeframe = searchParams.get('timeframe') || '30d';

  // State management
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const realTimeStreamRef = useRef(null);
  
  // Initialize dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      const homeServicesGenerator = chartsModule.generators.homeServices;
      const rawData = homeServicesGenerator(30, true);
      
      setDashboardData({
        serviceAreas: rawData.revenue || [],
        performance: rawData.jobsCompleted || [],
        efficiency: rawData.customerSatisfaction || [],
      });
      
      setIsLoading(false);
    };
    
    loadDashboardData();
  }, [selectedTimeframe]);

  // Service Area KPIs
  const areaKPIs = {
    totalAreas: 8,
    areasChange: 14.3,
    totalCoverage: '2,847 sq mi',
    coverageChange: 8.9,
    avgResponseTime: '18 min',
    responseChange: -7.2,
    technicianUtilization: 84.7,
    utilizationChange: 5.3,
    customerDensity: 142.3,
    densityChange: 12.1
  };

  // Service areas performance
  const serviceAreas = [
    {
      area: 'Downtown',
      zone: 'Zone A',
      coverage: '285 sq mi',
      population: 48500,
      totalJobs: 342,
      revenue: '$147,800',
      avgResponseTime: '12 min',
      customerSatisfaction: 4.8,
      technicianCount: 6,
      utilization: 92.3,
      trend: 'up',
      priority: 'high'
    },
    {
      area: 'North Side',
      zone: 'Zone B',
      coverage: '412 sq mi',
      population: 62300,
      totalJobs: 298,
      revenue: '$128,400',
      avgResponseTime: '16 min',
      customerSatisfaction: 4.6,
      technicianCount: 5,
      utilization: 87.4,
      trend: 'up',
      priority: 'high'
    },
    {
      area: 'West End',
      zone: 'Zone C',
      coverage: '356 sq mi',
      population: 39200,
      totalJobs: 267,
      revenue: '$115,200',
      avgResponseTime: '14 min',
      customerSatisfaction: 4.7,
      technicianCount: 4,
      utilization: 89.1,
      trend: 'stable',
      priority: 'medium'
    },
    {
      area: 'East Valley',
      zone: 'Zone D',
      coverage: '389 sq mi',
      population: 45800,
      totalJobs: 234,
      revenue: '$98,600',
      avgResponseTime: '19 min',
      customerSatisfaction: 4.5,
      technicianCount: 4,
      utilization: 78.9,
      trend: 'up',
      priority: 'medium'
    },
    {
      area: 'South Hills',
      zone: 'Zone E',
      coverage: '298 sq mi',
      population: 33100,
      totalJobs: 189,
      revenue: '$82,300',
      avgResponseTime: '22 min',
      customerSatisfaction: 4.4,
      technicianCount: 3,
      utilization: 81.2,
      trend: 'down',
      priority: 'low'
    },
    {
      area: 'Suburban',
      zone: 'Zone F',
      coverage: '567 sq mi',
      population: 28900,
      totalJobs: 156,
      revenue: '$67,800',
      avgResponseTime: '28 min',
      customerSatisfaction: 4.3,
      technicianCount: 3,
      utilization: 72.6,
      trend: 'stable',
      priority: 'low'
    }
  ];

  // Route optimization metrics
  const routeMetrics = [
    {
      metric: 'Total Route Miles',
      value: '1,847',
      change: -8.4,
      unit: 'miles/day',
      status: 'good'
    },
    {
      metric: 'Fuel Efficiency',
      value: '12.3',
      change: 5.7,
      unit: 'mpg avg',
      status: 'excellent'
    },
    {
      metric: 'Route Optimization',
      value: '87.2',
      change: 12.3,
      unit: '% optimized',
      status: 'good'
    },
    {
      metric: 'Travel Time Savings',
      value: '23.4',
      change: 15.8,
      unit: 'min saved',
      status: 'excellent'
    }
  ];

  // Geographic performance insights
  const geoInsights = [
    {
      insight: 'High-demand downtown area requires additional technician',
      impact: 'High',
      area: 'Downtown',
      recommendation: 'Add 1 technician to reduce response time from 12min to 8min',
      estimatedRevenue: '+$15,200/month'
    },
    {
      insight: 'Suburban area shows declining service requests',
      impact: 'Medium',
      area: 'Suburban',
      recommendation: 'Analyze market trends and consider targeted marketing',
      estimatedRevenue: '-$8,400/month'
    },
    {
      insight: 'East Valley optimal for expansion',
      impact: 'High',
      area: 'East Valley',
      recommendation: 'Expand service radius by 15% to capture 180 new customers',
      estimatedRevenue: '+$22,800/month'
    },
    {
      insight: 'Route optimization in North Side needs improvement',
      impact: 'Medium',
      area: 'North Side',
      recommendation: 'Implement advanced route planning software',
      estimatedRevenue: '+$5,600/month'
    }
  ];

  // Peak hours analysis by area
  const peakHours = [
    { hour: '8 AM', downtown: 24, northSide: 18, westEnd: 16, eastValley: 14, southHills: 12, suburban: 8 },
    { hour: '9 AM', downtown: 32, northSide: 26, westEnd: 22, eastValley: 19, southHills: 15, suburban: 10 },
    { hour: '10 AM', downtown: 28, northSide: 24, westEnd: 20, eastValley: 17, southHills: 14, suburban: 9 },
    { hour: '11 AM', downtown: 22, northSide: 19, westEnd: 17, eastValley: 15, southHills: 12, suburban: 8 },
    { hour: '12 PM', downtown: 18, northSide: 16, westEnd: 14, eastValley: 12, southHills: 10, suburban: 7 },
    { hour: '1 PM', downtown: 26, northSide: 22, westEnd: 19, eastValley: 16, southHills: 13, suburban: 9 },
    { hour: '2 PM', downtown: 30, northSide: 25, westEnd: 21, eastValley: 18, southHills: 15, suburban: 10 }
  ];

  // Generate sample data
  const generateSparkData = (count: number, trend: 'up' | 'down' | 'stable' = 'up') => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: trend === 'up' ? 15 + i * 1.2 + Math.random() * 8 :
             trend === 'down' ? 35 - i * 0.8 + Math.random() * 5 :
             25 + Math.random() * 10
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(30, 'up'),
      generateSparkData(30, 'stable'),
      generateSparkData(30, 'down'),
      generateSparkData(30, 'up')
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-purple-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading service area analytics...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Professional Header */}
      <div className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/10 rounded border border-purple-500/20 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-100">Service Area Performance Analytics</h1>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>Geographic performance & territory optimization</span>
                  <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                  <span>Route efficiency & coverage analysis</span>
                  {isRealTimeActive && (
                    <>
                      <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-emerald-400">Live Territory Data</span>
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
                onClick={() => setSelectedTimeframe('7d')}
                className={'px-3 py-1.5 text-xs transition-colors ${
                  selectedTimeframe === '7d'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                7D
              </button>
              <button
                onClick={() => setSelectedTimeframe('30d')}
                className={'px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 ${
                  selectedTimeframe === '30d'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                30D
              </button>
              <button
                onClick={() => setSelectedTimeframe('90d')}
                className={'px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 ${
                  selectedTimeframe === '90d'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                90D
              </button>
            </div>
            
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

      {/* Territory Overview KPIs */}
      <div className="border-b border-neutral-800">
        <div className="px-6 py-4">
          <div className="grid grid-cols-5 gap-6 mb-6">
            {/* Total Service Areas */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Service Areas</span>
                <div className={'flex items-center gap-1 text-xs ${
                  areaKPIs.areasChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {areaKPIs.areasChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(areaKPIs.areasChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{areaKPIs.totalAreas}</div>
              <div className="text-xs text-neutral-500 mb-2">Active territories</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={120} 
                height={20} 
                color="#1C8BFF"
              />
            </div>

            {/* Total Coverage */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-300">Total Coverage</span>
                <div className={'flex items-center gap-1 text-xs ${
                  areaKPIs.coverageChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {areaKPIs.coverageChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(areaKPIs.coverageChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{areaKPIs.totalCoverage}</div>
              <div className="text-xs text-neutral-500 mb-2">Geographic reach</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            {/* Avg Response Time */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Timer className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Response Time</span>
                <div className={'flex items-center gap-1 text-xs ${
                  areaKPIs.responseChange >= 0 ? 'text-red-400' : 'text-emerald-400'
                }'}>
                  {areaKPIs.responseChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(areaKPIs.responseChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{areaKPIs.avgResponseTime}</div>
              <div className="text-xs text-neutral-500 mb-2">Across all areas</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={120} 
                height={20} 
                color="#f59e0b"
              />
            </div>

            {/* Technician Utilization */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-300">Tech Utilization</span>
                <div className={'flex items-center gap-1 text-xs ${
                  areaKPIs.utilizationChange >= 0 ? 'text-emerald-400' : 'text-red-400`
                }`}>
                  {areaKPIs.utilizationChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(areaKPIs.utilizationChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{areaKPIs.technicianUtilization}%</div>
              <div className="text-xs text-neutral-500 mb-2">Fleet efficiency</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: '${areaKPIs.technicianUtilization}%' }}></div>
              </div>
            </div>

            {/* Customer Density */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-neutral-300">Customer Density</span>
                <div className={'flex items-center gap-1 text-xs ${
                  areaKPIs.densityChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {areaKPIs.densityChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(areaKPIs.densityChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{areaKPIs.customerDensity}</div>
              <div className="text-xs text-neutral-500 mb-2">Per sq mile</div>
              <SparkLine 
                data={abstractData.sparklines[2]} 
                width={120} 
                height={20} 
                color="#06b6d4"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Service Area Performance Chart */}
      <div className="w-full bg-neutral-950 border-b border-neutral-800">
        <div className="px-6 py-3 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-medium text-neutral-100">Geographic Performance & Territory Trends</h3>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                Real-time Territory Analytics
              </Badge>
            </div>
          </div>
        </div>
        <div className="h-96 w-full">
          {dashboardData.serviceAreas && (
            <TradingViewWrapper
              data={dashboardData.serviceAreas as TradingViewChartData[]}
              type="line"
              height="100%"
              theme="dark"
              className="w-full"
              showTimeScale={true}
              showPriceScale={true}
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="overflow-y-auto">
        <div className="px-6 py-6 space-y-8">
          
          {/* Service Areas Performance Table */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-medium text-neutral-100">Service Area Performance Overview</h3>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs ml-auto">
                  {serviceAreas.length} Active Areas
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-3 px-4 font-medium text-neutral-300">Area</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Coverage</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Population</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Jobs</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Revenue</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Response</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Rating</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceAreas.map((area, index) => (
                      <tr key={index} className="border-b border-neutral-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className={'h-3 w-3 rounded-full mr-3 ${
                              area.priority === 'high' ? 'bg-emerald-500' :
                              area.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                            }'}></div>
                            <div>
                              <div className="font-medium text-neutral-100">{area.area}</div>
                              <div className="text-xs text-neutral-400">{area.zone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right text-neutral-300">{area.coverage}</td>
                        <td className="py-4 px-4 text-right text-neutral-300">{area.population.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right text-blue-400 font-semibold">{area.totalJobs}</td>
                        <td className="py-4 px-4 text-right text-emerald-400 font-semibold">{area.revenue}</td>
                        <td className="py-4 px-4 text-right">
                          <span className={'${
                            parseInt(area.avgResponseTime) <= 15 ? 'text-emerald-400' :
                            parseInt(area.avgResponseTime) <= 20 ? 'text-yellow-400' : 'text-red-400'
                          }'}>
                            {area.avgResponseTime}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span className="text-neutral-300">{area.customerSatisfaction}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={'${
                            area.utilization >= 85 ? 'text-emerald-400' :
                            area.utilization >= 75 ? 'text-yellow-400' : 'text-red-400'
                          }'}>
                            {area.utilization}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Route Metrics & Geographic Insights */}
          <div className="grid grid-cols-2 gap-6">
            {/* Route Optimization Metrics */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Route Optimization Metrics</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {routeMetrics.map((metric, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-100">{metric.metric}</span>
                        <div className={'flex items-center gap-1 text-xs ${
                          metric.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }'}>
                          {metric.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(metric.change)}%
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-semibold text-neutral-100">{metric.value}</div>
                        <div className="text-xs text-neutral-400">{metric.unit}</div>
                      </div>
                      <div className="mt-2">
                        <div className={'text-xs px-2 py-1 rounded ${
                          metric.status === 'excellent' ? 'bg-emerald-500/20 text-emerald-400' :
                          metric.status === 'good' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }'}>
                          {metric.status === 'excellent' ? 'Excellent Performance' :
                           metric.status === 'good' ? 'Good Performance' : 'Needs Improvement'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Geographic Performance Insights */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Geographic Performance Insights</h3>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs ml-auto">
                    AI Analysis
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {geoInsights.map((insight, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={'w-2 h-2 rounded-full ${
                            insight.impact === 'High' ? 'bg-red-500' :
                            insight.impact === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }'}></div>
                          <span className={'text-xs px-2 py-1 rounded ${
                            insight.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                            insight.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }'}>
                            {insight.impact} Impact
                          </span>
                        </div>
                        <span className="text-xs text-neutral-400">{insight.area}</span>
                      </div>
                      <div className="text-sm text-neutral-100 mb-2">{insight.insight}</div>
                      <div className="text-xs text-neutral-400 mb-1">{insight.recommendation}</div>
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-700/50">
                        <span className="text-xs text-neutral-400">Revenue Impact:</span>
                        <span className={'text-xs font-semibold ${
                          insight.estimatedRevenue.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                        }'}>
                          {insight.estimatedRevenue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Peak Hours Analysis */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-400" />
                <h3 className="text-sm font-medium text-neutral-100">Peak Hours Analysis by Service Area</h3>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs ml-auto">
                  Demand Patterns
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-3 px-4 font-medium text-neutral-300">Hour</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral-300">Downtown</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral-300">North Side</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral-300">West End</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral-300">East Valley</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral-300">South Hills</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral-300">Suburban</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peakHours.map((hour, index) => (
                      <tr key={index} className="border-b border-neutral-800/50">
                        <td className="py-4 px-4 font-medium text-white">{hour.hour}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={'px-2 py-1 rounded text-xs ${
                            hour.downtown >= 25 ? 'bg-red-500/20 text-red-400' :
                            hour.downtown >= 20 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }'}>
                            {hour.downtown}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={'px-2 py-1 rounded text-xs ${
                            hour.northSide >= 25 ? 'bg-red-500/20 text-red-400' :
                            hour.northSide >= 20 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }'}>
                            {hour.northSide}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={'px-2 py-1 rounded text-xs ${
                            hour.westEnd >= 25 ? 'bg-red-500/20 text-red-400' :
                            hour.westEnd >= 20 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }'}>
                            {hour.westEnd}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={'px-2 py-1 rounded text-xs ${
                            hour.eastValley >= 25 ? 'bg-red-500/20 text-red-400' :
                            hour.eastValley >= 20 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }'}>
                            {hour.eastValley}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={'px-2 py-1 rounded text-xs ${
                            hour.southHills >= 25 ? 'bg-red-500/20 text-red-400' :
                            hour.southHills >= 20 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }'}>
                            {hour.southHills}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={'px-2 py-1 rounded text-xs ${
                            hour.suburban >= 25 ? 'bg-red-500/20 text-red-400' :
                            hour.suburban >= 20 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }'}>
                            {hour.suburban}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              <span className="text-neutral-400">Territory System:</span>
              <span className="text-emerald-400">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Coverage:</span>
              <span className="text-emerald-400">{areaKPIs.totalCoverage}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Avg Response:</span>
              <span className="text-orange-400">{areaKPIs.avgResponseTime}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Active Areas:</span>
              <span className="text-blue-400">{areaKPIs.totalAreas}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Utilization:</span>
              <span className="text-purple-400">{areaKPIs.technicianUtilization}%</span>
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