"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  Droplets,
  Wrench,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  Filter,
  Settings,
  Download,
  RefreshCw,
  Target,
  Calendar,
  MapPin,
  Gauge,
  FlaskConical,
  Waves,
  Thermometer
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

export default function PlumbingAnalytics() {
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
        plumbingRevenue: rawData.revenue || [],
        callVolume: rawData.jobsCompleted || [],
        emergencyResponse: rawData.customerSatisfaction || [],
      });
      
      setIsLoading(false);
    };
    
    loadDashboardData();
  }, [selectedTimeframe]);

  // Plumbing-specific KPIs
  const plumbingKPIs = {
    totalJobs: 389,
    jobsChange: 18.4,
    avgRevenue: 425.75,
    revenueChange: 14.2,
    emergencyRate: 23.4,
    emergencyChange: -4.8,
    completionRate: 91.8,
    completionChange: 5.3,
    waterQualityIssues: 47,
    qualityChange: -12.1
  };

  // Plumbing service breakdown
  const plumbingServices = [
    {
      service: 'Leak Repairs',
      jobs: 142,
      avgRevenue: 285.00,
      urgency: 'High',
      avgDuration: '1.5 hrs',
      completionRate: 94.4,
      materials: 'PVC, Copper, Fittings',
      trend: 'up',
      emergencyRate: 35.2
    },
    {
      service: 'Drain Cleaning',
      jobs: 89,
      avgRevenue: 165.00,
      urgency: 'Medium',
      avgDuration: '1.0 hrs',
      completionRate: 96.6,
      materials: 'Cables, Chemicals',
      trend: 'stable',
      emergencyRate: 15.7
    },
    {
      service: 'Fixture Installation',
      jobs: 76,
      avgRevenue: 485.00,
      urgency: 'Low',
      avgDuration: '2.5 hrs',
      completionRate: 98.7,
      materials: 'Fixtures, Seals, Tools',
      trend: 'up',
      emergencyRate: 2.6
    },
    {
      service: 'Water Heater Service',
      jobs: 54,
      avgRevenue: 785.00,
      urgency: 'High',
      avgDuration: '3.2 hrs',
      completionRate: 87.0,
      materials: 'Elements, Thermostats',
      trend: 'up',
      emergencyRate: 48.1
    },
    {
      service: 'Pipe Replacement',
      jobs: 28,
      avgRevenue: 1285.00,
      urgency: 'High',
      avgDuration: '6.5 hrs',
      completionRate: 85.7,
      materials: 'Pipes, Insulation, Joints',
      trend: 'down',
      emergencyRate: 67.9
    }
  ];

  // Water quality issues tracking
  const waterQualityIssues = [
    {
      issue: 'Hard Water Problems',
      cases: 18,
      avgCost: 485.00,
      resolution: 'Water Softener Installation',
      preventable: true,
      severity: 'Medium'
    },
    {
      issue: 'Contamination Issues',
      cases: 12,
      avgCost: 785.00,
      resolution: 'Filtration System',
      preventable: true,
      severity: 'High'
    },
    {
      issue: 'pH Imbalance',
      cases: 9,
      avgCost: 285.00,
      resolution: 'pH Correction System',
      preventable: true,
      severity: 'Medium'
    },
    {
      issue: 'Sediment Problems',
      cases: 8,
      avgCost: 185.00,
      resolution: 'Sediment Filter',
      preventable: true,
      severity: 'Low'
    }
  ];

  // Emergency response tracking
  const emergencyMetrics = [
    {
      type: 'Burst Pipes',
      calls: 34,
      avgResponseTime: '18 min',
      avgRepairTime: '2.5 hrs',
      avgCost: 1485.00,
      satisfaction: 4.6,
      priority: 'Critical'
    },
    {
      type: 'Major Leaks',
      calls: 28,
      avgResponseTime: '22 min',
      avgRepairTime: '1.8 hrs',
      avgCost: 685.00,
      satisfaction: 4.8,
      priority: 'High'
    },
    {
      type: 'Sewer Backup',
      calls: 19,
      avgResponseTime: '25 min',
      avgRepairTime: '4.2 hrs',
      avgCost: 2485.00,
      satisfaction: 4.4,
      priority: 'Critical'
    },
    {
      type: 'No Water',
      calls: 15,
      avgResponseTime: '15 min',
      avgRepairTime: '1.2 hrs',
      avgCost: 285.00,
      satisfaction: 4.9,
      priority: 'High'
    }
  ];

  // Top plumbing technicians
  const topPlumbers = [
    {
      name: 'Robert Martinez',
      specialty: 'Emergency Plumbing',
      jobsCompleted: 94,
      avgRating: 4.9,
      avgResponseTime: '16 min',
      avgJobValue: 585.00,
      certifications: ['Master Plumber', 'Backflow Certified'],
      emergencyExpert: true
    },
    {
      name: 'Jennifer Thompson',
      specialty: 'Water Quality Systems',
      jobsCompleted: 67,
      avgRating: 4.8,
      avgResponseTime: '24 min',
      avgJobValue: 785.00,
      certifications: ['Water Quality Specialist', 'Master Plumber'],
      emergencyExpert: false
    },
    {
      name: 'Michael Chen',
      specialty: 'Commercial Plumbing',
      jobsCompleted: 52,
      avgRating: 4.9,
      avgResponseTime: '28 min',
      avgJobValue: 1285.00,
      certifications: ['Commercial License', 'Backflow Certified'],
      emergencyExpert: true
    },
    {
      name: 'Sarah Williams',
      specialty: 'Residential Repairs',
      jobsCompleted: 89,
      avgRating: 4.7,
      avgResponseTime: '19 min',
      avgJobValue: 425.00,
      certifications: ['Licensed Plumber', 'Green Plumbing'],
      emergencyExpert: false
    }
  ];

  // Generate sample data
  const generateSparkData = (count: number, trend: 'up' | 'down' | 'stable' = 'up') => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: trend === 'up' ? 300 + i * 12 + Math.random() * 80 :
             trend === 'down' ? 600 - i * 8 + Math.random() * 60 :
             400 + Math.random() * 120
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(30, 'up'),
      generateSparkData(30, 'up'),
      generateSparkData(30, 'down'),
      generateSparkData(30, 'stable'),
      generateSparkData(30, 'down')
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading plumbing analytics...</span>
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
              <div className="w-8 h-8 bg-blue-500/10 rounded border border-blue-500/20 flex items-center justify-center">
                <Droplets className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-100">Plumbing Analytics</h1>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>Water systems, leak detection & emergency response</span>
                  <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                  <span>Quality monitoring & preventive maintenance</span>
                  {isRealTimeActive && (
                    <>
                      <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-emerald-400">Real-time Monitoring</span>
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

      {/* Plumbing Performance KPIs */}
      <div className="border-b border-neutral-800">
        <div className="px-6 py-4">
          <div className="grid grid-cols-5 gap-6 mb-6">
            {/* Total Plumbing Jobs */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Total Plumbing Jobs</span>
                <div className={'flex items-center gap-1 text-xs ${
                  plumbingKPIs.jobsChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {plumbingKPIs.jobsChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(plumbingKPIs.jobsChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{plumbingKPIs.totalJobs}</div>
              <div className="text-xs text-neutral-500 mb-2">This month</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={120} 
                height={20} 
                color="#1C8BFF"
              />
            </div>

            {/* Average Revenue */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Revenue per Job</span>
                <div className={'flex items-center gap-1 text-xs ${
                  plumbingKPIs.revenueChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {plumbingKPIs.revenueChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(plumbingKPIs.revenueChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">${plumbingKPIs.avgRevenue}</div>
              <div className="text-xs text-neutral-500 mb-2">Per service call</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={120} 
                height={20} 
                color="#10b981"
              />
            </div>

            {/* Emergency Call Rate */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-neutral-300">Emergency Call Rate</span>
                <div className={'flex items-center gap-1 text-xs ${
                  plumbingKPIs.emergencyChange >= 0 ? 'text-red-400' : 'text-emerald-400'
                }'}>
                  {plumbingKPIs.emergencyChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(plumbingKPIs.emergencyChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{plumbingKPIs.emergencyRate}%</div>
              <div className="text-xs text-neutral-500 mb-2">Of total calls</div>
              <SparkLine 
                data={abstractData.sparklines[2]} 
                width={120} 
                height={20} 
                color="#f59e0b"
              />
            </div>

            {/* Completion Rate */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-neutral-300">Completion Rate</span>
                <div className={'flex items-center gap-1 text-xs ${
                  plumbingKPIs.completionChange >= 0 ? 'text-emerald-400' : 'text-red-400`
                }`}>
                  {plumbingKPIs.completionChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(plumbingKPIs.completionChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{plumbingKPIs.completionRate}%</div>
              <div className="text-xs text-neutral-500 mb-2">First visit success</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '${plumbingKPIs.completionRate}%' }}></div>
              </div>
            </div>

            {/* Water Quality Issues */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-neutral-300">Water Quality Issues</span>
                <div className={'flex items-center gap-1 text-xs ${
                  plumbingKPIs.qualityChange >= 0 ? 'text-red-400' : 'text-emerald-400'
                }'}>
                  {plumbingKPIs.qualityChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(plumbingKPIs.qualityChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{plumbingKPIs.waterQualityIssues}</div>
              <div className="text-xs text-neutral-500 mb-2">Cases resolved</div>
              <SparkLine 
                data={abstractData.sparklines[4]} 
                width={120} 
                height={20} 
                color="#06b6d4"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plumbing Revenue Performance Chart */}
      <div className="w-full bg-neutral-950 border-b border-neutral-800">
        <div className="px-6 py-3 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-neutral-100">Plumbing Service Revenue & Emergency Response</h3>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                Real-time Service Tracking
              </Badge>
            </div>
          </div>
        </div>
        <div className="h-96 w-full">
          {dashboardData.plumbingRevenue && (
            <TradingViewWrapper
              data={dashboardData.plumbingRevenue as TradingViewChartData[]}
              type="candlestick"
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
          
          {/* Plumbing Services & Emergency Response */}
          <div className="grid grid-cols-2 gap-6">
            {/* Service Type Breakdown */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Waves className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Plumbing Service Breakdown</h3>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs ml-auto">
                    {plumbingServices.reduce((sum, service) => sum + service.jobs, 0)} Total Jobs
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {plumbingServices.map((service, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-neutral-100">{service.service}</div>
                          <div className={'w-2 h-2 rounded-full ${
                            service.trend === 'up' ? 'bg-emerald-500' :
                            service.trend === 'down' ? 'bg-red-500' : 'bg-yellow-500'
                          }'}></div>
                        </div>
                        <div className={'text-xs px-2 py-1 rounded ${
                          service.urgency === 'High' ? 'bg-red-500/20 text-red-400' :
                          service.urgency === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                        }'}>
                          {service.urgency} Priority
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs mb-2">
                        <div>
                          <div className="text-blue-400 font-semibold">{service.jobs} jobs</div>
                          <div className="text-neutral-400">${service.avgRevenue} avg</div>
                        </div>
                        <div>
                          <div className="text-emerald-400 font-semibold">{service.completionRate}%</div>
                          <div className="text-neutral-400">{service.avgDuration}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-700/50">
                        <span className="text-neutral-400">Emergency Rate:</span>
                        <span className={'font-semibold ${
                          service.emergencyRate > 40 ? 'text-red-400' :
                          service.emergencyRate > 20 ? 'text-yellow-400' : 'text-emerald-400'
                        }'}>
                          {service.emergencyRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Response Metrics */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-red-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Emergency Response Metrics</h3>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs ml-auto">
                    24/7 Service
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {emergencyMetrics.map((emergency, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-neutral-100">{emergency.type}</div>
                          <div className={'text-xs px-2 py-1 rounded ${
                            emergency.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                          }'}>
                            {emergency.priority}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-neutral-100">{emergency.calls}</div>
                          <div className="text-xs text-neutral-400">calls</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-blue-400 font-semibold">{emergency.avgResponseTime}</div>
                          <div className="text-neutral-400">Response</div>
                        </div>
                        <div>
                          <div className="text-emerald-400 font-semibold">{emergency.avgRepairTime}</div>
                          <div className="text-neutral-400">Repair Time</div>
                        </div>
                        <div>
                          <div className="text-yellow-400 font-semibold">{emergency.satisfaction}/5</div>
                          <div className="text-neutral-400">Rating</div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-neutral-700/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-400">Avg Cost:</span>
                          <span className="text-emerald-400 font-semibold">${emergency.avgCost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Water Quality Issues Analysis */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-neutral-100">Water Quality Issues Analysis</h3>
                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs ml-auto">
                  Preventive Solutions
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {waterQualityIssues.map((issue, index) => (
                  <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-neutral-100">{issue.issue}</div>
                      <div className={'text-xs px-2 py-1 rounded ${
                        issue.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                        issue.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                      }'}>
                        {issue.severity}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <div className="text-blue-400 font-semibold">{issue.cases}</div>
                        <div className="text-neutral-400 text-xs">Cases</div>
                      </div>
                      <div>
                        <div className="text-emerald-400 font-semibold">${issue.avgCost}</div>
                        <div className="text-neutral-400 text-xs">Avg Cost</div>
                      </div>
                    </div>
                    <div className="text-xs text-neutral-300 mb-2">
                      <span className="text-neutral-400">Solution:</span> {issue.resolution}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Preventable:</span>
                      <span className={'font-semibold ${issue.preventable ? 'text-emerald-400' : 'text-red-400'}'}>
                        {issue.preventable ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Plumbing Technicians */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-neutral-100">Top Plumbing Technicians</h3>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs ml-auto">
                  Performance Leaders
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {topPlumbers.map((plumber, index) => (
                  <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium text-sm">
                          {plumber.name.split(' ').map(n => n[0]).join(')}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-100">{plumber.name}</div>
                          <div className="text-sm text-neutral-400">{plumber.specialty}</div>
                          {plumber.emergencyExpert && (
                            <div className="text-xs text-red-400 font-medium">Emergency Specialist</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-yellow-400">{plumber.avgRating}</div>
                        <div className="text-sm text-neutral-400">Rating</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-400">{plumber.jobsCompleted}</div>
                        <div className="text-xs text-neutral-400">Jobs Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-orange-400">{plumber.avgResponseTime}</div>
                        <div className="text-xs text-neutral-400">Response Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-emerald-400">${plumber.avgJobValue}</div>
                        <div className="text-xs text-neutral-400">Avg Job Value</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-400">{plumber.certifications.length}</div>
                        <div className="text-xs text-neutral-400">Certifications</div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-neutral-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-400">Certifications:</span>
                          {plumber.certifications.slice(0, 2).map((cert, i) => (
                            <span key={i} className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                              {cert}
                            </span>
                          ))}
                        </div>
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
              <span className="text-neutral-400">Plumbing System:</span>
              <span className="text-emerald-400">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Emergency Rate:</span>
              <span className="text-orange-400">{plumbingKPIs.emergencyRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Water Quality Issues:</span>
              <span className="text-cyan-400">{plumbingKPIs.waterQualityIssues}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Completion Rate:</span>
              <span className="text-emerald-400">{plumbingKPIs.completionRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Avg Revenue:</span>
              <span className="text-emerald-400">${plumbingKPIs.avgRevenue}</span>
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