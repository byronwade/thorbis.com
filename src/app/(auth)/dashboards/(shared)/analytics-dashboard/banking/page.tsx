"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  TrendingUp, 
  TrendingDown,
  Activity, 
  DollarSign, 
  CreditCard, 
  PieChart,
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
  Zap,
  Shield,
  TrendingUp as TrendIcon,
  Banknote,
  Building2,
  Wallet
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

export default function BankingAnalyticsPlatform() {
  const searchParams = useSearchParams();
  const fromIndustry = searchParams.get('from') || 'homeservices';

  // State management for banking dashboard
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const realTimeStreamRef = useRef(null);
  
  // Initialize dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Generate banking-specific data using our charts module
      const industryGenerator = chartsModule.generators[
        fromIndustry === 'hs' ? 'homeServices' :
        fromIndustry === 'rest' ? 'restaurant' :
        fromIndustry === 'auto' ? 'automotive' :
        'retail'
      ];
      
      const rawData = industryGenerator(30, true);
      
      // Process data for different chart types and banking KPIs
      setDashboardData({
        transactions: rawData.revenue || rawData.serviceOrders || rawData.transactions || [],
        deposits: rawData.primaryMetric || rawData.jobsCompleted || rawData.orderVolume || [],
        withdrawals: rawData.secondaryMetric || rawData.customerSatisfaction || rawData.averageOrderValue || [],
        technicalData: chartsModule.formatters.candlestick(rawData.revenue || rawData.transactions || [], 0.08),
        volumeData: chartsModule.formatters.histogram(rawData.primaryMetric || rawData.revenue || [], 0.3),
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
  
  // Real-time data streaming for banking transactions
  useEffect(() => {
    if (isRealTimeActive) {
      realTimeStreamRef.current = new chartsModule.realTime(fromIndustry, 2000);
      
      realTimeStreamRef.current.subscribe('transactions', (dataPoint) => {
        setDashboardData(prev => ({
          ...prev,
          transactions: [...prev.transactions.slice(-29), dataPoint]
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
      value: 30 + Math.random() * 70
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(15),
      generateSparkData(15),
      generateSparkData(15)
    ],
    performanceMetrics: [
      { label: 'Account Health', value: 92, maxValue: 100, color: '#10b981' },
      { label: 'Cash Velocity', value: 78, maxValue: 100, color: '#1C8BFF' },
      { label: 'Risk Score', value: 15, maxValue: 100, color: '#f59e0b' }
    ],
    systemHealth: [
      { name: 'Bank API', metrics: [98, 96, 99, 97] },
      { name: 'Fraud Detection', metrics: [94, 98, 96, 99] },
      { name: 'Real-time Sync', metrics: [97, 95, 98, 96] }
    ],
    dataFlows: [
      { from: 'Checking', to: 'Processing', volume: 2340, color: '#10b981' },
      { from: 'Savings', to: 'Investment', volume: 1890, color: '#1C8BFF' },
      { from: 'Credit', to: 'Payments', volume: 1450, color: '#f59e0b' }
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading Banking analytics...</span>
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
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-100">Banking Analytics</h1>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="capitalize">Transaction Intelligence</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <span>Multi-Account View</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-blue-400">Live Feeds</span>
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
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            7D
          </button>
          <button
            onClick={() => setSelectedTimeframe('30d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '30d'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            30D
          </button>
          <button
            onClick={() => setSelectedTimeframe('90d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '90d'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
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
        {/* Banking Health KPIs */}
        <div className="px-8 py-6 bg-neutral-950">
          <div className="grid grid-cols-4 gap-6">
            {/* Account Balance */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Total Balance</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +$12,450
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-400">$287,340</div>
              <div className="text-xs text-neutral-500 mb-3">Across all accounts</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={120} 
                height={24} 
                color="#1C8BFF"
              />
            </div>

            {/* Monthly Cash Flow */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-300">Net Cash Flow</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  18.2%
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-400">+$58,920</div>
              <div className="text-xs text-neutral-500 mb-3">30-day inflow</div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="bg-emerald-400 h-2 rounded-full transition-all duration-1000" style={{ width: '78%' }}></div>
              </div>
            </div>

            {/* Transaction Volume */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-300">Transaction Volume</span>
                <div className="flex items-center gap-1 text-xs text-purple-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  Real-time
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-400">2,847</div>
              <div className="text-xs text-neutral-500 mb-3">This month</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={120} 
                height={24} 
                color="#a855f7"
              />
            </div>

            {/* Risk Assessment */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-neutral-300">Risk Score</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowDownRight className="h-3 w-3" />
                  -3pts
                </div>
              </div>
              <div className="text-3xl font-bold text-orange-400">15/100</div>
              <div className="text-xs text-neutral-500 mb-3">Low risk profile</div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="bg-orange-400 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Flow Chart - Full Width */}
        <div className="w-full bg-neutral-950 relative">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <h3 className="text-lg font-medium text-neutral-100">Transaction Flow Analysis</h3>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Live Banking Data</Badge>
              </div>
            </div>
          </div>
          <div className="h-96 w-full pointer-events-auto">
            {dashboardData.transactions && (
              <TradingViewWrapper
                data={dashboardData.transactions as TradingViewChartData[]}
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

        {/* Banking Analytics Sections */}
        <div className="space-y-8 px-8 py-6 bg-neutral-950">
          
          {/* Account Performance and Spending Analysis */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Banknote className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Account Performance</h3>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Multi-Bank</Badge>
                </div>
                {dashboardData.deposits && (
                  <EnhancedLineChart
                    data={dashboardData.deposits}
                    height={240}
                  />
                )}
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Spending Categories</h3>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">Smart Classification</Badge>
                </div>
                {dashboardData.withdrawals && (
                  <ModernDoughnutChart
                    data={dashboardData.withdrawals.slice(-6)}
                    segments={['Business Ops', 'Payroll', 'Equipment', 'Marketing', 'Utilities', 'Other']}
                    height={180}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Account Details and Transaction Analysis */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-neutral-100">Account Overview</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm text-neutral-300">Business Checking</span>
                  </div>
                  <span className="text-sm font-medium text-blue-400">$127,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-sm text-neutral-300">High-Yield Savings</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">$89,340</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm text-neutral-300">Money Market</span>
                  </div>
                  <span className="text-sm font-medium text-yellow-400">$45,670</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm text-neutral-300">Business Credit Line</span>
                  </div>
                  <span className="text-sm font-medium text-red-400">-$24,880</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2 mt-4">
                  <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-medium text-neutral-100">Payment Methods</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">ACH Transfers</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-neutral-300">1,245</div>
                    <div className="text-xs text-emerald-400">67% of volume</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Wire Transfers</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-neutral-300">234</div>
                    <div className="text-xs text-blue-400">18% of volume</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Check Payments</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-neutral-300">156</div>
                    <div className="text-xs text-yellow-400">8% of volume</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Card Transactions</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-neutral-300">89</div>
                    <div className="text-xs text-purple-400">7% of volume</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <h3 className="text-sm font-medium text-neutral-100">Fraud Detection</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Blocked Transactions</span>
                  <span className="text-sm font-medium text-red-400">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Flagged for Review</span>
                  <span className="text-sm font-medium text-yellow-400">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">False Positives</span>
                  <span className="text-sm font-medium text-neutral-400">1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Protection Rate</span>
                  <span className="text-sm font-medium text-emerald-400">99.87%</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2 mt-4">
                  <div className="bg-red-400 h-2 rounded-full" style={{ width: '97%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Cash Flow Forecasting and Reconciliation */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendIcon className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-neutral-100">90-Day Cash Flow Forecast</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs text-neutral-400">Projected Inflow</div>
                  <div className="text-lg font-bold text-emerald-400">$184,560</div>
                  <div className="text-xs text-neutral-300">Next 30 days</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-neutral-400">Projected Outflow</div>
                  <div className="text-lg font-bold text-red-400">$126,340</div>
                  <div className="text-xs text-neutral-300">Next 30 days</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-neutral-400">Net Position</div>
                  <div className="text-lg font-bold text-blue-400">+$58,220</div>
                  <div className="text-xs text-neutral-300">Expected surplus</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-neutral-400">Confidence Level</div>
                  <div className="text-lg font-bold text-purple-400">87%</div>
                  <div className="text-xs text-neutral-300">ML prediction</div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-neutral-100">Account Reconciliation</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm text-neutral-300">Wells Fargo Business</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">Reconciled</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm text-neutral-300">Chase Business Plus</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">Reconciled</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm text-neutral-300">BofA Business</span>
                  </div>
                  <span className="text-sm font-medium text-yellow-400">Pending</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm text-neutral-300">American Express</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">Reconciled</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Overall Status</span>
                  <span className="text-sm font-medium text-emerald-400">96.2% Complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Health and Data Flow */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-medium text-neutral-100">Banking System Health</h3>
              </div>
              <SystemHealthMatrix systems={abstractData.systemHealth} />
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-neutral-100">Transaction Flow</h3>
              </div>
              <DataFlowViz flows={abstractData.dataFlows} />
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-medium text-neutral-100">Banking Performance</h3>
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
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-neutral-400">Banking APIs: </span>
            <span className="text-blue-400">Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Last Sync: </span>
            <span className="text-neutral-300">30 seconds ago</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Transactions: </span>
            <span className="text-neutral-300">{dashboardData.transactions?.length || 0} processed</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Account Health: </span>
            <span className="text-emerald-400">92/100</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Risk Level: </span>
            <span className="text-emerald-300">Low</span>
          </div>
          <button className="flex items-center gap-1 text-neutral-400 hover:text-neutral-100 transition-colors">
            <RefreshCw className="h-3 w-3" />
            Sync All
          </button>
        </div>
      </div>
    </div>
  );
}