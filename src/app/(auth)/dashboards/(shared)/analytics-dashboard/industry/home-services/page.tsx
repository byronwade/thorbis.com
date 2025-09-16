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
  Wrench,
  Home,
  Thermometer,
  Zap as Electric,
  Droplets,
  Star,
  MapPin,
  Phone,
  Calendar as CalendarIcon,
  Timer
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

export default function HomeServicesAnalyticsPlatform() {
  const searchParams = useSearchParams();
  const region = searchParams.get('region') || 'all';

  // State management for home services dashboard
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const realTimeStreamRef = useRef(null);
  
  // Initialize dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Generate home services specific data
      const homeServicesGenerator = chartsModule.generators.homeServices;
      const rawData = homeServicesGenerator(30, true);
      
      // Process data for home services KPIs
      setDashboardData({
        jobsCompleted: rawData.jobsCompleted || [],
        revenue: rawData.revenue || [],
        customerSatisfaction: rawData.customerSatisfaction || [],
        technicalData: chartsModule.formatters.candlestick(rawData.revenue || [], 0.18),
        volumeData: chartsModule.formatters.histogram(rawData.jobsCompleted || [], 0.25),
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
  }, [region]);
  
  // Real-time data streaming for jobs
  useEffect(() => {
    if (isRealTimeActive) {
      realTimeStreamRef.current = new chartsModule.realTime('homeServices', 4000);
      
      realTimeStreamRef.current.subscribe('jobs', (dataPoint) => {
        setDashboardData(prev => ({
          ...prev,
          jobsCompleted: [...prev.jobsCompleted.slice(-29), dataPoint]
        }));
      });
      
      return () => {
        if (realTimeStreamRef.current) {
          realTimeStreamRef.current.stop();
        }
      };
    }
  }, [isRealTimeActive]);

  // Home Services specific data
  const departmentData = [
    {
      department: 'HVAC',
      revenue: '$324,580',
      jobs: 487,
      avgValue: '$667',
      efficiency: '92.1%',
      rating: 4.9,
      technicians: 8,
      color: 'text-blue-400'
    },
    {
      department: 'Plumbing',
      revenue: '$298,745',
      jobs: 623,
      avgValue: '$479',
      efficiency: '94.8%',
      rating: 4.7,
      technicians: 6,
      color: 'text-cyan-400'
    },
    {
      department: 'Electrical',
      revenue: '$187,320',
      jobs: 312,
      avgValue: '$600',
      efficiency: '88.3%',
      rating: 4.8,
      technicians: 5,
      color: 'text-yellow-400'
    },
    {
      department: 'General Repair',
      revenue: '$156,890',
      jobs: 234,
      avgValue: '$671',
      efficiency: '96.2%',
      rating: 4.6,
      technicians: 4,
      color: 'text-green-400'
    }
  ];

  const topTechnicians = [
    {
      name: 'Mike Rodriguez',
      department: 'HVAC',
      jobs: 87,
      revenue: '$42,580',
      rating: 4.9,
      efficiency: '97.2%',
      responseTime: '12 min'
    },
    {
      name: 'Sarah Johnson',
      department: 'Plumbing',
      jobs: 92,
      revenue: '$38,940',
      rating: 4.8,
      efficiency: '96.1%',
      responseTime: '15 min'
    },
    {
      name: 'David Chen',
      department: 'Electrical',
      jobs: 78,
      revenue: '$41,230',
      rating: 4.9,
      efficiency: '94.7%',
      responseTime: '18 min'
    },
    {
      name: 'Amy Williams',
      department: 'General Repair',
      jobs: 65,
      revenue: '$39,870',
      rating: 4.7,
      efficiency: '98.3%',
      responseTime: '14 min'
    }
  ];

  const serviceAreas = [
    { area: 'Downtown', jobs: 234, revenue: '$156,780', avgResponse: '18 min', satisfaction: 4.8 },
    { area: 'Suburbs North', jobs: 189, revenue: '$128,450', avgResponse: '22 min', satisfaction: 4.7 },
    { area: 'Suburbs South', jobs: 167, revenue: '$112,340', avgResponse: '25 min', satisfaction: 4.6 },
    { area: 'Industrial District', jobs: 145, revenue: '$98,760', avgResponse: '28 min', satisfaction: 4.5 },
    { area: 'Residential East', jobs: 123, revenue: '$87,230', avgResponse: '20 min', satisfaction: 4.8 }
  ];

  // Generate sample data for abstract visualizations
  const generateSparkData = (count: number) => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: 45 + Math.random() * 55
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(15),
      generateSparkData(15),
      generateSparkData(15)
    ],
    performanceMetrics: [
      { label: 'Service Quality', value: 94, maxValue: 100, color: '#10b981' },
      { label: 'Response Time', value: 88, maxValue: 100, color: '#1C8BFF' },
      { label: 'First-Fix Rate', value: 91, maxValue: 100, color: '#f59e0b' }
    ],
    systemHealth: [
      { name: 'Dispatch System', metrics: [97, 94, 98, 96] },
      { name: 'GPS Tracking', metrics: [92, 95, 93, 94] },
      { name: 'Customer Portal', metrics: [96, 98, 95, 97] }
    ],
    dataFlows: [
      { from: 'Calls', to: 'Dispatch', volume: 1850, color: '#10b981' },
      { from: 'Dispatch', to: 'Technicians', volume: 1640, color: '#1C8BFF' },
      { from: 'Completion', to: 'Billing', volume: 1580, color: '#f59e0b' }
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading Home Services analytics...</span>
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
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Home className="h-4 w-4 text-orange-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-100">Home Services Analytics</h1>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="capitalize">Service Operations Intelligence</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <span>Multi-Department Tracking</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-orange-400">Live Dispatch</span>
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
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            7D
          </button>
          <button
            onClick={() => setSelectedTimeframe('30d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '30d'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            30D
          </button>
          <button
            onClick={() => setSelectedTimeframe('90d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '90d'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
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
        {/* Home Services KPIs */}
        <div className="px-8 py-6 bg-neutral-950">
          <div className="grid grid-cols-4 gap-6">
            {/* Jobs Completed */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-300">Jobs Completed</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +8.2%
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-400">1,247</div>
              <div className="text-xs text-neutral-500 mb-3">This month</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={120} 
                height={24} 
                color="#10b981"
              />
            </div>

            {/* Average Response Time */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Response</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowDownRight className="h-3 w-3" />
                  -5.1%
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-400">18 min</div>
              <div className="text-xs text-neutral-500 mb-3">Emergency calls</div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full transition-all duration-1000" style={{ width: '88%' }}></div>
              </div>
            </div>

            {/* Customer Rating */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-neutral-300">Customer Rating</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +2.1%
                </div>
              </div>
              <div className="text-3xl font-bold text-yellow-400">4.8/5</div>
              <div className="text-xs text-neutral-500 mb-3">Average score</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={120} 
                height={24} 
                color="#f59e0b"
              />
            </div>

            {/* First-Fix Rate */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-300">First-Fix Rate</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +4.2%
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-400">87.3%</div>
              <div className="text-xs text-neutral-500 mb-3">Success rate</div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Operations Chart - Full Width */}
        <div className="w-full bg-neutral-950 relative">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-400" />
                <h3 className="text-lg font-medium text-neutral-100">Service Operations & Performance</h3>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">Live Dispatch Data</Badge>
              </div>
            </div>
          </div>
          <div className="h-96 w-full pointer-events-auto">
            {dashboardData.jobsCompleted && (
              <TradingViewWrapper
                data={dashboardData.jobsCompleted as TradingViewChartData[]}
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

        {/* Home Services Analytics Sections */}
        <div className="space-y-8 px-8 py-6 bg-neutral-950">
          
          {/* Department Performance */}
          <div className="bg-neutral-900/50 border border-neutral-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Wrench className="h-4 w-4 text-cyan-400" />
              <h3 className="text-lg font-medium text-neutral-100">Department Performance</h3>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">Multi-Trade Analysis</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left py-3 px-4 font-medium text-neutral-300">Department</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Revenue</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Jobs</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Avg Value</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Efficiency</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Rating</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Technicians</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentData.map((dept, index) => (
                    <tr key={index} className="border-b border-neutral-800/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className={'h-3 w-3 rounded-full mr-3 ${
                            dept.department === 'HVAC' ? 'bg-blue-500' :
                            dept.department === 'Plumbing' ? 'bg-cyan-500' :
                            dept.department === 'Electrical' ? 'bg-yellow-500' : 'bg-green-500'
                          }'}></div>
                          <div className="flex items-center gap-2">
                            {dept.department === 'HVAC' && <Thermometer className="h-4 w-4 text-blue-400" />}
                            {dept.department === 'Plumbing' && <Droplets className="h-4 w-4 text-cyan-400" />}
                            {dept.department === 'Electrical' && <Electric className="h-4 w-4 text-yellow-400" />}
                            {dept.department === 'General Repair' && <Wrench className="h-4 w-4 text-green-400" />}
                            <span className="text-white font-medium">{dept.department}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-white">{dept.revenue}</td>
                      <td className="py-4 px-4 text-right text-neutral-300">{dept.jobs}</td>
                      <td className="py-4 px-4 text-right text-neutral-300">{dept.avgValue}</td>
                      <td className="py-4 px-4 text-right">
                        <span className={'${
                          parseFloat(dept.efficiency) > 90 ? 'text-green-400' : 
                          parseFloat(dept.efficiency) > 80 ? 'text-yellow-400' : 'text-red-400'
                        }'}>
                          {dept.efficiency}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-white">{dept.rating}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-neutral-300">{dept.technicians}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Technicians and Service Areas */}
          <div className="grid grid-cols-2 gap-6">
            {/* Top Technicians */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-neutral-100">Top Performing Technicians</h3>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Monthly Leaders</Badge>
              </div>
              <div className="space-y-4">
                {topTechnicians.map((tech, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-medium text-sm mr-3">
                        {tech.name.split(' ').map(n => n[0]).join(')}
                      </div>
                      <div>
                        <div className="text-white font-medium">{tech.name}</div>
                        <div className="text-sm text-neutral-400 flex items-center gap-2">
                          <span>{tech.department}</span>
                          <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                          <Timer className="h-3 w-3" />
                          <span>{tech.responseTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{tech.revenue}</div>
                      <div className="text-sm text-neutral-400">{tech.jobs} jobs</div>
                      <div className="text-xs text-emerald-400 flex items-center justify-end gap-1">
                        <Star className="h-3 w-3" />
                        {tech.rating} • {tech.efficiency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Areas */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-medium text-neutral-100">Service Area Performance</h3>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Geographic Analysis</Badge>
              </div>
              <div className="space-y-4">
                {serviceAreas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-xs font-medium text-blue-400">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-100">{area.area}</div>
                        <div className="text-sm text-neutral-400 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {area.avgResponse} avg
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-neutral-100">{area.revenue}</div>
                      <div className="text-sm text-neutral-400">{area.jobs} jobs</div>
                      <div className="text-xs text-yellow-400 flex items-center justify-end gap-1">
                        <Star className="h-3 w-3" />
                        {area.satisfaction}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Job Distribution and Revenue Breakdown */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Service Type Distribution</h3>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">Job Categories</Badge>
                </div>
                {dashboardData.customerSatisfaction && (
                  <ModernDoughnutChart
                    data={dashboardData.customerSatisfaction.slice(-6)}
                    segments={['HVAC', 'Plumbing', 'Electrical', 'General Repair', 'Emergency', 'Maintenance']}
                    height={240}
                  />
                )}
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-4 w-4 text-orange-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Revenue Trend by Service</h3>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">Monthly Comparison</Badge>
                </div>
                {dashboardData.revenue && (
                  <ModernBarChart
                    data={dashboardData.revenue.slice(-12)}
                    height={240}
                  />
                )}
              </div>
            </div>
          </div>

          {/* System Health and Operations Flow */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-medium text-neutral-100">Operations Health</h3>
              </div>
              <SystemHealthMatrix systems={abstractData.systemHealth} />
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-neutral-100">Service Flow</h3>
              </div>
              <DataFlowViz flows={abstractData.dataFlows} />
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-medium text-neutral-100">Service Performance</h3>
              </div>
              <div className="flex items-center justify-center h-32">
                <PerformanceRing 
                  metrics={abstractData.performanceMetrics}
                  size={120}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/50 border-t border-neutral-800 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-neutral-400">Dispatch System: </span>
            <span className="text-orange-400">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Active Technicians: </span>
            <span className="text-neutral-300">23 in field</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Pending Jobs: </span>
            <span className="text-neutral-300">7 scheduled</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Avg Response: </span>
            <span className="text-emerald-400">18 min</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Customer Rating: </span>
            <span className="text-yellow-300">4.8/5</span>
          </div>
          <button className="flex items-center gap-1 text-neutral-400 hover:text-neutral-100 transition-colors">
            <RefreshCw className="h-3 w-3" />
            Update Now
          </button>
        </div>
      </div>
    </div>
  );
}