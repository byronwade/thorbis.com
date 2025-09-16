"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  Users,
  Star,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  Filter,
  Settings,
  Download,
  RefreshCw,
  Timer,
  Wrench,
  Award,
  AlertTriangle,
  MapPin,
  Phone
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

export default function TechnicianPerformanceAnalytics() {
  const searchParams = useSearchParams();
  const timeframe = searchParams.get('timeframe') || '30d';

  // State management
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
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
        technicianPerformance: rawData.jobsCompleted || [],
        customerSatisfaction: rawData.customerSatisfaction || [],
        efficiency: rawData.revenue || [],
      });
      
      setIsLoading(false);
    };
    
    loadDashboardData();
  }, [selectedTimeframe]);

  // Technician performance data
  const overallKPIs = {
    totalTechnicians: 23,
    activeToday: 19,
    avgRating: 4.7,
    ratingChange: 2.1,
    avgJobsPerTech: 8.4,
    jobsChange: 12.3,
    avgResponseTime: '18 min',
    responseChange: -5.8,
    utilizationRate: 87.3,
    utilizationChange: 4.2
  };

  const topPerformers = [
    {
      rank: 1,
      name: 'Mike Rodriguez',
      department: 'HVAC',
      rating: 4.9,
      jobsCompleted: 87,
      revenue: '$42,580',
      efficiency: 97.2,
      responseTime: '12 min',
      certifications: ['EPA', 'NATE', 'R-410A'],
      yearExperience: 8,
      customerComments: 'Professional and knowledgeable'
    },
    {
      rank: 2,
      name: 'Sarah Johnson',
      department: 'Plumbing',
      rating: 4.8,
      jobsCompleted: 92,
      revenue: '$38,940',
      efficiency: 96.1,
      responseTime: '15 min',
      certifications: ['Master Plumber', 'Backflow'],
      yearExperience: 12,
      customerComments: 'Always on time and thorough'
    },
    {
      rank: 3,
      name: 'David Chen',
      department: 'Electrical',
      rating: 4.9,
      jobsCompleted: 78,
      revenue: '$41,230',
      efficiency: 94.7,
      responseTime: '18 min',
      certifications: ['Licensed Electrician', 'Solar'],
      yearExperience: 6,
      customerComments: 'Excellent problem-solving skills'
    },
    {
      rank: 4,
      name: 'Amy Williams',
      department: 'General Repair',
      rating: 4.7,
      jobsCompleted: 65,
      revenue: '$39,870',
      efficiency: 98.3,
      responseTime: '14 min',
      certifications: ['General Contractor', 'Safety'],
      yearExperience: 10,
      customerComments: 'Reliable and friendly service'
    }
  ];

  const performanceMetrics = [
    {
      metric: 'Job Completion Rate',
      teamAvg: 94.2,
      topPerformer: 98.3,
      needsImprovement: 87.1,
      target: 95.0
    },
    {
      metric: 'Customer Rating',
      teamAvg: 4.7,
      topPerformer: 4.9,
      needsImprovement: 4.1,
      target: 4.5
    },
    {
      metric: 'First-Fix Rate',
      teamAvg: 87.3,
      topPerformer: 94.2,
      needsImprovement: 72.8,
      target: 85.0
    },
    {
      metric: 'Revenue per Tech',
      teamAvg: 35420,
      topPerformer: 42580,
      needsImprovement: 24890,
      target: 32000
    }
  ];

  const skillDevelopmentData = [
    { skill: 'HVAC Systems', proficiency: 92, demand: 'High', trainingNeeded: 2 },
    { skill: 'Plumbing Repair', proficiency: 88, demand: 'High', trainingNeeded: 4 },
    { skill: 'Electrical Work', proficiency: 85, demand: 'Medium', trainingNeeded: 3 },
    { skill: 'Smart Home Tech', proficiency: 67, demand: 'High', trainingNeeded: 8 },
    { skill: 'Solar Systems', proficiency: 45, demand: 'Growing', trainingNeeded: 12 },
    { skill: 'Customer Service', proficiency: 91, demand: 'Critical', trainingNeeded: 1 }
  ];

  // Generate sample data
  const generateSparkData = (count: number, trend: 'up' | 'down' | 'stable' = 'up') => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: trend === 'up' ? 40 + i * 2 + Math.random() * 15 :
             trend === 'down' ? 70 - i * 1.5 + Math.random() * 10 :
             50 + Math.random() * 20
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(15, 'up'),
      generateSparkData(15, 'up'),
      generateSparkData(15, 'stable'),
      generateSparkData(15, 'up')
    ],
    performanceMetrics: [
      { label: 'Technical Skills', value: 89, maxValue: 100, color: '#10b981' },
      { label: 'Customer Service', value: 91, maxValue: 100, color: '#1C8BFF' },
      { label: 'Efficiency', value: 87, maxValue: 100, color: '#f59e0b' }
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading technician analytics...</span>
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
              <div className="w-8 h-8 bg-orange-500/10 rounded border border-orange-500/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-100">Technician Performance Analytics</h1>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>Individual & Team Performance Tracking</span>
                  <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                  <span>{overallKPIs.totalTechnicians} Technicians</span>
                  <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                  <span className="text-emerald-400">{overallKPIs.activeToday} Active Today</span>
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
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                7D
              </button>
              <button
                onClick={() => setSelectedTimeframe('30d')}
                className={'px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 ${
                  selectedTimeframe === '30d'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                30D
              </button>
              <button
                onClick={() => setSelectedTimeframe('90d')}
                className={'px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 ${
                  selectedTimeframe === '90d'
                    ? 'bg-orange-500/20 text-orange-400'
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

      {/* Team Performance KPIs */}
      <div className="border-b border-neutral-800">
        <div className="px-6 py-4">
          <div className="grid grid-cols-4 gap-8 mb-6">
            {/* Team Rating */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-neutral-300">Team Avg Rating</span>
                <div className={'flex items-center gap-1 text-xs ${
                  overallKPIs.ratingChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {overallKPIs.ratingChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(overallKPIs.ratingChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{overallKPIs.avgRating}/5</div>
              <div className="text-xs text-neutral-500 mb-2">Customer satisfaction</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={140} 
                height={20} 
                color="#f59e0b"
              />
            </div>

            {/* Jobs per Technician */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Jobs per Tech</span>
                <div className={'flex items-center gap-1 text-xs ${
                  overallKPIs.jobsChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {overallKPIs.jobsChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(overallKPIs.jobsChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{overallKPIs.avgJobsPerTech}</div>
              <div className="text-xs text-neutral-500 mb-2">Per day</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={140} 
                height={20} 
                color="#1C8BFF"
              />
            </div>

            {/* Response Time */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Timer className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Response Time</span>
                <div className={'flex items-center gap-1 text-xs ${
                  overallKPIs.responseChange >= 0 ? 'text-red-400' : 'text-emerald-400'
                }'}>
                  {overallKPIs.responseChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(overallKPIs.responseChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{overallKPIs.avgResponseTime}</div>
              <div className="text-xs text-neutral-500 mb-2">To arrival</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            {/* Utilization Rate */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-300">Utilization Rate</span>
                <div className={'flex items-center gap-1 text-xs ${
                  overallKPIs.utilizationChange >= 0 ? 'text-emerald-400' : 'text-red-400`
                }`}>
                  {overallKPIs.utilizationChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(overallKPIs.utilizationChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{overallKPIs.utilizationRate}%</div>
              <div className="text-xs text-neutral-500 mb-2">Team efficiency</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: '${overallKPIs.utilizationRate}%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="w-full bg-neutral-950 border-b border-neutral-800">
        <div className="px-6 py-3 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-orange-400" />
              <h3 className="text-lg font-medium text-neutral-100">Team Performance Trends</h3>
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-xs">
                30-Day Analysis
              </Badge>
            </div>
          </div>
        </div>
        <div className="h-96 w-full">
          {dashboardData.technicianPerformance && (
            <TradingViewWrapper
              data={dashboardData.technicianPerformance as TradingViewChartData[]}
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
          
          {/* Top Performers Leaderboard */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-400" />
                <h3 className="text-sm font-medium text-neutral-100">Top Performing Technicians</h3>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs ml-auto">
                  Monthly Leaders
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {topPerformers.map((tech, index) => (
                  <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          tech.rank === 1 ? 'bg-yellow-500' :
                          tech.rank === 2 ? 'bg-gray-400' :
                          tech.rank === 3 ? 'bg-amber-600' : 'bg-blue-500'
                        }'}>
                          {tech.rank}
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-medium text-sm">
                          {tech.name.split(' ').map(n => n[0]).join(')}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-100">{tech.name}</div>
                          <div className="text-sm text-neutral-400">{tech.department} • {tech.yearExperience} years experience</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="font-semibold text-neutral-100">{tech.rating}</span>
                        </div>
                        <div className="text-sm text-neutral-400">Customer rating</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-emerald-400">{tech.jobsCompleted}</div>
                        <div className="text-xs text-neutral-400">Jobs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-400">{tech.revenue}</div>
                        <div className="text-xs text-neutral-400">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-400">{tech.efficiency}%</div>
                        <div className="text-xs text-neutral-400">Efficiency</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-cyan-400">{tech.responseTime}</div>
                        <div className="text-xs text-neutral-400">Response</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-700/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">Certifications:</span>
                        {tech.certifications.slice(0, 2).map((cert, i) => (
                          <span key={i} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            {cert}
                          </span>
                        ))}
                        {tech.certifications.length > 2 && (
                          <span className="text-xs text-neutral-400">+{tech.certifications.length - 2} more</span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 italic">
                        "{tech.customerComments}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics Comparison */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-neutral-100">Performance Metrics Analysis</h3>
                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs ml-auto">
                  Team Benchmarks
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-3 px-4 font-medium text-neutral-300">Metric</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral-300">Team Average</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral-300">Top Performer</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral-300">Needs Improvement</th>
                      <th className="text-center py-3 px-4 font-medium text-neutral-300">Target</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceMetrics.map((metric, index) => (
                      <tr key={index} className="border-b border-neutral-800/50">
                        <td className="py-4 px-4 font-medium text-neutral-100">{metric.metric}</td>
                        <td className="py-4 px-4 text-center text-neutral-300">
                          {metric.metric.includes('Revenue') ? '$${metric.teamAvg.toLocaleString()}' : 
                           metric.metric.includes('Rating') ? metric.teamAvg.toFixed(1) :
                           '${metric.teamAvg}%'}
                        </td>
                        <td className="py-4 px-4 text-center text-emerald-400">
                          {metric.metric.includes('Revenue') ? '$${metric.topPerformer.toLocaleString()}' : 
                           metric.metric.includes('Rating') ? metric.topPerformer.toFixed(1) :
                           '${metric.topPerformer}%'}
                        </td>
                        <td className="py-4 px-4 text-center text-red-400">
                          {metric.metric.includes('Revenue') ? '$${metric.needsImprovement.toLocaleString()}' : 
                           metric.metric.includes('Rating') ? metric.needsImprovement.toFixed(1) :
                           '${metric.needsImprovement}%'}
                        </td>
                        <td className="py-4 px-4 text-center text-neutral-300">
                          {metric.metric.includes('Revenue') ? '$${metric.target.toLocaleString()}' : 
                           metric.metric.includes('Rating`) ? metric.target.toFixed(1) :
                           '${metric.target}%'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={'inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                            (metric.metric.includes('Revenue') ? metric.teamAvg >= metric.target :
                             metric.metric.includes('Rating') ? metric.teamAvg >= metric.target :
                             metric.teamAvg >= metric.target) 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-orange-500/20 text-orange-400'
                          }'}>
                            {(metric.metric.includes('Revenue') ? metric.teamAvg >= metric.target :
                              metric.metric.includes('Rating') ? metric.teamAvg >= metric.target :
                              metric.teamAvg >= metric.target) ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                On Target
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3 w-3" />
                                Below Target
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Skills Development Matrix */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <h3 className="text-sm font-medium text-neutral-100">Skills Development Matrix</h3>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs ml-auto">
                  Training Roadmap
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {skillDevelopmentData.map((skill, index) => (
                  <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-neutral-100">{skill.skill}</div>
                        <span className={'text-xs px-2 py-1 rounded ${
                          skill.demand === 'High' ? 'bg-red-500/20 text-red-400' :
                          skill.demand === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          skill.demand === 'Growing' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }'}>
                          {skill.demand} Demand
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-neutral-100">{skill.proficiency}% Proficiency</div>
                        <div className="text-xs text-neutral-400">{skill.trainingNeeded} need training</div>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <div 
                        className={'h-2 rounded-full ${
                          skill.proficiency >= 90 ? 'bg-emerald-400' :
                          skill.proficiency >= 75 ? 'bg-blue-400' :
                          skill.proficiency >= 60 ? 'bg-yellow-400' : 'bg-red-400`
                        }'} 
                        style={{ width: '${skill.proficiency}%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 gap-6">
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Overall Team Performance Metrics</h3>
                </div>
              </div>
              <div className="p-4 flex items-center justify-center">
                <PerformanceRing 
                  metrics={abstractData.performanceMetrics}
                  size={180}
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
              <span className="text-neutral-400">Performance System:</span>
              <span className="text-emerald-400">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Active Technicians:</span>
              <span className="text-neutral-300">{overallKPIs.activeToday}/{overallKPIs.totalTechnicians}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Team Rating:</span>
              <span className="text-yellow-400">{overallKPIs.avgRating}/5</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Avg Jobs/Tech:</span>
              <span className="text-blue-400">{overallKPIs.avgJobsPerTech}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Utilization:</span>
              <span className="text-emerald-400">{overallKPIs.utilizationRate}%</span>
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