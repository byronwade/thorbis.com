"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  Zap,
  Activity,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Filter,
  Settings,
  Download,
  RefreshCw,
  Target,
  Calendar,
  MapPin,
  Gauge,
  Battery,
  Lightbulb,
  Home,
  Building,
  Wrench
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

export default function ElectricalAnalytics() {
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
        electricalRevenue: rawData.revenue || [],
        safetyMetrics: rawData.jobsCompleted || [],
        powerConsumption: rawData.customerSatisfaction || [],
      });
      
      setIsLoading(false);
    };
    
    loadDashboardData();
  }, [selectedTimeframe]);

  // Electrical-specific KPIs
  const electricalKPIs = {
    totalJobs: 287,
    jobsChange: 22.1,
    avgRevenue: 685.25,
    revenueChange: 16.8,
    safetyIncidents: 2,
    safetyChange: -66.7,
    completionRate: 96.5,
    completionChange: 4.2,
    codeViolations: 8,
    violationsChange: -37.5
  };

  // Electrical service breakdown
  const electricalServices = [
    {
      service: 'Panel Upgrades',
      jobs: 78,
      avgRevenue: 1485.00,
      avgDuration: '6.5 hrs',
      completionRate: 94.9,
      codeCompliance: 98.7,
      riskLevel: 'High',
      trend: 'up',
      permits: 'Required'
    },
    {
      service: 'Outlet & Switch Repair',
      jobs: 92,
      avgRevenue: 185.00,
      avgDuration: '1.2 hrs',
      completionRate: 98.9,
      codeCompliance: 99.1,
      riskLevel: 'Low',
      trend: 'up',
      permits: 'Not Required'
    },
    {
      service: 'Lighting Installation',
      jobs: 64,
      avgRevenue: 485.00,
      avgDuration: '2.8 hrs',
      completionRate: 97.2,
      codeCompliance: 97.6,
      riskLevel: 'Medium',
      trend: 'stable',
      permits: 'Sometimes'
    },
    {
      service: 'Emergency Repairs',
      jobs: 39,
      avgRevenue: 385.00,
      avgDuration: '1.8 hrs',
      completionRate: 92.3,
      codeCompliance: 94.9,
      riskLevel: 'High',
      trend: 'up',
      permits: 'Not Required'
    },
    {
      service: 'New Installation',
      jobs: 14,
      avgRevenue: 2485.00,
      avgDuration: '12.5 hrs',
      completionRate: 100.0,
      codeCompliance: 100.0,
      riskLevel: 'High',
      trend: 'up',
      permits: 'Required'
    }
  ];

  // Safety compliance tracking
  const safetyMetrics = [
    {
      category: 'Code Violations',
      current: 8,
      target: 5,
      lastMonth: 13,
      trend: 'improving',
      severity: 'Medium',
      description: 'National Electrical Code compliance'
    },
    {
      category: 'Safety Incidents',
      current: 2,
      target: 0,
      lastMonth: 6,
      trend: 'improving',
      severity: 'High',
      description: 'Workplace safety incidents'
    },
    {
      category: 'Permit Violations',
      current: 1,
      target: 0,
      lastMonth: 3,
      trend: 'improving',
      severity: 'High',
      description: 'Work performed without permits'
    },
    {
      category: 'Inspection Failures',
      current: 4,
      target: 2,
      lastMonth: 7,
      trend: 'improving',
      severity: 'Medium',
      description: 'Failed electrical inspections'
    }
  ];

  // Power consumption analysis
  const powerAnalysis = [
    {
      system: 'Residential Panels',
      avgLoad: '75%',
      efficiency: 92.4,
      upgrades: 23,
      energySaved: '2,340 kWh',
      costSavings: 285.00
    },
    {
      system: 'Commercial Systems',
      avgLoad: '68%',
      efficiency: 89.7,
      upgrades: 8,
      energySaved: '5,680 kWh',
      costSavings: 742.00
    },
    {
      system: 'Smart Home Systems',
      avgLoad: '45%',
      efficiency: 96.2,
      upgrades: 15,
      energySaved: '1,890 kWh',
      costSavings: 234.00
    },
    {
      system: 'LED Conversions',
      avgLoad: '35%',
      efficiency: 94.8,
      upgrades: 42,
      energySaved: '3,240 kWh',
      costSavings: 398.00
    }
  ];

  // Top electrical technicians
  const topElectricians = [
    {
      name: 'Thomas Anderson',
      specialty: 'Commercial Electrical',
      jobsCompleted: 67,
      avgRating: 4.9,
      safetyRecord: '0 incidents',
      avgJobValue: 1285.00,
      certifications: ['Master Electrician', 'Industrial Certified'],
      codeCompliance: 99.2
    },
    {
      name: 'Maria Rodriguez',
      specialty: 'Residential Wiring',
      jobsCompleted: 89,
      avgRating: 4.8,
      safetyRecord: '0 incidents',
      avgJobValue: 485.00,
      certifications: ['Licensed Electrician', 'Solar Certified'],
      codeCompliance: 98.7
    },
    {
      name: 'David Kim',
      specialty: 'Smart Home Systems',
      jobsCompleted: 54,
      avgRating: 4.9,
      safetyRecord: '0 incidents',
      avgJobValue: 785.00,
      certifications: ['Automation Specialist', 'Low Voltage'],
      codeCompliance: 99.8
    },
    {
      name: 'Jennifer Wilson',
      specialty: 'Emergency Services',
      jobsCompleted: 77,
      avgRating: 4.7,
      safetyRecord: '1 minor incident',
      avgJobValue: 385.00,
      certifications: ['Emergency Response', 'Safety Certified'],
      codeCompliance: 97.1
    }
  ];

  // Electrical code compliance breakdown
  const codeCompliance = [
    {
      code: 'NEC Article 110',
      description: 'General Requirements',
      violations: 3,
      compliance: 96.8,
      severity: 'Medium',
      trend: 'improving'
    },
    {
      code: 'NEC Article 210',
      description: 'Branch Circuits',
      violations: 2,
      compliance: 98.2,
      severity: 'Low',
      trend: 'stable'
    },
    {
      code: 'NEC Article 250',
      description: 'Grounding',
      violations: 2,
      compliance: 97.9,
      severity: 'High',
      trend: 'improving'
    },
    {
      code: 'NEC Article 300',
      description: 'Wiring Methods',
      violations: 1,
      compliance: 99.1,
      severity: 'Low',
      trend: 'stable'
    }
  ];

  // Generate sample data
  const generateSparkData = (count: number, trend: 'up' | 'down' | 'stable' = 'up') => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: trend === 'up' ? 500 + i * 20 + Math.random() * 150 :
             trend === 'down' ? 1000 - i * 15 + Math.random() * 100 :
             650 + Math.random() * 200
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(30, 'up'),
      generateSparkData(30, 'up'),
      generateSparkData(30, 'down'),
      generateSparkData(30, 'up'),
      generateSparkData(30, 'down')
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading electrical analytics...</span>
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
                <Zap className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-100">Electrical Analytics</h1>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>Electrical systems, safety compliance & code adherence</span>
                  <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                  <span>Power efficiency & emergency response</span>
                  {isRealTimeActive && (
                    <>
                      <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-emerald-400">Live Safety Monitoring</span>
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

      {/* Electrical Performance KPIs */}
      <div className="border-b border-neutral-800">
        <div className="px-6 py-4">
          <div className="grid grid-cols-5 gap-6 mb-6">
            {/* Total Electrical Jobs */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Total Electrical Jobs</span>
                <div className={'flex items-center gap-1 text-xs ${
                  electricalKPIs.jobsChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {electricalKPIs.jobsChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(electricalKPIs.jobsChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{electricalKPIs.totalJobs}</div>
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
                  electricalKPIs.revenueChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {electricalKPIs.revenueChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(electricalKPIs.revenueChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">${electricalKPIs.avgRevenue}</div>
              <div className="text-xs text-neutral-500 mb-2">Per service call</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={120} 
                height={20} 
                color="#10b981"
              />
            </div>

            {/* Safety Incidents */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-neutral-300">Safety Incidents</span>
                <div className={'flex items-center gap-1 text-xs ${
                  electricalKPIs.safetyChange >= 0 ? 'text-red-400' : 'text-emerald-400'
                }'}>
                  {electricalKPIs.safetyChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(electricalKPIs.safetyChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{electricalKPIs.safetyIncidents}</div>
              <div className="text-xs text-neutral-500 mb-2">This month</div>
              <SparkLine 
                data={abstractData.sparklines[2]} 
                width={120} 
                height={20} 
                color="#ef4444"
              />
            </div>

            {/* Completion Rate */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-neutral-300">Completion Rate</span>
                <div className={'flex items-center gap-1 text-xs ${
                  electricalKPIs.completionChange >= 0 ? 'text-emerald-400' : 'text-red-400`
                }`}>
                  {electricalKPIs.completionChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(electricalKPIs.completionChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{electricalKPIs.completionRate}%</div>
              <div className="text-xs text-neutral-500 mb-2">First visit success</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '${electricalKPIs.completionRate}%' }}></div>
              </div>
            </div>

            {/* Code Violations */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-neutral-300">Code Violations</span>
                <div className={'flex items-center gap-1 text-xs ${
                  electricalKPIs.violationsChange >= 0 ? 'text-red-400' : 'text-emerald-400'
                }'}>
                  {electricalKPIs.violationsChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(electricalKPIs.violationsChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{electricalKPIs.codeViolations}</div>
              <div className="text-xs text-neutral-500 mb-2">This month</div>
              <SparkLine 
                data={abstractData.sparklines[4]} 
                width={120} 
                height={20} 
                color="#f59e0b"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Electrical Revenue & Safety Performance Chart */}
      <div className="w-full bg-neutral-950 border-b border-neutral-800">
        <div className="px-6 py-3 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-neutral-100">Electrical Performance & Safety Compliance</h3>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                Code Compliance Tracking
              </Badge>
            </div>
          </div>
        </div>
        <div className="h-96 w-full">
          {dashboardData.electricalRevenue && (
            <TradingViewWrapper
              data={dashboardData.electricalRevenue as TradingViewChartData[]}
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
          
          {/* Electrical Services & Safety Metrics */}
          <div className="grid grid-cols-2 gap-6">
            {/* Service Type Breakdown */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Electrical Service Breakdown</h3>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs ml-auto">
                    {electricalServices.reduce((sum, service) => sum + service.jobs, 0)} Total Jobs
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {electricalServices.map((service, index) => (
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
                          service.riskLevel === 'High' ? 'bg-red-500/20 text-red-400' :
                          service.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                        }'}>
                          {service.riskLevel} Risk
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
                      <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-neutral-700/50">
                        <div>
                          <span className="text-neutral-400">Code Compliance:</span>
                          <span className="text-emerald-400 ml-1 font-semibold">{service.codeCompliance}%</span>
                        </div>
                        <div>
                          <span className="text-neutral-400">Permits:</span>
                          <span className={'ml-1 font-semibold ${
                            service.permits === 'Required' ? 'text-red-400' :
                            service.permits === 'Sometimes' ? 'text-yellow-400' : 'text-neutral-300'
                          }'}>
                            {service.permits}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Safety Compliance Metrics */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Safety Compliance Metrics</h3>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs ml-auto">
                    OSHA Standards
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {safetyMetrics.map((metric, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-neutral-100">{metric.category}</div>
                          <div className={'text-xs px-2 py-1 rounded ${
                            metric.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                            metric.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                          }'}>
                            {metric.severity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={'text-sm font-semibold ${
                            metric.current <= metric.target ? 'text-emerald-400' : 'text-red-400'
                          }'}>
                            {metric.current}
                          </div>
                          <div className="text-xs text-neutral-400">current</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-blue-400 font-semibold">{metric.target}</div>
                          <div className="text-neutral-400">Target</div>
                        </div>
                        <div>
                          <div className="text-neutral-400 font-semibold">{metric.lastMonth}</div>
                          <div className="text-neutral-400">Last Month</div>
                        </div>
                        <div>
                          <div className={'font-semibold ${
                            metric.trend === 'improving' ? 'text-emerald-400' : 
                            metric.trend === 'worsening' ? 'text-red-400' : 'text-neutral-400'
                          }'}>
                            {metric.trend === 'improving' ? '↓' : metric.trend === 'worsening' ? '↑' : '→'}
                          </div>
                          <div className="text-neutral-400">Trend</div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-neutral-700/50">
                        <div className="text-xs text-neutral-400">{metric.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Power Analysis & Code Compliance */}
          <div className="grid grid-cols-2 gap-6">
            {/* Power Efficiency Analysis */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-green-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Power Efficiency Analysis</h3>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs ml-auto">
                    Energy Savings
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {powerAnalysis.map((system, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-neutral-100">{system.system}</div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-emerald-400">{system.efficiency}%</div>
                          <div className="text-xs text-neutral-400">Efficiency</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                        <div>
                          <div className="text-blue-400 font-semibold">{system.avgLoad}</div>
                          <div className="text-neutral-400">Avg Load</div>
                        </div>
                        <div>
                          <div className="text-purple-400 font-semibold">{system.upgrades}</div>
                          <div className="text-neutral-400">Upgrades</div>
                        </div>
                        <div>
                          <div className="text-cyan-400 font-semibold">{system.energySaved}</div>
                          <div className="text-neutral-400">Energy Saved</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-700/50">
                        <span className="text-neutral-400">Cost Savings:</span>
                        <span className="text-emerald-400 font-semibold">${system.costSavings}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Code Compliance Breakdown */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <h3 className="text-sm font-medium text-neutral-100">NEC Code Compliance</h3>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs ml-auto">
                    National Electrical Code
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {codeCompliance.map((code, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-neutral-100">{code.code}</div>
                          <div className="text-xs text-neutral-400">{code.description}</div>
                        </div>
                        <div className="text-right">
                          <div className={'text-sm font-semibold ${
                            code.compliance >= 98 ? 'text-emerald-400' :
                            code.compliance >= 95 ? 'text-yellow-400' : 'text-red-400'
                          }'}>
                            {code.compliance}%
                          </div>
                          <div className="text-xs text-neutral-400">Compliance</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className={'font-semibold ${
                            code.violations === 0 ? 'text-emerald-400' :
                            code.violations <= 2 ? 'text-yellow-400' : 'text-red-400'
                          }'}>
                            {code.violations}
                          </div>
                          <div className="text-neutral-400">Violations</div>
                        </div>
                        <div>
                          <div className={'text-xs px-2 py-1 rounded ${
                            code.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                            code.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                          }'}>
                            {code.severity}
                          </div>
                        </div>
                        <div>
                          <div className={'font-semibold ${
                            code.trend === 'improving' ? 'text-emerald-400' : 
                            code.trend === 'worsening' ? 'text-red-400' : 'text-neutral-400'
                          }'}>
                            {code.trend === 'improving' ? '↑' : code.trend === 'worsening' ? '↓' : '→'}
                          </div>
                          <div className="text-neutral-400">Trend</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Electrical Technicians */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-neutral-100">Top Electrical Technicians</h3>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs ml-auto">
                  Performance Leaders
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {topElectricians.map((electrician, index) => (
                  <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white font-medium text-sm">
                          {electrician.name.split(' ').map(n => n[0]).join(')}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-100">{electrician.name}</div>
                          <div className="text-sm text-neutral-400">{electrician.specialty}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-emerald-400">{electrician.codeCompliance}%</div>
                        <div className="text-sm text-neutral-400">Code Compliance</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-400">{electrician.jobsCompleted}</div>
                        <div className="text-xs text-neutral-400">Jobs Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-yellow-400">{electrician.avgRating}</div>
                        <div className="text-xs text-neutral-400">Avg Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-emerald-400">${electrician.avgJobValue}</div>
                        <div className="text-xs text-neutral-400">Avg Job Value</div>
                      </div>
                      <div className="text-center">
                        <div className={'text-lg font-semibold ${
                          electrician.safetyRecord === '0 incidents' ? 'text-emerald-400' : 'text-yellow-400'
                        }'}>
                          {electrician.safetyRecord === '0 incidents' ? '✓' : '!'}
                        </div>
                        <div className="text-xs text-neutral-400">Safety Record</div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-neutral-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-400">Certifications:</span>
                          {electrician.certifications.slice(0, 2).map((cert, i) => (
                            <span key={i} className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                              {cert}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-neutral-400">{electrician.safetyRecord}</div>
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
              <span className="text-neutral-400">Electrical System:</span>
              <span className="text-emerald-400">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Safety Incidents:</span>
              <span className="text-red-400">{electricalKPIs.safetyIncidents}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Code Violations:</span>
              <span className="text-orange-400">{electricalKPIs.codeViolations}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Completion Rate:</span>
              <span className="text-emerald-400">{electricalKPIs.completionRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Avg Revenue:</span>
              <span className="text-emerald-400">${electricalKPIs.avgRevenue}</span>
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