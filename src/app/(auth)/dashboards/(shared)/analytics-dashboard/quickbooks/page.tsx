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
  Zap
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

export default function QuickBooksAnalyticsPlatform() {
  const searchParams = useSearchParams();
  const fromIndustry = searchParams.get('from') || 'homeservices';

  // State management for enterprise dashboard
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const realTimeStreamRef = useRef(null);
  
  // Initialize dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Generate industry-specific data using our charts module
      const industryGenerator = chartsModule.generators[
        fromIndustry === 'hs' ? 'homeServices' :
        fromIndustry === 'rest' ? 'restaurant' :
        fromIndustry === 'auto' ? 'automotive' :
        'retail'
      ];
      
      const rawData = industryGenerator(30, true);
      
      // Process data for different chart types and KPIs
      setDashboardData({
        revenue: rawData.revenue || rawData.serviceOrders || rawData.transactions || [],
        primaryMetric: rawData.jobsCompleted || rawData.orderVolume || rawData.serviceOrders || rawData.transactions || [],
        secondaryMetric: rawData.customerSatisfaction || rawData.averageOrderValue || rawData.averageRepairValue || rawData.averageBasketSize || [],
        technicalData: chartsModule.formatters.candlestick(rawData.revenue || rawData.transactions || [], 0.12),
        volumeData: chartsModule.formatters.histogram(rawData.primaryMetric || rawData.revenue || [], 0.4),
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
  }, [fromIndustry]);
  
  // Real-time data streaming
  useEffect(() => {
    if (isRealTimeActive) {
      realTimeStreamRef.current = new chartsModule.realTime(fromIndustry, 3000);
      
      realTimeStreamRef.current.subscribe('revenue', (dataPoint) => {
        setDashboardData(prev => ({
          ...prev,
          revenue: [...prev.revenue.slice(-29), dataPoint]
        }));
      });
      
      return () => {
        if (realTimeStreamRef.current) {
          realTimeStreamRef.current.stop();
        }
      };
    }
  }, [isRealTimeActive, fromIndustry]);

  // Generate sample data for abstract visualizations
  const generateSparkData = (count: number) => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: 50 + Math.random() * 50
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(15),
      generateSparkData(15),
      generateSparkData(15)
    ],
    performanceMetrics: [
      { label: 'Revenue Health', value: 87, maxValue: 100, color: '#10b981' },
      { label: 'Cash Flow', value: 72, maxValue: 100, color: '#1C8BFF' },
      { label: 'Tax Readiness', value: 94, maxValue: 100, color: '#f59e0b' }
    ],
    systemHealth: [
      { name: 'QB Sync', metrics: [98, 95, 97, 94] },
      { name: 'Bank Feeds', metrics: [89, 87, 92, 88] },
      { name: 'Tax Engine', metrics: [95, 98, 94, 96] }
    ],
    dataFlows: [
      { from: 'Bank', to: 'QB', volume: 1250, color: '#10b981' },
      { from: 'QB', to: 'Reports', volume: 890, color: '#1C8BFF' },
      { from: 'Tax', to: 'Filing', volume: 340, color: '#f59e0b' }
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading QuickBooks analytics...</span>
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
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-100">QuickBooks Analytics</h1>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="capitalize">Financial Intelligence</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <span>Real-time Sync</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400">Connected</span>
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
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            7D
          </button>
          <button
            onClick={() => setSelectedTimeframe('30d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '30d'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            30D
          </button>
          <button
            onClick={() => setSelectedTimeframe('90d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '90d'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
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
        {/* Financial Health KPIs */}
        <div className="px-8 py-6 bg-neutral-950">
          <div className="grid grid-cols-4 gap-6">
            {/* Financial Health Score */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-300">Financial Health Score</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +5pts
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-400">87/100</div>
              <div className="text-xs text-neutral-500 mb-3">Excellent position</div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="bg-emerald-400 h-2 rounded-full transition-all duration-1000" style={{ width: '87%' }}></div>
              </div>
            </div>

            {/* Cash Flow */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Net Cash Flow</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  12.3%
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-400">+$42,380</div>
              <div className="text-xs text-neutral-500 mb-3">30-day net flow</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={120} 
                height={24} 
                color="#1C8BFF"
              />
            </div>

            {/* Tax Liability */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-neutral-300">Tax Liability</span>
                <div className="flex items-center gap-1 text-xs text-orange-400">
                  <ArrowUpRight className="h-3 w-3" />
                  Q1 Due
                </div>
              </div>
              <div className="text-3xl font-bold text-orange-400">$8,450</div>
              <div className="text-xs text-neutral-500 mb-3">Estimated quarterly</div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="bg-orange-400 h-2 rounded-full" style={{ width: '34%' }}></div>
              </div>
            </div>

            {/* Account Sync Status */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-300">Sync Status</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Live
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-400">98.5%</div>
              <div className="text-xs text-neutral-500 mb-3">Account accuracy</div>
              <div className="text-xs text-emerald-400">✓ All accounts synced</div>
            </div>
          </div>
        </div>

        {/* Revenue & Cash Flow Chart - Full Width */}
        <div className="w-full bg-neutral-950 relative">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-emerald-400" />
                <h3 className="text-lg font-medium text-neutral-100">Revenue & Cash Flow Analysis</h3>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">QuickBooks Connected</Badge>
              </div>
            </div>
          </div>
          <div className="h-96 w-full pointer-events-auto">
            {dashboardData.revenue && (
              <TradingViewWrapper
                data={dashboardData.revenue as TradingViewChartData[]}
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

        {/* Financial Analytics Sections */}
        <div className="space-y-8 px-8 py-6 bg-neutral-950">
          
          {/* P&L and Cash Flow Forecast */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Profit & Loss Trend</h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">YTD</Badge>
                </div>
                {dashboardData.primaryMetric && (
                  <EnhancedLineChart
                    data={dashboardData.primaryMetric}
                    height={240}
                  />
                )}
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-medium text-neutral-100">90-Day Cash Flow Forecast</h3>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Predictive</Badge>
                </div>
                {dashboardData.primaryMetric && (
                  <ModernBarChart
                    data={dashboardData.primaryMetric.slice(-12)}
                    height={240}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Expense Analysis and Customer Payments */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Expense Categories</h3>
                </div>
                {dashboardData.secondaryMetric && (
                  <ModernDoughnutChart
                    data={dashboardData.secondaryMetric.slice(-6)}
                    segments={['Office Supplies', 'Marketing', 'Travel', 'Equipment', 'Utilities', 'Other']}
                    height={180}
                  />
                )}
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-neutral-100">Accounts Receivable</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Outstanding</span>
                  <span className="text-sm font-medium text-orange-400">$15,240</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Overdue (30+ days)</span>
                  <span className="text-sm font-medium text-red-400">$3,120</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Paid This Month</span>
                  <span className="text-sm font-medium text-emerald-400">$28,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Avg Days to Pay</span>
                  <span className="text-sm font-medium text-blue-400">18 days</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2 mt-4">
                  <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '73%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-yellow-400" />
                <h3 className="text-sm font-medium text-neutral-100">Accounts Payable</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Due This Week</span>
                  <span className="text-sm font-medium text-yellow-400">$2,340</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Due Next Week</span>
                  <span className="text-sm font-medium text-neutral-300">$1,890</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Paid This Month</span>
                  <span className="text-sm font-medium text-emerald-400">$12,560</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Payment Schedule</span>
                  <span className="text-sm font-medium text-blue-400">5 days early avg</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2 mt-4">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Planning and Bank Reconciliation */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-medium text-neutral-100">Tax Planning Dashboard</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs text-neutral-400">Q1 2024 Estimated</div>
                  <div className="text-lg font-bold text-orange-400">$8,450</div>
                  <div className="text-xs text-neutral-300">Due: Apr 15</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-neutral-400">YTD Tax Liability</div>
                  <div className="text-lg font-bold text-red-400">$34,200</div>
                  <div className="text-xs text-neutral-300">Total estimated</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-neutral-400">Deduction Tracker</div>
                  <div className="text-lg font-bold text-emerald-400">$12,340</div>
                  <div className="text-xs text-neutral-300">Available</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-neutral-400">Effective Tax Rate</div>
                  <div className="text-lg font-bold text-blue-400">22.5%</div>
                  <div className="text-xs text-neutral-300">Current year</div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-neutral-100">Bank Reconciliation Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm text-neutral-300">Business Checking</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">Reconciled</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm text-neutral-300">Business Savings</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">Reconciled</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm text-neutral-300">Credit Card</span>
                  </div>
                  <span className="text-sm font-medium text-yellow-400">Pending</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm text-neutral-300">PayPal Business</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">Reconciled</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Overall Accuracy</span>
                  <span className="text-sm font-medium text-emerald-400">98.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Health and Data Flow */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-medium text-neutral-100">System Health</h3>
              </div>
              <SystemHealthMatrix systems={abstractData.systemHealth} />
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-neutral-100">Data Flow</h3>
              </div>
              <DataFlowViz flows={abstractData.dataFlows} />
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-neutral-100">Financial Performance</h3>
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
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-neutral-400">QuickBooks: </span>
            <span className="text-emerald-400">Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Last Sync: </span>
            <span className="text-neutral-300">2 minutes ago</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Transactions: </span>
            <span className="text-neutral-300">{dashboardData.revenue?.length || 0} processed</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Health Score: </span>
            <span className="text-emerald-400">87/100</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Cash Position: </span>
            <span className="text-emerald-300">Strong</span>
          </div>
          <button className="flex items-center gap-1 text-neutral-400 hover:text-neutral-100 transition-colors">
            <RefreshCw className="h-3 w-3" />
            Sync Now
          </button>
        </div>
      </div>
    </div>
  );
}