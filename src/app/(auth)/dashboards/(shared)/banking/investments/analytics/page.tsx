'use client'

"use client";

import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Shield,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  Award,
  RefreshCw,
  Download,
  Filter,
  Zap,
  LineChart,
  AreaChart,
  Settings
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';


/**
 * Portfolio Analytics Page
 * 
 * Features:
 * - Advanced portfolio performance metrics and analytics
 * - Risk assessment with detailed breakdowns
 * - Asset allocation analysis with rebalancing suggestions
 * - Historical performance tracking with multiple timeframes
 * - Benchmark comparisons against major indices
 * - Sector and geographic diversification analysis
 * - Tax efficiency and dividend tracking
 * - Performance attribution analysis
 * - Risk-adjusted returns and volatility metrics
 * - Monte Carlo simulations for future projections
 * 
 * Integration:
 * - TradingView advanced charting for performance visualization
 * - Real-time portfolio data from Alpaca Markets API
 * - Historical market data for benchmark comparisons
 * - Risk calculation engines
 */
export default function PortfolioAnalyticsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y');
  const [selectedBenchmark, setSelectedBenchmark] = useState('SPY');
  const [analyticsView, setAnalyticsView] = useState('overview');

  // Mock analytics data - in real implementation, this would come from API
  const portfolioMetrics = {
    totalValue: 145250.75,
    totalReturn: 18750.25,
    totalReturnPercent: 14.8,
    annualizedReturn: 12.4,
    sharpeRatio: 1.42,
    beta: 0.89,
    alpha: 3.2,
    maxDrawdown: -12.3,
    volatility: 18.5,
    winRate: 67.8,
    profitFactor: 2.34,
    sortinoRatio: 1.89,
    informationRatio: 0.65,
    trackingError: 4.2
  };

  const performanceHistory = [
    { period: '1D', return: 1.64, benchmark: 0.53, alpha: 1.11 },
    { period: '1W', return: 3.2, benchmark: 2.1, alpha: 1.1 },
    { period: '1M', return: 5.8, benchmark: 4.2, alpha: 1.6 },
    { period: '3M', return: 8.9, benchmark: 6.8, alpha: 2.1 },
    { period: '6M', return: 12.4, benchmark: 9.1, alpha: 3.3 },
    { period: '1Y', return: 14.8, benchmark: 11.2, alpha: 3.6 },
    { period: 'YTD', return: 6.7, benchmark: 4.8, alpha: 1.9 },
    { period: 'All', return: 22.1, benchmark: 16.8, alpha: 5.3 }
  ];

  const riskBreakdown = {
    portfolioRisk: 18.5,
    marketRisk: 12.8,
    specificRisk: 5.7,
    concentrationRisk: 15.2,
    currencyRisk: 2.1,
    liquidityRisk: 8.3
  };

  const assetAllocation = [
    { 
      category: 'Large Cap Stocks', 
      current: 35.2, 
      target: 40.0, 
      deviation: -4.8,
      recommendation: 'Buy',
      risk: 'Medium',
      return1Y: 12.4 
    },
    { 
      category: 'Mid Cap Stocks', 
      current: 15.8, 
      target: 15.0, 
      deviation: 0.8,
      recommendation: 'Hold',
      risk: 'Medium-High',
      return1Y: 18.7 
    },
    { 
      category: 'Small Cap Stocks', 
      current: 8.5, 
      target: 10.0, 
      deviation: -1.5,
      recommendation: 'Buy',
      risk: 'High',
      return1Y: 22.1 
    },
    { 
      category: 'International Stocks', 
      current: 12.3, 
      target: 15.0, 
      deviation: -2.7,
      recommendation: 'Buy',
      risk: 'Medium-High',
      return1Y: 8.9 
    },
    { 
      category: 'ETFs', 
      current: 21.5, 
      target: 20.0, 
      deviation: 1.5,
      recommendation: 'Trim',
      risk: 'Low-Medium',
      return1Y: 10.2 
    },
    { 
      category: 'Cryptocurrency', 
      current: 6.7, 
      target: 5.0, 
      deviation: 1.7,
      recommendation: 'Trim',
      risk: 'Very High',
      return1Y: 45.8 
    }
  ];

  const sectorAnalysis = [
    { sector: 'Technology', allocation: 28.5, benchmark: 22.1, performance: 15.2, risk: 'High' },
    { sector: 'Healthcare', allocation: 15.2, benchmark: 13.8, performance: 8.9, risk: 'Medium' },
    { sector: 'Financial Services', allocation: 12.8, benchmark: 14.2, performance: 12.1, risk: 'Medium' },
    { sector: 'Consumer Discretionary', allocation: 11.4, benchmark: 12.5, performance: 18.7, risk: 'High' },
    { sector: 'Energy', allocation: 8.9, benchmark: 6.8, performance: 22.4, risk: 'Very High' },
    { sector: 'Communication Services', allocation: 7.8, benchmark: 8.9, performance: 6.4, risk: 'Medium-High' },
    { sector: 'Industrials', allocation: 6.2, benchmark: 8.1, performance: 14.3, risk: 'Medium' },
    { sector: 'Materials', allocation: 4.8, benchmark: 4.2, performance: 19.8, risk: 'High' },
    { sector: 'Utilities', allocation: 2.1, benchmark: 3.8, performance: 4.2, risk: 'Low' },
    { sector: 'Real Estate', allocation: 2.3, benchmark: 2.6, performance: 7.1, risk: 'Medium' }
  ];

  const riskMetrics = [
    { 
      metric: 'Value at Risk (1%)', 
      value: '$2,845', 
      description: '1% chance of losing more than this in 1 day',
      status: 'good' 
    },
    { 
      metric: 'Expected Shortfall', 
      value: '$4,120', 
      description: 'Average loss in worst 1% of scenarios',
      status: 'moderate' 
    },
    { 
      metric: 'Maximum Drawdown', 
      value: '12.3%', 
      description: 'Largest peak-to-trough decline',
      status: 'good' 
    },
    { 
      metric: 'Downside Deviation', 
      value: '11.8%', 
      description: 'Volatility of negative returns only',
      status: 'good' 
    }
  ];

  // TradingView Performance Chart Widget
  const TradingViewPerformanceWidget = () => {
    useEffect(() => {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            container_id: 'tradingview_performance_chart',
            width: '100%',
            height: 400,
            symbol: 'NASDAQ:AAPL',
            interval: 'D',
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#0a0a0a',
            enable_publishing: false,
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            hide_volume: true,
            backgroundColor: '#0a0a0a',
            studies: [
              'BB@tv-basicstudies',
              'RSI@tv-basicstudies'
            ],
            show_popup_button: false,
            popup_width: '1000',
            popup_height: '650'
          });
        }
      };
      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          document.head.removeChild(script);
        }
      };
    }, []);

    return (
      <div className="w-full h-[400px] bg-neutral-900 rounded-lg overflow-hidden">
        <div id="tradingview_performance_chart" className="w-full h-full" />
      </div>
    );
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
      case 'very low':
        return 'text-green-500 bg-green-500/20';
      case 'medium':
      case 'low-medium':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'medium-high':
      case 'high':
        return 'text-orange-500 bg-orange-500/20';
      case 'very high':
        return 'text-red-500 bg-red-500/20';
      default:
        return 'text-neutral-400 bg-neutral-400/20';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case 'buy':
        return 'text-green-500 bg-green-500/20';
      case 'hold':
        return 'text-blue-500 bg-blue-500/20';
      case 'trim':
      case 'sell':
        return 'text-red-500 bg-red-500/20';
      default:
        return 'text-neutral-400 bg-neutral-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Portfolio Analytics</h1>
            <p className="text-neutral-400">
              Advanced performance metrics, risk analysis, and portfolio insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32 bg-neutral-800 border-neutral-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                <SelectItem value="1D">1 Day</SelectItem>
                <SelectItem value="1W">1 Week</SelectItem>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
                <SelectItem value="6M">6 Months</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
                <SelectItem value="YTD">YTD</SelectItem>
                <SelectItem value="All">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Annualized Return</h3>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-500">{portfolioMetrics.annualizedReturn}%</p>
            <p className="text-xs text-neutral-400">vs {selectedBenchmark}: +3.2%</p>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Sharpe Ratio</h3>
            <Award className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">{portfolioMetrics.sharpeRatio}</p>
            <p className="text-xs text-neutral-400">Risk-adjusted return</p>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Portfolio Beta</h3>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-blue-500">{portfolioMetrics.beta}</p>
            <p className="text-xs text-neutral-400">Market correlation</p>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Max Drawdown</h3>
            <AlertTriangle className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-red-500">{portfolioMetrics.maxDrawdown}%</p>
            <p className="text-xs text-neutral-400">Peak-to-trough loss</p>
          </div>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={analyticsView} onValueChange={setAnalyticsView} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-neutral-900 border-neutral-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Performance
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="allocation" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Allocation
          </TabsTrigger>
          <TabsTrigger value="sectors" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Sectors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card className="bg-neutral-900 border-neutral-800 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Portfolio Performance vs Benchmark</h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500/20 text-blue-400">Portfolio</Badge>
                  <Badge className="bg-green-500/20 text-green-400">{selectedBenchmark}</Badge>
                </div>
              </div>
              <TradingViewPerformanceWidget />
            </Card>

            {/* Performance Summary */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
              <div className="space-y-4">
                {performanceHistory.slice(0, 6).map((period, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">{period.period}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{period.return > 0 ? '+' : '}{period.return}%</p>
                        <p className="text-xs text-neutral-400">Portfolio</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-300">{period.benchmark > 0 ? '+' : '}{period.benchmark}%</p>
                        <p className="text-xs text-neutral-400">Benchmark</p>
                      </div>
                      <div className="text-right">
                        <p className={'text-sm font-medium ${period.alpha >= 0 ? 'text-green-500' : 'text-red-500'
              }'}>'
                          {period.alpha > 0 ? '+' : '}{period.alpha}%
                        </p>
                        <p className="text-xs text-neutral-400">Alpha</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Risk Metrics Summary */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-400">Volatility (Annualized)</span>
                  <span className="text-sm font-medium text-orange-500">{portfolioMetrics.volatility}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-400">Sortino Ratio</span>
                  <span className="text-sm font-medium text-white">{portfolioMetrics.sortinoRatio}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-400">Information Ratio</span>
                  <span className="text-sm font-medium text-white">{portfolioMetrics.informationRatio}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-400">Tracking Error</span>
                  <span className="text-sm font-medium text-yellow-500">{portfolioMetrics.trackingError}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-400">Win Rate</span>
                  <span className="text-sm font-medium text-green-500">{portfolioMetrics.winRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-400">Profit Factor</span>
                  <span className="text-sm font-medium text-white">{portfolioMetrics.profitFactor}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Detailed Performance Chart */}
            <Card className="bg-neutral-900 border-neutral-800 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Cumulative Returns</h3>
                <Select value={selectedBenchmark} onValueChange={setSelectedBenchmark}>
                  <SelectTrigger className="w-32 bg-neutral-800 border-neutral-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="SPY">S&P 500</SelectItem>
                    <SelectItem value="QQQ">NASDAQ 100</SelectItem>
                    <SelectItem value="VTI">Total Market</SelectItem>
                    <SelectItem value="EFA">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-[400px] bg-neutral-800 rounded-lg flex items-center justify-center">
                <p className="text-neutral-400">Advanced Performance Chart (TradingView Integration)</p>
              </div>
            </Card>

            {/* Performance Attribution */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Return Attribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-400">Asset Allocation Effect</span>
                    <span className="text-sm font-medium text-green-500">+2.1%</span>
                  </div>
                  <Progress value={70} className="h-1.5 bg-neutral-800" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-400">Security Selection Effect</span>
                    <span className="text-sm font-medium text-green-500">+1.8%</span>
                  </div>
                  <Progress value={60} className="h-1.5 bg-neutral-800" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-400">Interaction Effect</span>
                    <span className="text-sm font-medium text-red-500">-0.3%</span>
                  </div>
                  <Progress value={10} className="h-1.5 bg-neutral-800" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-400">Currency Effect</span>
                    <span className="text-sm font-medium text-yellow-500">+0.1%</span>
                  </div>
                  <Progress value={5} className="h-1.5 bg-neutral-800" />
                </div>
              </div>
            </Card>

            {/* Rolling Performance */}
            <Card className="bg-neutral-900 border-neutral-800 p-6 lg:col-span-3">
              <h3 className="text-lg font-semibold text-white mb-4">Rolling Performance Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-neutral-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-neutral-400 mb-2">Best 12-Month Return</h4>
                  <p className="text-lg font-bold text-green-500">+28.7%</p>
                  <p className="text-xs text-neutral-400">Mar 2023 - Mar 2024</p>
                </div>
                <div className="bg-neutral-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-neutral-400 mb-2">Worst 12-Month Return</h4>
                  <p className="text-lg font-bold text-red-500">-8.4%</p>
                  <p className="text-xs text-neutral-400">Jun 2022 - Jun 2023</p>
                </div>
                <div className="bg-neutral-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-neutral-400 mb-2">Average 12-Month Return</h4>
                  <p className="text-lg font-bold text-white">+12.4%</p>
                  <p className="text-xs text-neutral-400">Since inception</p>
                </div>
                <div className="bg-neutral-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-neutral-400 mb-2">Positive 12-Month Periods</h4>
                  <p className="text-lg font-bold text-green-500">78%</p>
                  <p className="text-xs text-neutral-400">14 of 18 periods</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Breakdown */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Risk Decomposition</h3>
                <Shield className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-400">Total Portfolio Risk</span>
                    <span className="text-sm font-medium text-orange-500">{riskBreakdown.portfolioRisk}%</span>
                  </div>
                  <Progress value={75} className="h-2 bg-neutral-800" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-400">Market Risk</span>
                    <span className="text-sm font-medium text-yellow-500">{riskBreakdown.marketRisk}%</span>
                  </div>
                  <Progress value={52} className="h-2 bg-neutral-800" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-400">Specific Risk</span>
                    <span className="text-sm font-medium text-blue-500">{riskBreakdown.specificRisk}%</span>
                  </div>
                  <Progress value={23} className="h-2 bg-neutral-800" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-400">Concentration Risk</span>
                    <span className="text-sm font-medium text-orange-500">{riskBreakdown.concentrationRisk}%</span>
                  </div>
                  <Progress value={61} className="h-2 bg-neutral-800" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-400">Currency Risk</span>
                    <span className="text-sm font-medium text-green-500">{riskBreakdown.currencyRisk}%</span>
                  </div>
                  <Progress value={8} className="h-2 bg-neutral-800" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-400">Liquidity Risk</span>
                    <span className="text-sm font-medium text-yellow-500">{riskBreakdown.liquidityRisk}%</span>
                  </div>
                  <Progress value={33} className="h-2 bg-neutral-800" />
                </div>
              </div>
            </Card>

            {/* Risk Metrics Detail */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Advanced Risk Metrics</h3>
              <div className="space-y-4">
                {riskMetrics.map((metric, index) => (
                  <div key={index} className="p-3 bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{metric.metric}</span>
                      <Badge 
                        variant="secondary"
                        className={'text-xs ${
                          metric.status === 'good' ? 'bg-green-500/20 text-green-400' :
                          metric.status === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
              }'}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-white mb-1">{metric.value}</p>
                    <p className="text-xs text-neutral-400">{metric.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stress Testing */}
            <Card className="bg-neutral-900 border-neutral-800 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">Scenario Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-red-400 mb-2">Market Crash (-30%)</h4>
                  <p className="text-lg font-bold text-red-500">-$43,575</p>
                  <p className="text-sm text-neutral-400">Estimated portfolio impact</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">Recovery Time</span>
                      <span className="text-white">18 months</span>
                    </div>
                  </div>
                </div>
                <div className="bg-neutral-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-orange-400 mb-2">High Inflation (+5%)</h4>
                  <p className="text-lg font-bold text-orange-500">-$18,230</p>
                  <p className="text-sm text-neutral-400">Real value erosion</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">Protection Score</span>
                      <span className="text-white">6.2/10</span>
                    </div>
                  </div>
                </div>
                <div className="bg-neutral-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-400 mb-2">Bull Market (+20%)</h4>
                  <p className="text-lg font-bold text-green-500">+$29,050</p>
                  <p className="text-sm text-neutral-400">Estimated portfolio gain</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">Capture Ratio</span>
                      <span className="text-white">85%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="mt-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <div className="p-6 border-b border-neutral-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Asset Allocation Analysis</h3>
                <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
                  <Target className="w-4 h-4 mr-2" />
                  Rebalance
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {assetAllocation.map((asset, index) => (
                  <div key={index} className="p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{asset.category}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={getRiskColor(asset.risk)}>
                            {asset.risk} Risk
                          </Badge>
                          <Badge variant="secondary" className={getRecommendationColor(asset.recommendation)}>
                            {asset.recommendation}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-400">1Y Return</p>
                        <p className={'font-medium ${asset.return1Y >= 0 ? 'text-green-500' : 'text-red-500'
              }'}>'
                          {asset.return1Y > 0 ? '+' : '}{asset.return1Y}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-xs text-neutral-400">Current</p>
                        <p className="text-lg font-bold text-white">{asset.current}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-neutral-400">Target</p>
                        <p className="text-lg font-bold text-blue-400">{asset.target}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-neutral-400">Deviation</p>
                        <p className={'text-lg font-bold ${asset.deviation >= 0 ? 'text-green-500' : 'text-red-500'
              }'}>'
                          {asset.deviation > 0 ? '+' : `}{asset.deviation}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400">Current Allocation</span>
                        <span className="text-white">{asset.current}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={asset.current} className="h-2 bg-neutral-700" />
                        <div 
                          className="absolute top-0 h-2 w-1 bg-blue-500 rounded"
                          style={{ left: '${asset.target}%' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sectors" className="mt-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <div className="p-6 border-b border-neutral-800">
              <h3 className="text-lg font-semibold text-white">Sector Analysis</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {sectorAnalysis.map((sector, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{sector.sector}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={getRiskColor(sector.risk)}>
                            {sector.risk}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Portfolio</p>
                        <p className="text-sm font-medium text-white">{sector.allocation}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Benchmark</p>
                        <p className="text-sm font-medium text-neutral-300">{sector.benchmark}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Performance</p>
                        <p className={'text-sm font-medium ${sector.performance >= 0 ? 'text-green-500' : 'text-red-500'
              }'}>'
                          {sector.performance > 0 ? '+' : '}{sector.performance}%
                        </p>
                      </div>
                    </div>

                    <div className="w-24">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">vs Benchmark</span>
                        <span className={'${sector.allocation > sector.benchmark ? 'text-green-500' : 'text-red-500'
              }'}>'
                          {sector.allocation > sector.benchmark ? '+' : '}{(sector.allocation - sector.benchmark).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((sector.allocation / sector.benchmark) * 50, 100)} 
                        className="h-1.5 bg-neutral-700" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Declare TradingView global for TypeScript
declare global {
  interface Window {
    TradingView: any;
  }
}