"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Settings,
  Download,
  RefreshCw,
  Calculator,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Percent,
  CreditCard,
  Banknote,
  Wallet
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

export default function RevenueAnalytics() {
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
        revenue: rawData.revenue || [],
        profitability: rawData.customerSatisfaction || [],
        expenses: rawData.jobsCompleted || [],
      });
      
      setIsLoading(false);
    };
    
    loadDashboardData();
  }, [selectedTimeframe]);

  // Revenue KPIs
  const revenueKPIs = {
    totalRevenue: 487650,
    revenueChange: 18.4,
    grossProfit: 351420,
    profitChange: 22.1,
    netMargin: 28.7,
    marginChange: 3.4,
    avgJobValue: 485,
    jobValueChange: 8.9,
    monthlyRecurring: 124800,
    recurringChange: 15.2
  };

  // Department revenue breakdown
  const departmentRevenue = [
    {
      department: 'HVAC Services',
      revenue: 198450,
      percentage: 40.7,
      change: 22.3,
      avgJobValue: 580,
      jobCount: 342,
      margin: 32.4
    },
    {
      department: 'Plumbing',
      revenue: 156320,
      percentage: 32.1,
      change: 15.8,
      avgJobValue: 425,
      jobCount: 368,
      margin: 28.9
    },
    {
      department: 'Electrical',
      revenue: 89760,
      percentage: 18.4,
      change: 19.2,
      avgJobValue: 510,
      jobCount: 176,
      margin: 35.2
    },
    {
      department: 'General Repair',
      revenue: 43120,
      percentage: 8.8,
      change: 8.7,
      avgJobValue: 285,
      jobCount: 151,
      margin: 18.6
    }
  ];

  // Revenue by customer type
  const customerTypeRevenue = [
    { type: 'Residential', revenue: 298540, percentage: 61.2, jobs: 723, avgValue: 413 },
    { type: 'Commercial', revenue: 142890, percentage: 29.3, jobs: 185, avgValue: 772 },
    { type: 'Emergency', revenue: 46220, percentage: 9.5, jobs: 89, avgValue: 519 }
  ];

  // Monthly trends
  const monthlyData = [
    { month: 'Jan', revenue: 42340, expenses: 28450, profit: 13890 },
    { month: 'Feb', revenue: 45210, expenses: 30120, profit: 15090 },
    { month: 'Mar', revenue: 48930, expenses: 31240, profit: 17690 },
    { month: 'Apr', revenue: 44850, revenue: 29870, profit: 14980 },
    { month: 'May', revenue: 51240, expenses: 33180, profit: 18060 },
    { month: 'Jun', revenue: 54680, expenses: 35120, profit: 19560 }
  ];

  // Profitability metrics
  const profitabilityMetrics = [
    {
      metric: 'Gross Profit Margin',
      current: 72.1,
      target: 70.0,
      change: 2.8,
      status: 'excellent'
    },
    {
      metric: 'Net Profit Margin',
      current: 28.7,
      target: 25.0,
      change: 3.4,
      status: 'excellent'
    },
    {
      metric: 'Operating Margin',
      current: 34.2,
      target: 30.0,
      change: 4.1,
      status: 'excellent'
    },
    {
      metric: 'Labor Cost Ratio',
      current: 42.8,
      target: 45.0,
      change: -1.9,
      status: 'good'
    }
  ];

  // Payment method analysis
  const paymentMethods = [
    { method: 'Credit Card', amount: 195060, percentage: 40.0, fees: 5851 },
    { method: 'Bank Transfer', amount: 146295, percentage: 30.0, fees: 732 },
    { method: 'Cash', amount: 97530, percentage: 20.0, fees: 0 },
    { method: 'Check', amount: 48765, percentage: 10.0, fees: 0 }
  ];

  // Generate sample data
  const generateSparkData = (count: number, trend: 'up' | 'down' | 'stable' = 'up') => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: trend === 'up' ? 40000 + i * 2000 + Math.random() * 5000 :
             trend === 'down' ? 70000 - i * 1500 + Math.random() * 3000 :
             50000 + Math.random() * 10000
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(15, 'up'),
      generateSparkData(15, 'up'),
      generateSparkData(15, 'stable'),
      generateSparkData(15, 'up')
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading revenue analytics...</span>
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
              <div className="w-8 h-8 bg-emerald-500/10 rounded border border-emerald-500/20 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-100">Revenue & Profitability Analytics</h1>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>Financial Performance Analysis</span>
                  <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                  <span>Real-time Revenue Tracking</span>
                  {isRealTimeActive && (
                    <>
                      <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-emerald-400">Live Data</span>
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
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                7D
              </button>
              <button
                onClick={() => setSelectedTimeframe('30d')}
                className={'px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 ${
                  selectedTimeframe === '30d'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                30D
              </button>
              <button
                onClick={() => setSelectedTimeframe('90d')}
                className={'px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 ${
                  selectedTimeframe === '90d'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                90D
              </button>
              <button
                onClick={() => setSelectedTimeframe('ytd')}
                className={'px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 ${
                  selectedTimeframe === 'ytd'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-neutral-400 hover:text-neutral-300'
                }'}
              >
                YTD
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

      {/* Financial KPIs */}
      <div className="border-b border-neutral-800">
        <div className="px-6 py-4">
          <div className="grid grid-cols-5 gap-6 mb-6">
            {/* Total Revenue */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-300">Total Revenue</span>
                <div className={'flex items-center gap-1 text-xs ${
                  revenueKPIs.revenueChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {revenueKPIs.revenueChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(revenueKPIs.revenueChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">${revenueKPIs.totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-neutral-500 mb-2">This period</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={120} 
                height={20} 
                color="#10b981"
              />
            </div>

            {/* Gross Profit */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Gross Profit</span>
                <div className={'flex items-center gap-1 text-xs ${
                  revenueKPIs.profitChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {revenueKPIs.profitChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(revenueKPIs.profitChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">${revenueKPIs.grossProfit.toLocaleString()}</div>
              <div className="text-xs text-neutral-500 mb-2">After COGS</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={120} 
                height={20} 
                color="#1C8BFF"
              />
            </div>

            {/* Net Margin */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Percent className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-300">Net Margin</span>
                <div className={'flex items-center gap-1 text-xs ${
                  revenueKPIs.marginChange >= 0 ? 'text-emerald-400' : 'text-red-400`
                }`}>
                  {revenueKPIs.marginChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(revenueKPIs.marginChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{revenueKPIs.netMargin}%</div>
              <div className="text-xs text-neutral-500 mb-2">Profit margin</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: '${revenueKPIs.netMargin}%' }}></div>
              </div>
            </div>

            {/* Avg Job Value */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Job Value</span>
                <div className={'flex items-center gap-1 text-xs ${
                  revenueKPIs.jobValueChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {revenueKPIs.jobValueChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(revenueKPIs.jobValueChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">${revenueKPIs.avgJobValue}</div>
              <div className="text-xs text-neutral-500 mb-2">Per job average</div>
              <SparkLine 
                data={abstractData.sparklines[2]} 
                width={120} 
                height={20} 
                color="#f59e0b"
              />
            </div>

            {/* Recurring Revenue */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-neutral-300">Monthly Recurring</span>
                <div className={'flex items-center gap-1 text-xs ${
                  revenueKPIs.recurringChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {revenueKPIs.recurringChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(revenueKPIs.recurringChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">${revenueKPIs.monthlyRecurring.toLocaleString()}</div>
              <div className="text-xs text-neutral-500 mb-2">MRR contracts</div>
              <SparkLine 
                data={abstractData.sparklines[3]} 
                width={120} 
                height={20} 
                color="#06b6d4"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="w-full bg-neutral-950 border-b border-neutral-800">
        <div className="px-6 py-3 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LineChart className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-medium text-neutral-100">Revenue Performance & Profitability Trends</h3>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                Real-time Revenue Data
              </Badge>
            </div>
          </div>
        </div>
        <div className="h-96 w-full">
          {dashboardData.revenue && (
            <TradingViewWrapper
              data={dashboardData.revenue as TradingViewChartData[]}
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
          
          {/* Department Revenue Analysis */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-neutral-100">Department Revenue Analysis</h3>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs ml-auto">
                  Departmental Breakdown
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-3 px-4 font-medium text-neutral-300">Department</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Revenue</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">% of Total</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Growth</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Avg Job Value</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Job Count</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-300">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentRevenue.map((dept, index) => (
                      <tr key={index} className="border-b border-neutral-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className={'h-3 w-3 rounded-full mr-3 ${
                              dept.department === 'HVAC Services' ? 'bg-emerald-500' :
                              dept.department === 'Plumbing' ? 'bg-blue-500' :
                              dept.department === 'Electrical' ? 'bg-yellow-500' : 'bg-purple-500'
                            }'}></div>
                            <span className="text-white font-medium">{dept.department}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right text-emerald-400 font-semibold">
                          ${dept.revenue.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right text-neutral-300">{dept.percentage}%</td>
                        <td className="py-4 px-4 text-right">
                          <span className={'flex items-center justify-end gap-1 ${
                            dept.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }'}>
                            {dept.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(dept.change)}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-neutral-300">${dept.avgJobValue}</td>
                        <td className="py-4 px-4 text-right text-neutral-300">{dept.jobCount}</td>
                        <td className="py-4 px-4 text-right">
                          <span className={'${
                            dept.margin > 30 ? 'text-emerald-400' : 
                            dept.margin > 20 ? 'text-yellow-400' : 'text-red-400'
                          }'}>
                            {dept.margin}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Revenue by Customer Type and Payment Methods */}
          <div className="grid grid-cols-2 gap-6">
            {/* Customer Type Revenue */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Revenue by Customer Type</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {customerTypeRevenue.map((type, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={'w-3 h-3 rounded-full ${
                            type.type === 'Residential' ? 'bg-green-500' :
                            type.type === 'Commercial' ? 'bg-blue-500' : 'bg-red-500'
                          }'}></div>
                          <span className="font-medium text-neutral-100">{type.type}</span>
                        </div>
                        <span className="text-sm text-neutral-400">{type.percentage}%</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-emerald-400 font-semibold">${type.revenue.toLocaleString()}</div>
                          <div className="text-neutral-400 text-xs">Revenue</div>
                        </div>
                        <div>
                          <div className="text-blue-400 font-semibold">{type.jobs}</div>
                          <div className="text-neutral-400 text-xs">Jobs</div>
                        </div>
                        <div>
                          <div className="text-purple-400 font-semibold">${type.avgValue}</div>
                          <div className="text-neutral-400 text-xs">Avg Value</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Payment Method Analysis</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {method.method === 'Credit Card' && <CreditCard className="h-4 w-4 text-blue-400" />}
                          {method.method === 'Bank Transfer' && <Banknote className="h-4 w-4 text-green-400" />}
                          {method.method === 'Cash' && <Wallet className="h-4 w-4 text-yellow-400" />}
                          {method.method === 'Check' && <Calculator className="h-4 w-4 text-purple-400" />}
                          <span className="font-medium text-neutral-100">{method.method}</span>
                        </div>
                        <span className="text-sm text-neutral-400">{method.percentage}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <div className="text-emerald-400 font-semibold">${method.amount.toLocaleString()}</div>
                          <div className="text-neutral-400 text-xs">Amount</div>
                        </div>
                        <div className="text-right">
                          <div className={'font-semibold ${method.fees > 0 ? 'text-red-400' : 'text-emerald-400'}'}>
                            ${method.fees.toLocaleString()}
                          </div>
                          <div className="text-neutral-400 text-xs">Fees</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Profitability Metrics */}
          <div className="border border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <h3 className="text-sm font-medium text-neutral-100">Profitability Metrics</h3>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs ml-auto">
                  Financial Health
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-6">
                {profitabilityMetrics.map((metric, index) => (
                  <div key={index} className="bg-neutral-800/30 border border-neutral-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-neutral-100">{metric.metric}</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-neutral-400">Target: {metric.target}%</span>
                          <div className={'flex items-center gap-1 text-xs ${
                            metric.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }'}>
                            {metric.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(metric.change)}%
                          </div>
                        </div>
                      </div>
                      <div className={'px-2 py-1 rounded text-xs ${
                        metric.status === 'excellent' ? 'bg-emerald-500/20 text-emerald-400' :
                        metric.status === 'good' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-orange-500/20 text-orange-400'
                      }'}>
                        {metric.status === 'excellent' ? (
                          <>
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            Excellent
                          </>
                        ) : metric.status === 'good' ? (
                          <>
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            Good
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            Monitor
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-2xl font-bold text-neutral-100 mb-2">{metric.current}%</div>
                    
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <div 
                        className={'h-2 rounded-full ${
                          metric.current >= metric.target ? 'bg-emerald-400' : 'bg-orange-400`
                        }'} 
                        style={{ width: '${Math.min((metric.current / metric.target) * 100, 100)}%' }}
                      ></div>
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
              <span className="text-neutral-400">Financial System:</span>
              <span className="text-emerald-400">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Total Revenue:</span>
              <span className="text-emerald-400">${revenueKPIs.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Net Margin:</span>
              <span className="text-purple-400">{revenueKPIs.netMargin}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Avg Job Value:</span>
              <span className="text-orange-400">${revenueKPIs.avgJobValue}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">MRR:</span>
              <span className="text-cyan-400">${revenueKPIs.monthlyRecurring.toLocaleString()}</span>
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