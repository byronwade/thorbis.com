"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  Phone,
  Star,
  Clock,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  Filter,
  Settings,
  Download,
  RefreshCw,
  Calendar,
  Smile,
  Frown,
  Meh,
  Award,
  Zap
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

export default function CustomerServiceAnalytics() {
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
        customerSatisfaction: rawData.customerSatisfaction || [],
        callVolume: rawData.jobsCompleted || [],
        responseTime: rawData.revenue || [],
      });
      
      setIsLoading(false);
    };
    
    loadDashboardData();
  }, [selectedTimeframe]);

  // Customer Service KPIs
  const serviceKPIs = {
    avgRating: 4.7,
    ratingChange: 3.2,
    totalCalls: 1247,
    callsChange: 8.9,
    avgResponseTime: '2m 45s',
    responseChange: -12.4,
    resolutionRate: 94.2,
    resolutionChange: 5.8,
    firstCallResolution: 87.3,
    fcrChange: 4.1
  };

  // Customer feedback breakdown
  const feedbackBreakdown = [
    {
      rating: 5,
      count: 847,
      percentage: 68.0,
      trend: '+8.2%',
      color: 'bg-emerald-500'
    },
    {
      rating: 4,
      count: 236,
      percentage: 19.0,
      trend: '+2.1%',
      color: 'bg-blue-500'
    },
    {
      rating: 3,
      count: 94,
      percentage: 7.5,
      trend: '-1.8%',
      color: 'bg-yellow-500'
    },
    {
      rating: 2,
      count: 47,
      percentage: 3.8,
      trend: '-2.3%',
      color: 'bg-orange-500'
    },
    {
      rating: 1,
      count: 23,
      percentage: 1.8,
      trend: '-1.1%',
      color: 'bg-red-500'
    }
  ];

  // Service channels performance
  const serviceChannels = [
    {
      channel: 'Phone Support',
      totalInteractions: 892,
      avgResponseTime: '1m 32s',
      satisfactionScore: 4.8,
      resolutionRate: 96.2,
      trend: 'up'
    },
    {
      channel: 'Live Chat',
      totalInteractions: 245,
      avgResponseTime: '45s',
      satisfactionScore: 4.6,
      resolutionRate: 89.7,
      trend: 'up'
    },
    {
      channel: 'Email Support',
      totalInteractions: 78,
      avgResponseTime: '2h 15m',
      satisfactionScore: 4.3,
      resolutionRate: 91.8,
      trend: 'stable'
    },
    {
      channel: 'Mobile App',
      totalInteractions: 32,
      avgResponseTime: '15m',
      satisfactionScore: 4.9,
      resolutionRate: 93.8,
      trend: 'up'
    }
  ];

  // Common service issues
  const commonIssues = [
    {
      issue: 'Appointment Scheduling',
      frequency: 342,
      percentage: 27.4,
      avgResolutionTime: '3m 45s',
      satisfactionScore: 4.9,
      trend: 'up'
    },
    {
      issue: 'Service Status Updates',
      frequency: 287,
      percentage: 23.0,
      avgResolutionTime: '2m 15s',
      satisfactionScore: 4.7,
      trend: 'stable'
    },
    {
      issue: 'Billing Questions',
      frequency: 198,
      percentage: 15.9,
      avgResolutionTime: '5m 30s',
      satisfactionScore: 4.4,
      trend: 'down'
    },
    {
      issue: 'Technical Support',
      frequency: 156,
      percentage: 12.5,
      avgResolutionTime: '8m 15s',
      satisfactionScore: 4.6,
      trend: 'up'
    },
    {
      issue: 'Emergency Services',
      frequency: 134,
      percentage: 10.7,
      avgResolutionTime: '1m 20s',
      satisfactionScore: 4.8,
      trend: 'up'
    },
    {
      issue: 'Service Quality',
      frequency: 89,
      percentage: 7.1,
      avgResolutionTime: '12m 45s',
      satisfactionScore: 4.2,
      trend: 'stable'
    },
    {
      issue: 'Other',
      frequency: 41,
      percentage: 3.3,
      avgResolutionTime: '6m 20s',
      satisfactionScore: 4.5,
      trend: 'stable'
    }
  ];

  // Representative performance
  const topRepresentatives = [
    {
      name: 'Sarah Mitchell',
      callsHandled: 156,
      avgRating: 4.9,
      avgCallTime: '4m 15s',
      resolutionRate: 97.4,
      specialties: ['Scheduling', 'HVAC'],
      customerComments: 'Always professional and helpful'
    },
    {
      name: 'Mike Johnson',
      callsHandled: 142,
      avgRating: 4.8,
      avgCallTime: '3m 45s',
      resolutionRate: 95.8,
      specialties: ['Technical', 'Emergency'],
      customerComments: 'Quick problem solver'
    },
    {
      name: 'Amy Rodriguez',
      callsHandled: 138,
      avgRating: 4.9,
      avgCallTime: '5m 20s',
      resolutionRate: 98.6,
      specialties: ['Billing', 'Complaints'],
      customerComments: 'Patient and thorough'
    },
    {
      name: 'David Chen',
      callsHandled: 124,
      avgRating: 4.7,
      avgCallTime: '4m 35s',
      resolutionRate: 94.4,
      specialties: ['Plumbing', 'General'],
      customerComments: 'Very knowledgeable'
    }
  ];

  // Generate sample data
  const generateSparkData = (count: number, trend: 'up' | 'down' | 'stable' = 'up') => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: trend === 'up' ? 4.0 + i * 0.05 + Math.random() * 0.3 :
             trend === 'down' ? 5.0 - i * 0.03 + Math.random() * 0.2 :
             4.5 + Math.random() * 0.5
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(30, 'up'),
      generateSparkData(30, 'up'),
      generateSparkData(30, 'stable'),
      generateSparkData(30, 'up')
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading customer service analytics...</span>
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
                <Phone className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-100">Customer Service Analytics</h1>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>Customer satisfaction & service quality analysis</span>
                  <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                  <span>Multi-channel support tracking</span>
                  {isRealTimeActive && (
                    <>
                      <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-emerald-400">Real-time Feedback</span>
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

      {/* Service Quality KPIs */}
      <div className="border-b border-neutral-800">
        <div className="px-6 py-4">
          <div className="grid grid-cols-5 gap-6 mb-6">
            {/* Average Rating */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Customer Rating</span>
                <div className={'flex items-center gap-1 text-xs ${
                  serviceKPIs.ratingChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {serviceKPIs.ratingChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(serviceKPIs.ratingChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{serviceKPIs.avgRating}/5</div>
              <div className="text-xs text-neutral-500 mb-2">Customer satisfaction</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={120} 
                height={20} 
                color="#f59e0b"
              />
            </div>

            {/* Total Calls */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Total Calls</span>
                <div className={'flex items-center gap-1 text-xs ${
                  serviceKPIs.callsChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {serviceKPIs.callsChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(serviceKPIs.callsChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{serviceKPIs.totalCalls.toLocaleString()}</div>
              <div className="text-xs text-neutral-500 mb-2">This period</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={120} 
                height={20} 
                color="#1C8BFF"
              />
            </div>

            {/* Response Time */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Response Time</span>
                <div className={'flex items-center gap-1 text-xs ${
                  serviceKPIs.responseChange >= 0 ? 'text-red-400' : 'text-emerald-400'
                }'}>
                  {serviceKPIs.responseChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(serviceKPIs.responseChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{serviceKPIs.avgResponseTime}</div>
              <div className="text-xs text-neutral-500 mb-2">Time to answer</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>

            {/* Resolution Rate */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-neutral-300">Resolution Rate</span>
                <div className={'flex items-center gap-1 text-xs ${
                  serviceKPIs.resolutionChange >= 0 ? 'text-emerald-400' : 'text-red-400`
                }`}>
                  {serviceKPIs.resolutionChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(serviceKPIs.resolutionChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{serviceKPIs.resolutionRate}%</div>
              <div className="text-xs text-neutral-500 mb-2">Issues resolved</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '${serviceKPIs.resolutionRate}%' }}></div>
              </div>
            </div>

            {/* First Call Resolution */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-300">First Call Resolution</span>
                <div className={'flex items-center gap-1 text-xs ${
                  serviceKPIs.fcrChange >= 0 ? 'text-emerald-400' : 'text-red-400`
                }`}>
                  {serviceKPIs.fcrChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(serviceKPIs.fcrChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{serviceKPIs.firstCallResolution}%</div>
              <div className="text-xs text-neutral-500 mb-2">Resolved first time</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${serviceKPIs.firstCallResolution}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Satisfaction Chart */}
      <div className="w-full bg-neutral-950 border-b border-neutral-800">
        <div className="px-6 py-3 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-neutral-100">Customer Satisfaction Trends</h3>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                Real-time Feedback Analysis
              </Badge>
            </div>
          </div>
        </div>
        <div className="h-96 w-full">
          {dashboardData.customerSatisfaction && (
            <TradingViewWrapper
              data={dashboardData.customerSatisfaction as TradingViewChartData[]}
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
          
          {/* Feedback Breakdown & Service Channels */}
          <div className="grid grid-cols-2 gap-6">
            {/* Rating Distribution */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Rating Distribution</h3>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs ml-auto">
                    {feedbackBreakdown.reduce((sum, item) => sum + item.count, 0)} Reviews
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {feedbackBreakdown.map((rating, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(rating.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                            {[...Array(5 - rating.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-neutral-600" />
                            ))}
                          </div>
                          <span className="text-sm text-neutral-300">({rating.rating} stars)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-400">{rating.percentage}%</span>
                          <span className="text-xs text-emerald-400">{rating.trend}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-neutral-300">{rating.count} reviews</div>
                        <div className="w-32 bg-neutral-800 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${rating.color}`} 
                            style={{ width: '${rating.percentage}%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Service Channels Performance */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Service Channels Performance</h3>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs ml-auto">
                    Multi-Channel
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {serviceChannels.map((channel, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-neutral-100">{channel.channel}</div>
                          <div className={'w-2 h-2 rounded-full ${
                            channel.trend === 'up' ? 'bg-emerald-500' :
                            channel.trend === 'down' ? 'bg-red-500' : 'bg-yellow-500'
                          }'}></div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span className="text-sm text-neutral-300">{channel.satisfactionScore}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <div className="text-blue-400 font-semibold">{channel.totalInteractions}</div>
                          <div className="text-neutral-400">Interactions</div>
                        </div>
                        <div>
                          <div className="text-emerald-400 font-semibold">{channel.avgResponseTime}</div>
                          <div className="text-neutral-400">Avg Response</div>
                        </div>
                        <div>
                          <div className="text-purple-400 font-semibold">{channel.resolutionRate}%</div>
                          <div className="text-neutral-400">Resolution</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Common Issues Analysis */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-medium text-neutral-100">Common Service Issues</h3>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-xs ml-auto">
                  Issue Tracking
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-3 px-4 font-medium text-neutral-300">Issue Type</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Frequency</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">% of Total</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Avg Resolution</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Satisfaction</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commonIssues.map((issue, index) => (
                      <tr key={index} className="border-b border-neutral-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <span className="text-white font-medium">{issue.issue}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right text-blue-400 font-semibold">{issue.frequency}</td>
                        <td className="py-4 px-4 text-right text-neutral-300">{issue.percentage}%</td>
                        <td className="py-4 px-4 text-right text-neutral-300">{issue.avgResolutionTime}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span className="text-neutral-300">{issue.satisfactionScore}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={'inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                            issue.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
                            issue.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                            'bg-neutral-700/50 text-neutral-400'
                          }'}>
                            {issue.trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
                             issue.trend === 'down' ? <TrendingDown className="h-3 w-3" /> :
                             <Activity className="h-3 w-3" />}
                            {issue.trend === 'up' ? 'Increasing' :
                             issue.trend === 'down' ? 'Decreasing' : 'Stable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Representatives Performance */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-neutral-100">Top Customer Service Representatives</h3>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs ml-auto">
                  Performance Leaders
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {topRepresentatives.map((rep, index) => (
                  <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-medium text-sm">
                          {rep.name.split(' ').map(n => n[0]).join(')}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-100">{rep.name}</div>
                          <div className="text-sm text-neutral-400">{rep.callsHandled} calls handled</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="font-semibold text-neutral-100">{rep.avgRating}</span>
                        </div>
                        <div className="text-sm text-neutral-400">Customer rating</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-emerald-400">{rep.resolutionRate}%</div>
                        <div className="text-xs text-neutral-400">Resolution Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-400">{rep.avgCallTime}</div>
                        <div className="text-xs text-neutral-400">Avg Call Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-400">{rep.specialties.length}</div>
                        <div className="text-xs text-neutral-400">Specialties</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-700/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">Specialties:</span>
                        {rep.specialties.slice(0, 2).map((specialty, i) => (
                          <span key={i} className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-neutral-400 italic max-w-xs">
                        "{rep.customerComments}"
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
              <span className="text-neutral-400">Service System:</span>
              <span className="text-emerald-400">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Avg Rating:</span>
              <span className="text-yellow-400">{serviceKPIs.avgRating}/5</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Resolution Rate:</span>
              <span className="text-emerald-400">{serviceKPIs.resolutionRate}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Response Time:</span>
              <span className="text-emerald-400">{serviceKPIs.avgResponseTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Total Calls:</span>
              <span className="text-blue-400">{serviceKPIs.totalCalls.toLocaleString()}</span>
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