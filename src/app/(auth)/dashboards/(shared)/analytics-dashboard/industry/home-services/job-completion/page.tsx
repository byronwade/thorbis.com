"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Wrench,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Filter,
  Settings,
  Download,
  RefreshCw,
  Calendar,
  Timer,
  Award,
  Zap,
  MapPin,
  Star,
  DollarSign,
  Settings2
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

export default function JobCompletionAnalytics() {
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
        jobCompletion: rawData.jobsCompleted || [],
        efficiency: rawData.revenue || [],
        quality: rawData.customerSatisfaction || [],
      });
      
      setIsLoading(false);
    };
    
    loadDashboardData();
  }, [selectedTimeframe]);

  // Job completion KPIs
  const completionKPIs = {
    totalJobs: 1847,
    jobsChange: 12.3,
    completionRate: 96.4,
    completionChange: 2.8,
    firstFixRate: 89.2,
    firstFixChange: 4.1,
    avgCompletionTime: '2.3 hrs',
    timeChange: -8.5,
    reworkRate: 3.6,
    reworkChange: -12.8
  };

  // Job completion by service type
  const completionByService = [
    {
      service: 'HVAC Repair',
      totalJobs: 542,
      completed: 518,
      completionRate: 95.6,
      avgTime: '2.8 hrs',
      firstFixRate: 91.3,
      reworkRate: 2.8,
      trend: 'up'
    },
    {
      service: 'Plumbing Services',
      totalJobs: 478,
      completed: 465,
      completionRate: 97.3,
      avgTime: '1.9 hrs',
      firstFixRate: 88.7,
      reworkRate: 3.2,
      trend: 'up'
    },
    {
      service: 'Electrical Work',
      totalJobs: 324,
      completed: 312,
      completionRate: 96.3,
      avgTime: '2.1 hrs',
      firstFixRate: 87.5,
      reworkRate: 4.1,
      trend: 'stable'
    },
    {
      service: 'General Maintenance',
      totalJobs: 287,
      completed: 279,
      completionRate: 97.2,
      avgTime: '1.5 hrs',
      firstFixRate: 94.8,
      reworkRate: 2.1,
      trend: 'up'
    },
    {
      service: 'Emergency Services',
      totalJobs: 216,
      completed: 204,
      completionRate: 94.4,
      avgTime: '3.2 hrs',
      firstFixRate: 82.4,
      reworkRate: 5.6,
      trend: 'down'
    }
  ];

  // Completion time analysis
  const completionTimeBreakdown = [
    { timeRange: 'Under 1 hour', count: 387, percentage: 20.9, satisfaction: 4.9 },
    { timeRange: '1-2 hours', count: 642, percentage: 34.8, satisfaction: 4.8 },
    { timeRange: '2-4 hours', count: 518, percentage: 28.1, satisfaction: 4.6 },
    { timeRange: '4-8 hours', count: 234, percentage: 12.7, satisfaction: 4.3 },
    { timeRange: 'Over 8 hours', count: 66, percentage: 3.6, satisfaction: 3.9 }
  ];

  // Quality metrics by completion time
  const qualityMetrics = [
    {
      metric: 'Customer Satisfaction',
      excellent: 78.2,
      good: 89.4,
      needsImprovement: 67.8,
      target: 85.0,
      unit: '%'
    },
    {
      metric: 'First-Fix Success Rate',
      excellent: 94.3,
      good: 89.2,
      needsImprovement: 72.1,
      target: 85.0,
      unit: '%'
    },
    {
      metric: 'Parts Availability',
      excellent: 96.8,
      good: 87.5,
      needsImprovement: 78.9,
      target: 90.0,
      unit: '%'
    },
    {
      metric: 'Tool Preparedness',
      excellent: 98.1,
      good: 92.3,
      needsImprovement: 84.7,
      target: 95.0,
      unit: '%'
    }
  ];

  // Top performing technicians
  const topTechnicians = [
    {
      name: 'Mike Rodriguez',
      jobsCompleted: 87,
      completionRate: 98.9,
      avgTime: '2.1 hrs',
      firstFixRate: 94.3,
      customerRating: 4.9,
      specialty: 'HVAC',
      efficiency: 'Excellent'
    },
    {
      name: 'Sarah Johnson',
      jobsCompleted: 92,
      completionRate: 97.8,
      avgTime: '1.8 hrs',
      firstFixRate: 93.5,
      customerRating: 4.8,
      specialty: 'Plumbing',
      efficiency: 'Excellent'
    },
    {
      name: 'David Chen',
      jobsCompleted: 78,
      completionRate: 96.2,
      avgTime: '2.3 hrs',
      firstFixRate: 91.0,
      customerRating: 4.7,
      specialty: 'Electrical',
      efficiency: 'Very Good'
    },
    {
      name: 'Amy Williams',
      jobsCompleted: 65,
      completionRate: 98.5,
      avgTime: '1.9 hrs',
      firstFixRate: 95.4,
      customerRating: 4.9,
      specialty: 'General',
      efficiency: 'Excellent'
    }
  ];

  // Common failure reasons
  const failureReasons = [
    { reason: 'Parts Not Available', count: 34, percentage: 45.9, impact: 'High' },
    { reason: 'Requires Specialist', count: 18, percentage: 24.3, impact: 'Medium' },
    { reason: 'Customer Not Available', count: 12, percentage: 16.2, impact: 'Low' },
    { reason: 'Weather Conditions', count: 6, percentage: 8.1, impact: 'Medium' },
    { reason: 'Equipment Malfunction', count: 4, percentage: 5.4, impact: 'High' }
  ];

  // Generate sample data
  const generateSparkData = (count: number, trend: 'up' | 'down' | 'stable' = 'up') => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: trend === 'up' ? 85 + i * 0.5 + Math.random() * 8 :
             trend === 'down' ? 95 - i * 0.3 + Math.random() * 5 :
             90 + Math.random() * 10
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(30, 'up'),
      generateSparkData(30, 'up'),
      generateSparkData(30, 'stable'),
      generateSparkData(30, 'down')
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading job completion analytics...</span>
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
              <div className="w-8 h-8 bg-green-500/10 rounded border border-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-100">Job Completion Analytics</h1>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>Job completion rates, efficiency & quality metrics</span>
                  <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                  <span>First-fix rate optimization</span>
                  {isRealTimeActive && (
                    <>
                      <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-emerald-400">Live Tracking</span>
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
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                7D
              </button>
              <button
                onClick={() => setSelectedTimeframe('30d')}
                className={'px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 ${
                  selectedTimeframe === '30d'
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                30D
              </button>
              <button
                onClick={() => setSelectedTimeframe('90d')}
                className={'px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 ${
                  selectedTimeframe === '90d'
                    ? 'bg-green-500/20 text-green-400'
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

      {/* Job Completion KPIs */}
      <div className="border-b border-neutral-800">
        <div className="px-6 py-4">
          <div className="grid grid-cols-5 gap-6 mb-6">
            {/* Total Jobs */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Total Jobs</span>
                <div className={'flex items-center gap-1 text-xs ${
                  completionKPIs.jobsChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {completionKPIs.jobsChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(completionKPIs.jobsChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{completionKPIs.totalJobs.toLocaleString()}</div>
              <div className="text-xs text-neutral-500 mb-2">This period</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={120} 
                height={20} 
                color="#1C8BFF"
              />
            </div>

            {/* Completion Rate */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-neutral-300">Completion Rate</span>
                <div className={'flex items-center gap-1 text-xs ${
                  completionKPIs.completionChange >= 0 ? 'text-emerald-400' : 'text-red-400`
                }`}>
                  {completionKPIs.completionChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(completionKPIs.completionChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{completionKPIs.completionRate}%</div>
              <div className="text-xs text-neutral-500 mb-2">Jobs completed</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '${completionKPIs.completionRate}%' }}></div>
              </div>
            </div>

            {/* First Fix Rate */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-300">First-Fix Rate</span>
                <div className={'flex items-center gap-1 text-xs ${
                  completionKPIs.firstFixChange >= 0 ? 'text-emerald-400' : 'text-red-400`
                }`}>
                  {completionKPIs.firstFixChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(completionKPIs.firstFixChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{completionKPIs.firstFixRate}%</div>
              <div className="text-xs text-neutral-500 mb-2">Fixed first time</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '${completionKPIs.firstFixRate}%' }}></div>
              </div>
            </div>

            {/* Avg Completion Time */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Timer className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Completion Time</span>
                <div className={'flex items-center gap-1 text-xs ${
                  completionKPIs.timeChange >= 0 ? 'text-red-400' : 'text-emerald-400'
                }'}>
                  {completionKPIs.timeChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(completionKPIs.timeChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{completionKPIs.avgCompletionTime}</div>
              <div className="text-xs text-neutral-500 mb-2">Per job average</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={120} 
                height={20} 
                color="#f59e0b"
              />
            </div>

            {/* Rework Rate */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-neutral-300">Rework Rate</span>
                <div className={'flex items-center gap-1 text-xs ${
                  completionKPIs.reworkChange >= 0 ? 'text-red-400' : 'text-emerald-400`
                }`}>
                  {completionKPIs.reworkChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(completionKPIs.reworkChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{completionKPIs.reworkRate}%</div>
              <div className="text-xs text-neutral-500 mb-2">Jobs requiring rework</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-red-400 h-1.5 rounded-full" style={{ width: '${completionKPIs.reworkRate * 10}%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Completion Trends Chart */}
      <div className="w-full bg-neutral-950 border-b border-neutral-800">
        <div className="px-6 py-3 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-medium text-neutral-100">Job Completion & Efficiency Trends</h3>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                Real-time Completion Tracking
              </Badge>
            </div>
          </div>
        </div>
        <div className="h-96 w-full">
          {dashboardData.jobCompletion && (
            <TradingViewWrapper
              data={dashboardData.jobCompletion as TradingViewChartData[]}
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

      {/* Main Content */}
      <div className="overflow-y-auto">
        <div className="px-6 py-6 space-y-8">
          
          {/* Completion by Service Type */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-medium text-neutral-100">Job Completion by Service Type</h3>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs ml-auto">
                  Service Analysis
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-3 px-4 font-medium text-neutral-300">Service Type</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Total Jobs</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Completed</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Completion %</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Avg Time</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">First-Fix %</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Rework %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completionByService.map((service, index) => (
                      <tr key={index} className="border-b border-neutral-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className={'h-3 w-3 rounded-full mr-3 ${
                              service.service === 'HVAC Repair' ? 'bg-blue-500' :
                              service.service === 'Plumbing Services' ? 'bg-emerald-500' :
                              service.service === 'Electrical Work' ? 'bg-yellow-500' :
                              service.service === 'General Maintenance' ? 'bg-purple-500' : 'bg-red-500'
                            }'}></div>
                            <span className="text-white font-medium">{service.service}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right text-blue-400 font-semibold">{service.totalJobs}</td>
                        <td className="py-4 px-4 text-right text-emerald-400 font-semibold">{service.completed}</td>
                        <td className="py-4 px-4 text-right">
                          <span className={'${
                            service.completionRate >= 95 ? 'text-emerald-400' : 
                            service.completionRate >= 90 ? 'text-yellow-400' : 'text-red-400'
                          }'}>
                            {service.completionRate}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-neutral-300">{service.avgTime}</td>
                        <td className="py-4 px-4 text-right text-emerald-400">{service.firstFixRate}%</td>
                        <td className="py-4 px-4 text-right">
                          <span className={'${
                            service.reworkRate <= 3 ? 'text-emerald-400' : 
                            service.reworkRate <= 5 ? 'text-yellow-400' : 'text-red-400'
                          }'}>
                            {service.reworkRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Completion Time Analysis & Quality Metrics */}
          <div className="grid grid-cols-2 gap-6">
            {/* Completion Time Breakdown */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Job Completion Time Analysis</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {completionTimeBreakdown.map((timeFrame, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-100">{timeFrame.timeRange}</span>
                          <span className="text-xs text-neutral-400">({timeFrame.percentage}%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span className="text-sm text-neutral-300">{timeFrame.satisfaction}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-blue-400 font-semibold">{timeFrame.count} jobs</div>
                        <div className="w-24 bg-neutral-800 rounded-full h-2">
                          <div 
                            className={'h-2 rounded-full ${
                              timeFrame.satisfaction >= 4.5 ? 'bg-emerald-400' :
                              timeFrame.satisfaction >= 4.0 ? 'bg-yellow-400' : 'bg-red-400`
                            }`} 
                            style={{ width: '${timeFrame.percentage * 2}%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Quality Performance Metrics</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {qualityMetrics.map((metric, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-100">{metric.metric}</span>
                        <span className="text-xs text-neutral-400">Target: {metric.target}%</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center">
                          <div className={'font-semibold ${
                            metric.excellent >= metric.target ? 'text-emerald-400' : 'text-yellow-400'
                          }'}>
                            {metric.excellent}%
                          </div>
                          <div className="text-neutral-400 text-xs">Excellent</div>
                        </div>
                        <div className="text-center">
                          <div className={'font-semibold ${
                            metric.good >= metric.target ? 'text-emerald-400' : 'text-yellow-400'
                          }'}>
                            {metric.good}%
                          </div>
                          <div className="text-neutral-400 text-xs">Good</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-400 font-semibold">{metric.needsImprovement}%</div>
                          <div className="text-neutral-400 text-xs">Needs Work</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Technicians */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-neutral-100">Top Performing Technicians</h3>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs ml-auto">
                  Completion Leaders
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {topTechnicians.map((tech, index) => (
                  <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-medium text-sm">
                          {tech.name.split(' ').map(n => n[0]).join(')}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-100">{tech.name}</div>
                          <div className="text-sm text-neutral-400">{tech.specialty} Specialist</div>
                        </div>
                      </div>
                      <div className={'text-xs px-2 py-1 rounded ${
                        tech.efficiency === 'Excellent' ? 'bg-emerald-500/20 text-emerald-400' :
                        tech.efficiency === 'Very Good' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }'}>
                        {tech.efficiency}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                      <div className="text-center">
                        <div className="text-emerald-400 font-semibold">{tech.completionRate}%</div>
                        <div className="text-neutral-400 text-xs">Completion</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-400 font-semibold">{tech.firstFixRate}%</div>
                        <div className="text-neutral-400 text-xs">First-Fix</div>
                      </div>
                      <div className="text-center">
                        <div className="text-orange-400 font-semibold">{tech.avgTime}</div>
                        <div className="text-neutral-400 text-xs">Avg Time</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-700/50">
                      <div className="text-sm">
                        <span className="text-neutral-400">{tech.jobsCompleted} jobs completed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400" />
                        <span className="text-sm text-neutral-300">{tech.customerRating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Common Failure Reasons */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <h3 className="text-sm font-medium text-neutral-100">Common Failure & Delay Reasons</h3>
                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs ml-auto">
                  Improvement Opportunities
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {failureReasons.map((reason, index) => (
                  <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-100">{reason.reason}</span>
                        <span className={'text-xs px-2 py-1 rounded ${
                          reason.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                          reason.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }'}>
                          {reason.impact} Impact
                        </span>
                      </div>
                      <span className="text-sm text-neutral-400">{reason.percentage}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-red-400 font-semibold">{reason.count} incidents</span>
                        <span className="text-neutral-400"> • Affected jobs</span>
                      </div>
                      <div className="w-24 bg-neutral-800 rounded-full h-2">
                        <div 
                          className={'h-2 rounded-full ${
                            reason.impact === 'High' ? 'bg-red-400' :
                            reason.impact === 'Medium' ? 'bg-yellow-400' : 'bg-green-400`
                          }'} 
                          style={{ width: '${reason.percentage * 2}%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
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
              <span className="text-neutral-400">Job Tracking:</span>
              <span className="text-emerald-400">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Completion Rate:</span>
              <span className="text-emerald-400">{completionKPIs.completionRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">First-Fix Rate:</span>
              <span className="text-emerald-400">{completionKPIs.firstFixRate}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Total Jobs:</span>
              <span className="text-blue-400">{completionKPIs.totalJobs.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Avg Time:</span>
              <span className="text-orange-400">{completionKPIs.avgCompletionTime}</span>
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