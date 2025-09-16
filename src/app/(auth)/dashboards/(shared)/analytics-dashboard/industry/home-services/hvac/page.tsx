"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  Thermometer,
  Wind,
  Snowflake,
  Zap,
  Wrench,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle,
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
  Battery,
  Gauge
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

export default function HVACAnalytics() {
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
        hvacRevenue: rawData.revenue || [],
        serviceVolume: rawData.jobsCompleted || [],
        efficiency: rawData.customerSatisfaction || [],
      });
      
      setIsLoading(false);
    };
    
    loadDashboardData();
  }, [selectedTimeframe]);

  // HVAC-specific KPIs
  const hvacKPIs = {
    totalJobs: 432,
    jobsChange: 15.7,
    avgRevenue: 847.50,
    revenueChange: 12.3,
    completionRate: 94.8,
    completionChange: 3.2,
    emergencyCallouts: 67,
    emergencyChange: -8.4,
    efficiency: 89.4,
    efficiencyChange: 6.1
  };

  // HVAC service breakdown
  const hvacServices = [
    {
      service: 'AC Repair',
      jobs: 156,
      avgRevenue: 485.00,
      avgDuration: '2.5 hrs',
      completionRate: 96.2,
      urgency: 'High',
      trend: 'up',
      seasonality: 'Peak Season'
    },
    {
      service: 'Heating Repair',
      jobs: 89,
      avgRevenue: 425.00,
      avgDuration: '2.2 hrs',
      completionRate: 94.4,
      urgency: 'Medium',
      trend: 'down',
      seasonality: 'Off Season'
    },
    {
      service: 'System Installation',
      jobs: 34,
      avgRevenue: 2840.00,
      avgDuration: '8.5 hrs',
      completionRate: 100.0,
      urgency: 'Low',
      trend: 'up',
      seasonality: 'Year Round'
    },
    {
      service: 'Preventive Maintenance',
      jobs: 98,
      avgRevenue: 185.00,
      avgDuration: '1.5 hrs',
      completionRate: 98.0,
      urgency: 'Low',
      trend: 'stable',
      seasonality: 'Year Round'
    },
    {
      service: 'Ductwork Services',
      jobs: 55,
      avgRevenue: 675.00,
      avgDuration: '4.2 hrs',
      completionRate: 92.7,
      urgency: 'Medium',
      trend: 'up',
      seasonality: 'Year Round'
    }
  ];

  // Equipment diagnostics
  const equipmentDiagnostics = [
    {
      equipment: 'Central Air Units',
      totalUnits: 1247,
      operational: 1189,
      needsMaintenance: 42,
      criticalIssues: 16,
      avgAge: 8.4,
      efficiency: 87.2
    },
    {
      equipment: 'Heat Pumps',
      totalUnits: 892,
      operational: 865,
      needsMaintenance: 18,
      criticalIssues: 9,
      avgAge: 6.2,
      efficiency: 91.8
    },
    {
      equipment: 'Furnaces',
      totalUnits: 634,
      operational: 598,
      needsMaintenance: 28,
      criticalIssues: 8,
      avgAge: 12.1,
      efficiency: 82.4
    },
    {
      equipment: 'Boilers',
      totalUnits: 278,
      operational: 269,
      needsMaintenance: 7,
      criticalIssues: 2,
      avgAge: 15.3,
      efficiency: 78.9
    }
  ];

  // Seasonal trends
  const seasonalTrends = [
    { month: 'Jan', heating: 234, cooling: 12, maintenance: 45 },
    { month: 'Feb', heating: 198, cooling: 8, maintenance: 38 },
    { month: 'Mar', heating: 156, cooling: 24, maintenance: 52 },
    { month: 'Apr', heating: 89, cooling: 67, maintenance: 61 },
    { month: 'May', heating: 45, cooling: 134, maintenance: 58 },
    { month: 'Jun', heating: 23, cooling: 287, maintenance: 42 },
    { month: 'Jul', heating: 18, cooling: 345, maintenance: 38 },
    { month: 'Aug', heating: 21, cooling: 298, maintenance: 41 }
  ];

  // Top technicians for HVAC
  const topHVACTechnicians = [
    {
      name: 'Marcus Thompson',
      specialty: 'AC Systems',
      jobsCompleted: 87,
      avgRating: 4.9,
      avgJobValue: 525.00,
      certifications: ['EPA 608', 'NATE Certified'],
      efficiency: 94.2
    },
    {
      name: 'Lisa Rodriguez',
      specialty: 'Heat Pumps',
      jobsCompleted: 76,
      avgRating: 4.8,
      avgJobValue: 485.00,
      certifications: ['HVAC Excellence', 'EPA 608'],
      efficiency: 91.8
    },
    {
      name: 'James Wilson',
      specialty: 'Commercial HVAC',
      jobsCompleted: 52,
      avgRating: 4.9,
      avgJobValue: 1285.00,
      certifications: ['Commercial License', 'NATE Certified'],
      efficiency: 96.4
    },
    {
      name: 'Sarah Chen',
      specialty: 'System Installation',
      jobsCompleted: 24,
      avgRating: 4.9,
      avgJobValue: 2840.00,
      certifications: ['Master HVAC', 'EPA 608'],
      efficiency: 98.1
    }
  ];

  // Generate sample data
  const generateSparkData = (count: number, trend: 'up' | 'down' | 'stable' = 'up') => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: trend === 'up' ? 400 + i * 15 + Math.random() * 100 :
             trend === 'down' ? 800 - i * 10 + Math.random() * 80 :
             450 + Math.random() * 150
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(30, 'up'),
      generateSparkData(30, 'up'),
      generateSparkData(30, 'stable'),
      generateSparkData(30, 'up'),
      generateSparkData(30, 'down')
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading HVAC analytics...</span>
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
                <Thermometer className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-100">HVAC Analytics</h1>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>Heating, Ventilation & Air Conditioning performance</span>
                  <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                  <span>System efficiency & maintenance tracking</span>
                  {isRealTimeActive && (
                    <>
                      <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-emerald-400">Real-time Equipment Data</span>
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

      {/* HVAC Performance KPIs */}
      <div className="border-b border-neutral-800">
        <div className="px-6 py-4">
          <div className="grid grid-cols-5 gap-6 mb-6">
            {/* Total HVAC Jobs */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Total HVAC Jobs</span>
                <div className={'flex items-center gap-1 text-xs ${
                  hvacKPIs.jobsChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {hvacKPIs.jobsChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(hvacKPIs.jobsChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{hvacKPIs.totalJobs}</div>
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
                  hvacKPIs.revenueChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {hvacKPIs.revenueChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(hvacKPIs.revenueChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">${hvacKPIs.avgRevenue}</div>
              <div className="text-xs text-neutral-500 mb-2">Per service call</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={120} 
                height={20} 
                color="#10b981"
              />
            </div>

            {/* Completion Rate */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-neutral-300">Completion Rate</span>
                <div className={'flex items-center gap-1 text-xs ${
                  hvacKPIs.completionChange >= 0 ? 'text-emerald-400' : 'text-red-400`
                }`}>
                  {hvacKPIs.completionChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(hvacKPIs.completionChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{hvacKPIs.completionRate}%</div>
              <div className="text-xs text-neutral-500 mb-2">First visit success</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '${hvacKPIs.completionRate}%' }}></div>
              </div>
            </div>

            {/* Emergency Callouts */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-neutral-300">Emergency Calls</span>
                <div className={'flex items-center gap-1 text-xs ${
                  hvacKPIs.emergencyChange >= 0 ? 'text-red-400' : 'text-emerald-400'
                }'}>
                  {hvacKPIs.emergencyChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(hvacKPIs.emergencyChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{hvacKPIs.emergencyCallouts}</div>
              <div className="text-xs text-neutral-500 mb-2">This month</div>
              <SparkLine 
                data={abstractData.sparklines[2]} 
                width={120} 
                height={20} 
                color="#f59e0b"
              />
            </div>

            {/* System Efficiency */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-300">Avg System Efficiency</span>
                <div className={'flex items-center gap-1 text-xs ${
                  hvacKPIs.efficiencyChange >= 0 ? 'text-emerald-400' : 'text-red-400`
                }`}>
                  {hvacKPIs.efficiencyChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(hvacKPIs.efficiencyChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{hvacKPIs.efficiency}%</div>
              <div className="text-xs text-neutral-500 mb-2">Energy efficiency</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: '${hvacKPIs.efficiency}%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HVAC Revenue Performance Chart */}
      <div className="w-full bg-neutral-950 border-b border-neutral-800">
        <div className="px-6 py-3 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-neutral-100">HVAC Revenue & Service Volume Analysis</h3>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                Seasonal Performance Tracking
              </Badge>
            </div>
          </div>
        </div>
        <div className="h-96 w-full">
          {dashboardData.hvacRevenue && (
            <TradingViewWrapper
              data={dashboardData.hvacRevenue as TradingViewChartData[]}
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
          
          {/* HVAC Service Breakdown & Equipment Status */}
          <div className="grid grid-cols-2 gap-6">
            {/* Service Type Analysis */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-medium text-neutral-100">HVAC Service Breakdown</h3>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs ml-auto">
                    {hvacServices.reduce((sum, service) => sum + service.jobs, 0)} Total Jobs
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {hvacServices.map((service, index) => (
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
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <div className="text-blue-400 font-semibold">{service.jobs}</div>
                          <div className="text-neutral-400">Jobs</div>
                        </div>
                        <div>
                          <div className="text-emerald-400 font-semibold">${service.avgRevenue}</div>
                          <div className="text-neutral-400">Avg Revenue</div>
                        </div>
                        <div>
                          <div className="text-purple-400 font-semibold">{service.avgDuration}</div>
                          <div className="text-neutral-400">Duration</div>
                        </div>
                        <div>
                          <div className="text-green-400 font-semibold">{service.completionRate}%</div>
                          <div className="text-neutral-400">Success Rate</div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-neutral-700/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-400">Seasonality:</span>
                          <span className={'${
                            service.seasonality === 'Peak Season' ? 'text-orange-400' :
                            service.seasonality === 'Off Season' ? 'text-blue-400' : 'text-neutral-300'
                          }'}>{service.seasonality}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Equipment Diagnostics */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-yellow-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Equipment Diagnostics</h3>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs ml-auto">
                    System Health Monitor
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {equipmentDiagnostics.map((equipment, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-neutral-100">{equipment.equipment}</div>
                        <div className="flex items-center gap-1">
                          <div className="text-xs text-neutral-400">Efficiency:</div>
                          <div className={'text-xs font-semibold ${
                            equipment.efficiency >= 90 ? 'text-emerald-400' :
                            equipment.efficiency >= 80 ? 'text-yellow-400' : 'text-red-400'
                          }'}>
                            {equipment.efficiency}%
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                        <div>
                          <div className="text-blue-400 font-semibold">{equipment.totalUnits}</div>
                          <div className="text-neutral-400">Total Units</div>
                        </div>
                        <div>
                          <div className="text-emerald-400 font-semibold">{equipment.operational}</div>
                          <div className="text-neutral-400">Operational</div>
                        </div>
                        <div>
                          <div className="text-yellow-400 font-semibold">{equipment.needsMaintenance}</div>
                          <div className="text-neutral-400">Maintenance</div>
                        </div>
                        <div>
                          <div className="text-red-400 font-semibold">{equipment.criticalIssues}</div>
                          <div className="text-neutral-400">Critical</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-700/50">
                        <span className="text-neutral-400">Avg Age: {equipment.avgAge} years</span>
                        <div className="w-20 bg-neutral-800 rounded-full h-1">
                          <div 
                            className={'h-1 rounded-full ${
                              equipment.efficiency >= 90 ? 'bg-emerald-400' :
                              equipment.efficiency >= 80 ? 'bg-yellow-400' : 'bg-red-400`
                            }'} 
                            style={{ width: '${equipment.efficiency}%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top HVAC Technicians Performance */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-neutral-100">Top HVAC Technicians</h3>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs ml-auto">
                  Performance Leaders
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {topHVACTechnicians.map((tech, index) => (
                  <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-medium text-sm">
                          {tech.name.split(' ').map(n => n[0]).join(')}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-100">{tech.name}</div>
                          <div className="text-sm text-neutral-400">{tech.specialty}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-emerald-400">{tech.efficiency}%</div>
                        <div className="text-sm text-neutral-400">Efficiency</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-400">{tech.jobsCompleted}</div>
                        <div className="text-xs text-neutral-400">Jobs Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <div className="text-lg font-semibold text-yellow-400">{tech.avgRating}</div>
                        </div>
                        <div className="text-xs text-neutral-400">Avg Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-emerald-400">${tech.avgJobValue}</div>
                        <div className="text-xs text-neutral-400">Avg Job Value</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-400">{tech.certifications.length}</div>
                        <div className="text-xs text-neutral-400">Certifications</div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-neutral-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-400">Certifications:</span>
                          {tech.certifications.slice(0, 2).map((cert, i) => (
                            <span key={i} className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
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

          {/* Seasonal Trends Analysis */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-medium text-neutral-100">HVAC Seasonal Trends</h3>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-xs ml-auto">
                  Year-to-Date Analysis
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-3 px-4 font-medium text-neutral-300">Month</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Heating Calls</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Cooling Calls</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Maintenance</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonalTrends.map((month, index) => {
                      const totalCalls = month.heating + month.cooling + month.maintenance;
                      const estimatedRevenue = (month.heating * 425) + (month.cooling * 485) + (month.maintenance * 185);
                      
                      return (
                        <tr key={index} className="border-b border-neutral-800/50">
                          <td className="py-4 px-4 text-white font-medium">{month.month}</td>
                          <td className="py-4 px-4 text-right text-orange-400">{month.heating}</td>
                          <td className="py-4 px-4 text-right text-cyan-400">{month.cooling}</td>
                          <td className="py-4 px-4 text-right text-purple-400">{month.maintenance}</td>
                          <td className="py-4 px-4 text-right text-emerald-400">${estimatedRevenue.toLocaleString()}</td>
                        </tr>
                      );
                    })}
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
              <span className="text-neutral-400">HVAC System:</span>
              <span className="text-emerald-400">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">System Efficiency:</span>
              <span className="text-purple-400">{hvacKPIs.efficiency}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Emergency Calls:</span>
              <span className="text-orange-400">{hvacKPIs.emergencyCallouts}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Completion Rate:</span>
              <span className="text-emerald-400">{hvacKPIs.completionRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Avg Revenue:</span>
              <span className="text-emerald-400">${hvacKPIs.avgRevenue}</span>
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