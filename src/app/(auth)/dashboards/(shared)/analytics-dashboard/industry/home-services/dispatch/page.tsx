"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  CalendarDays,
  Clock,
  Users,
  MapPin,
  Phone,
  CheckCircle,
  AlertTriangle,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  TrendingUp,
  BarChart3,
  Filter,
  Settings,
  Download,
  RefreshCw,
  Maximize2,
  Play,
  Pause,
  Target,
  Truck
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

export default function DispatchSchedulingAnalytics() {
  const searchParams = useSearchParams();
  const region = searchParams.get('region') || 'all';

  // State management for dispatch dashboard
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const realTimeStreamRef = useRef(null);
  
  // Initialize dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      const homeServicesGenerator = chartsModule.generators.homeServices;
      const rawData = homeServicesGenerator(24, true); // 24 hour data for dispatch
      
      setDashboardData({
        dispatchVolume: rawData.jobsCompleted || [],
        responseTime: rawData.customerSatisfaction || [],
        technicianUtilization: rawData.revenue || [],
        technicalData: chartsModule.formatters.candlestick(rawData.jobsCompleted || [], 0.15),
        volumeData: chartsModule.formatters.histogram(rawData.revenue || [], 0.3),
      });
      
      setIsLoading(false);
    };
    
    loadDashboardData();
  }, [region]);
  
  // Real-time dispatch data
  useEffect(() => {
    if (isRealTimeActive) {
      realTimeStreamRef.current = new chartsModule.realTime('dispatch', 3000);
      
      realTimeStreamRef.current.subscribe('dispatch', (dataPoint) => {
        setDashboardData(prev => ({
          ...prev,
          dispatchVolume: [...prev.dispatchVolume.slice(-23), dataPoint]
        }));
      });
      
      return () => {
        if (realTimeStreamRef.current) {
          realTimeStreamRef.current.stop();
        }
      };
    }
  }, [isRealTimeActive]);

  // Dispatch-specific data
  const dispatchKPIs = {
    totalCalls: 247,
    callsChange: 8.3,
    avgResponseTime: '14 min',
    responseChange: -5.2,
    completedJobs: 189,
    completionChange: 12.4,
    utilization: 87.3,
    utilizationChange: 4.1
  };

  const currentDispatchQueue = [
    {
      priority: 'Emergency',
      customer: 'Sarah Martinez',
      address: '1247 Oak Street',
      issue: 'No hot water',
      waitTime: '12 min',
      technician: 'Mike R.',
      eta: '18 min',
      status: 'En Route'
    },
    {
      priority: 'High',
      customer: 'David Chen',
      address: '856 Pine Avenue',
      issue: 'HVAC not cooling',
      waitTime: '28 min',
      technician: 'Sarah J.',
      eta: '35 min',
      status: 'Scheduled'
    },
    {
      priority: 'Normal',
      customer: 'Amy Williams',
      address: '432 Elm Drive',
      issue: 'Electrical outlet repair',
      waitTime: '45 min',
      technician: 'David C.',
      eta: '1hr 15min',
      status: 'Queued'
    }
  ];

  const technicianStatus = [
    { name: 'Mike Rodriguez', status: 'On Job', location: 'Downtown', currentJob: 'Plumbing repair', progress: 75 },
    { name: 'Sarah Johnson', status: 'En Route', location: 'North Side', currentJob: 'HVAC maintenance', progress: 0 },
    { name: 'David Chen', status: 'Available', location: 'Central', currentJob: null, progress: 0 },
    { name: 'Amy Williams', status: 'On Break', location: 'South Side', currentJob: null, progress: 0 },
    { name: 'Carlos Martinez', status: 'On Job', location: 'West End', currentJob: 'Electrical install', progress: 45 }
  ];

  const hourlyStats = [
    { hour: '6 AM', calls: 12, completed: 8, avgTime: '22 min' },
    { hour: '7 AM', calls: 18, completed: 15, avgTime: '19 min' },
    { hour: '8 AM', calls: 24, completed: 22, avgTime: '16 min' },
    { hour: '9 AM', calls: 31, completed: 28, avgTime: '14 min' },
    { hour: '10 AM', calls: 28, completed: 26, avgTime: '12 min' },
    { hour: '11 AM', calls: 22, completed: 20, avgTime: '15 min' }
  ];

  // Generate sample data for visualizations
  const generateSparkData = (count: number) => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 3600000, // Hourly data
      value: 15 + Math.random() * 40
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(24),
      generateSparkData(24),
      generateSparkData(24)
    ],
    performanceMetrics: [
      { label: 'Response Time', value: 89, maxValue: 100, color: '#10b981' },
      { label: 'Schedule Adherence', value: 94, maxValue: 100, color: '#1C8BFF' },
      { label: 'Customer Satisfaction', value: 92, maxValue: 100, color: '#f59e0b' }
    ],
    systemHealth: [
      { name: 'Dispatch System', metrics: [98, 96, 99, 97] },
      { name: 'GPS Tracking', metrics: [94, 97, 95, 96] },
      { name: 'Communication', metrics: [91, 93, 89, 94] }
    ],
    dataFlows: [
      { from: 'Incoming Calls', to: 'Dispatch Queue', volume: 247, color: '#10b981' },
      { from: 'Dispatch Queue', to: 'Technicians', volume: 189, color: '#1C8BFF' },
      { from: 'Job Completion', to: 'Customer Follow-up', volume: 178, color: '#f59e0b' }
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading dispatch analytics...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Professional Dispatch Header */}
      <div className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded border border-blue-500/20 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-100">Dispatch & Scheduling Analytics</h1>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>Real-time Dispatch Operations</span>
                  <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                  <span>Live Queue Management</span>
                  {isRealTimeActive && (
                    <>
                      <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-emerald-400">Live Updates</span>
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
                onClick={() => setSelectedTimeframe('1h')}
                className={'px-3 py-1.5 text-xs transition-colors ${
                  selectedTimeframe === '1h'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                1H
              </button>
              <button
                onClick={() => setSelectedTimeframe('24h')}
                className={'px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 ${
                  selectedTimeframe === '24h'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                24H
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

      {/* Real-time Dispatch KPIs */}
      <div className="border-b border-neutral-800">
        <div className="px-6 py-4">
          <div className="grid grid-cols-4 gap-8 mb-6">
            {/* Total Calls */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Total Calls Today</span>
                <div className={'flex items-center gap-1 text-xs ${
                  dispatchKPIs.callsChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {dispatchKPIs.callsChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(dispatchKPIs.callsChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{dispatchKPIs.totalCalls}</div>
              <div className="text-xs text-neutral-500 mb-2">Since 6:00 AM</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={140} 
                height={20} 
                color="#1C8BFF"
              />
            </div>

            {/* Average Response Time */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Timer className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Response Time</span>
                <div className={'flex items-center gap-1 text-xs ${
                  dispatchKPIs.responseChange >= 0 ? 'text-red-400' : 'text-emerald-400'
                }'}>
                  {dispatchKPIs.responseChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(dispatchKPIs.responseChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{dispatchKPIs.avgResponseTime}</div>
              <div className="text-xs text-neutral-500 mb-2">Emergency calls</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            {/* Completed Jobs */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-neutral-300">Jobs Completed</span>
                <div className={'flex items-center gap-1 text-xs ${
                  dispatchKPIs.completionChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {dispatchKPIs.completionChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(dispatchKPIs.completionChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{dispatchKPIs.completedJobs}</div>
              <div className="text-xs text-neutral-500 mb-2">Today so far</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={140} 
                height={20} 
                color="#10b981"
              />
            </div>

            {/* Technician Utilization */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-neutral-300">Tech Utilization</span>
                <div className={'flex items-center gap-1 text-xs ${
                  dispatchKPIs.utilizationChange >= 0 ? 'text-emerald-400' : 'text-red-400`
                }`}>
                  {dispatchKPIs.utilizationChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(dispatchKPIs.utilizationChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{dispatchKPIs.utilization}%</div>
              <div className="text-xs text-neutral-500 mb-2">Current efficiency</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: '${dispatchKPIs.utilization}%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Dispatch Volume Chart */}
      <div className="w-full bg-neutral-950 border-b border-neutral-800">
        <div className="px-6 py-3 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-neutral-100">Real-time Dispatch Volume & Performance</h3>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                Live Dispatch Feed
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Updated {new Date().toLocaleTimeString()}</span>
              <button className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded transition-colors">
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="h-96 w-full">
          {dashboardData.dispatchVolume && (
            <TradingViewWrapper
              data={dashboardData.dispatchVolume as TradingViewChartData[]}
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

      {/* Main Content Sections */}
      <div className="overflow-y-auto">
        <div className="px-6 py-6 space-y-8">
          
          {/* Current Dispatch Queue and Technician Status */}
          <div className="grid grid-cols-2 gap-6">
            {/* Live Dispatch Queue */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Live Dispatch Queue</h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs ml-auto">
                    {currentDispatchQueue.length} Active
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {currentDispatchQueue.map((job, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={'w-2 h-2 rounded-full ${
                            job.priority === 'Emergency' ? 'bg-red-500' :
                            job.priority === 'High' ? 'bg-orange-500' : 'bg-green-500'
                          } animate-pulse'}></div>
                          <span className={'text-xs px-2 py-1 rounded ${
                            job.priority === 'Emergency' ? 'bg-red-500/20 text-red-400' :
                            job.priority === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                          }'}>
                            {job.priority}
                          </span>
                          <span className="text-xs text-neutral-400">Wait: {job.waitTime}</span>
                        </div>
                        <div className={'text-xs px-2 py-1 rounded ${
                          job.status === 'En Route' ? 'bg-blue-500/20 text-blue-400' :
                          job.status === 'Scheduled' ? 'bg-purple-500/20 text-purple-400' : 'bg-neutral-700/50 text-neutral-300'
                        }'}>
                          {job.status}
                        </div>
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-neutral-100 text-sm">{job.customer}</div>
                          <div className="text-xs text-neutral-400 mb-1">{job.address}</div>
                          <div className="text-xs text-neutral-300">{job.issue}</div>
                        </div>
                        <div className="text-right text-xs">
                          <div className="text-neutral-300">{job.technician}</div>
                          <div className="text-neutral-400">ETA: {job.eta}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Technician Status Board */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Technician Status Board</h3>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs ml-auto">
                    {technicianStatus.filter(t => t.status === 'On Job' || t.status === 'En Route').length} Active
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {technicianStatus.map((tech, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                            {tech.name.split(' ').map(n => n[0]).join(')}
                          </div>
                          <div className="font-medium text-neutral-100 text-sm">{tech.name}</div>
                        </div>
                        <div className={'text-xs px-2 py-1 rounded ${
                          tech.status === 'On Job' ? 'bg-emerald-500/20 text-emerald-400' :
                          tech.status === 'En Route' ? 'bg-blue-500/20 text-blue-400' :
                          tech.status === 'Available' ? 'bg-green-500/20 text-green-400' : 'bg-neutral-700/50 text-neutral-300`
                        }`}>
                          {tech.status}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="text-neutral-400">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {tech.location}
                        </div>
                        {tech.currentJob && (
                          <div className="text-neutral-300">
                            {tech.currentJob}
                            {tech.progress > 0 && (
                              <span className="text-emerald-400 ml-1">({tech.progress}%)</span>
                            )}
                          </div>
                        )}
                      </div>
                      {tech.progress > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-neutral-800 rounded-full h-1">
                            <div className="bg-emerald-400 h-1 rounded-full transition-all duration-300" style={{ width: `${tech.progress}%' }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Performance Analysis */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-medium text-neutral-100">Hourly Performance Analysis</h3>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs ml-auto">
                  Today's Breakdown
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-3 px-4 font-medium text-neutral-300">Hour</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Calls Received</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Jobs Completed</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Avg Response</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hourlyStats.map((hour, index) => (
                      <tr key={index} className="border-b border-neutral-800/50">
                        <td className="py-4 px-4 text-white font-medium">{hour.hour}</td>
                        <td className="py-4 px-4 text-right text-neutral-300">{hour.calls}</td>
                        <td className="py-4 px-4 text-right text-emerald-400">{hour.completed}</td>
                        <td className="py-4 px-4 text-right text-neutral-300">{hour.avgTime}</td>
                        <td className="py-4 px-4 text-right">
                          <span className={'${
                            (hour.completed / hour.calls) > 0.85 ? 'text-emerald-400' : 
                            (hour.completed / hour.calls) > 0.70 ? 'text-yellow-400' : 'text-red-400'
                          }'}>
                            {Math.round((hour.completed / hour.calls) * 100)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* System Performance and Data Flow */}
          <div className="grid grid-cols-3 gap-6">
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-medium text-neutral-100">System Health</h3>
                </div>
              </div>
              <div className="p-4">
                <SystemHealthMatrix systems={abstractData.systemHealth} />
              </div>
            </div>

            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Dispatch Flow</h3>
                </div>
              </div>
              <div className="p-4">
                <DataFlowViz flows={abstractData.dataFlows} />
              </div>
            </div>

            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Performance Metrics</h3>
                </div>
              </div>
              <div className="p-4 flex items-center justify-center">
                <PerformanceRing 
                  metrics={abstractData.performanceMetrics}
                  size={120}
                />
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
              <span className="text-neutral-400">Dispatch System:</span>
              <span className="text-emerald-400">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Active Technicians:</span>
              <span className="text-neutral-300">{technicianStatus.filter(t => t.status === 'On Job' || t.status === 'En Route').length} in field</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Queue Status:</span>
              <span className="text-neutral-300">{currentDispatchQueue.length} pending</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Avg Response:</span>
              <span className="text-emerald-400">{dispatchKPIs.avgResponseTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Data Stream:</span>
              <span className="text-neutral-300">{isRealTimeActive ? 'Live' : 'Paused'}</span>
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