"use client";

import React from 'react';
import { Card } from '@thorbis/ui';
import { Badge } from '@thorbis/ui';
import { Button } from '@thorbis/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@thorbis/ui';
import { Progress } from '@thorbis/ui';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Settings,
  Plus,
  Activity,
  Target,
  Shield,
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Zap,
  ExternalLink
} from 'lucide-react';

/**
 * Investment Dashboard - Main portfolio overview page
 * 
 * Features:
 * - Portfolio performance overview with real-time data
 * - Asset allocation breakdown with interactive charts
 * - Top holdings display with performance metrics
 * - Recent activity feed with transaction history
 * - Quick action buttons for trading and management
 * - Performance metrics and analytics
 * - Risk assessment and compliance status
 * 
 * Integration:
 * - TradingView widgets for market data and charts
 * - Alpaca Markets API for portfolio data
 * - Stripe crypto accounts for digital assets
 * - Real-time market data updates
 */
export default function InvestmentDashboard() {
  // Mock data - in real implementation, this would come from API
  const portfolioData = {
    totalValue: 145250.75,
    dayChange: 2340.50,
    dayChangePercent: 1.64,
    totalReturn: 18750.25,
    totalReturnPercent: 14.8,
    cashBalance: 12500.00,
    buyingPower: 15000.00,
  };

  const holdings = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 150,
      currentPrice: 175.25,
      totalValue: 26287.50,
      dayChange: 2.15,
      dayChangePercent: 1.24,
      allocation: 18.1,
      type: 'stock'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      quantity: 75,
      currentPrice: 335.80,
      totalValue: 25185.00,
      dayChange: -1.45,
      dayChangePercent: -0.43,
      allocation: 17.3,
      type: 'stock'
    },
    {
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF Trust',
      quantity: 50,
      currentPrice: 445.30,
      totalValue: 22265.00,
      dayChange: 3.20,
      dayChangePercent: 0.72,
      allocation: 15.3,
      type: 'etf'
    },
    {
      symbol: 'BTC-USD',
      name: 'Bitcoin',
      quantity: 0.5,
      currentPrice: 42500.00,
      totalValue: 21250.00,
      dayChange: 850.00,
      dayChangePercent: 4.17,
      allocation: 14.6,
      type: 'crypto'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      quantity: 10000,
      currentPrice: 1.00,
      totalValue: 10000.00,
      dayChange: 0.00,
      dayChangePercent: 0.00,
      allocation: 6.9,
      type: 'stablecoin'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'buy',
      symbol: 'AAPL',
      quantity: 10,
      price: 175.25,
      timestamp: '2025-01-31T14:30:00Z',
      status: 'executed'
    },
    {
      id: '2',
      type: 'sell',
      symbol: 'TSLA',
      quantity: 5,
      price: 235.80,
      timestamp: '2025-01-31T11:15:00Z',
      status: 'executed'
    },
    {
      id: '3',
      type: 'dividend',
      symbol: 'MSFT',
      amount: 125.50,
      timestamp: '2025-01-31T09:00:00Z',
      status: 'received'
    }
  ];

  const assetAllocation = [
    { category: 'Stocks', percentage: 52.7, value: 76500.00, color: 'bg-blue-500' },
    { category: 'ETFs', percentage: 21.5, value: 31200.00, color: 'bg-green-500' },
    { category: 'Crypto', percentage: 17.3, value: 25100.00, color: 'bg-orange-500' },
    { category: 'Cash', percentage: 8.5, value: 12350.00, color: 'bg-gray-500' }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Investment Portfolio</h1>
            <p className="text-neutral-400">
              Real-time portfolio overview and performance tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Eye className="w-4 h-4 mr-2" />
              Watchlist
            </Button>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Total Portfolio Value</h3>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">
              ${portfolioData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center text-sm">
              {portfolioData.dayChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={portfolioData.dayChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                ${Math.abs(portfolioData.dayChange).toLocaleString('en-US', { minimumFractionDigits: 2 })} 
                ({portfolioData.dayChangePercent > 0 ? '+' : '}{portfolioData.dayChangePercent}%)
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Total Return</h3>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-500">
              ${portfolioData.totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-neutral-400">
              +{portfolioData.totalReturnPercent}% all time
            </p>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Cash Balance</h3>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">
              ${portfolioData.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-neutral-400">Available cash</p>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Buying Power</h3>
            <Target className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-[#1C8BFF]">
              ${portfolioData.buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-neutral-400">Available to trade</p>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-neutral-900 border-neutral-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="holdings" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Holdings
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Activity
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Analysis
          </TabsTrigger>
          <TabsTrigger value="research" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Research
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Allocation */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Asset Allocation</h3>
                <PieChart className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                {assetAllocation.map((asset, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-300">{asset.category}</span>
                      <span className="text-sm font-medium text-white">{asset.percentage}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Progress 
                          value={asset.percentage} 
                          className="h-2 bg-neutral-800"
                          style={{
                            '--progress-foreground': asset.color.includes('blue') ? 'rgb(59 130 246)' : 
                                                   asset.color.includes('green') ? 'rgb(34 197 94)' :
                                                   asset.color.includes('yellow') ? 'rgb(234 179 8)' :
                                                   asset.color.includes('red') ? 'rgb(239 68 68)' :
                                                   'rgb(107 114 128)'
                          } as React.CSSProperties}
                        />
                      </div>
                      <span className="text-xs text-neutral-400">
                        ${asset.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Performance Chart Placeholder */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Portfolio Performance</h3>
                <BarChart3 className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="h-64 bg-neutral-800 rounded-lg flex items-center justify-center">
                <p className="text-neutral-400">TradingView Chart Integration</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="holdings" className="mt-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <div className="p-6 border-b border-neutral-800">
              <h3 className="text-lg font-semibold text-white">Current Holdings</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {holdings.map((holding, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{holding.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{holding.symbol}</h4>
                        <p className="text-sm text-neutral-400">{holding.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={'text-xs ${
                              holding.type === 'stock' ? 'bg-blue-500/20 text-blue-400' :
                              holding.type === 'etf' ? 'bg-green-500/20 text-green-400' :
                              holding.type === 'crypto' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-gray-500/20 text-gray-400'
                            }'}
                          >
                            {holding.type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <p className="font-medium text-white">
                        ${holding.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {holding.quantity} @ ${holding.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center justify-end text-sm">
                        {holding.dayChange >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                        )}
                        <span className={holding.dayChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {holding.dayChangePercent > 0 ? '+' : '}{holding.dayChangePercent}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-neutral-400 mb-1">{holding.allocation}%</p>
                      <div className="w-16">
                        <Progress value={holding.allocation} className="h-1.5 bg-neutral-700" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <div className="p-6 border-b border-neutral-800">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={'w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'buy' ? 'bg-green-500/20' :
                        activity.type === 'sell' ? 'bg-red-500/20' :
                        'bg-blue-500/20'
                      }'}>
                        <Activity className={'w-5 h-5 ${
                          activity.type === 'buy' ? 'text-green-500' :
                          activity.type === 'sell' ? 'text-red-500' :
                          'text-blue-500'
                        }'} />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {activity.type === 'buy' ? 'Bought' : 
                           activity.type === 'sell' ? 'Sold' : 'Dividend from'} {activity.symbol}
                        </p>
                        <p className="text-sm text-neutral-400">
                          {activity.type === 'dividend` 
                            ? `Amount: $${activity.amount}'}
                            : '${activity.quantity} shares @ $${activity.price}'}
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={activity.status === 'executed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                      <p className="text-xs text-neutral-400 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
                <Shield className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-400">Portfolio Risk Level</span>
                    <span className="text-sm font-medium text-orange-500">Moderate</span>
                  </div>
                  <Progress value={65} className="h-2 bg-neutral-800" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-400">Diversification Score</span>
                    <span className="text-sm font-medium text-green-500">Good (8.2/10)</span>
                  </div>
                  <Progress value={82} className="h-2 bg-neutral-800" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-400">Volatility (30-day)</span>
                    <span className="text-sm font-medium text-yellow-500">18.5%</span>
                  </div>
                  <Progress value={37} className="h-2 bg-neutral-800" />
                </div>
              </div>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
                <BarChart3 className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Sharpe Ratio</span>
                  <span className="text-sm font-medium text-white">1.42</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Beta (vs S&P 500)</span>
                  <span className="text-sm font-medium text-white">0.89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Max Drawdown</span>
                  <span className="text-sm font-medium text-red-500">-12.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Win Rate</span>
                  <span className="text-sm font-medium text-green-500">67.8%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="research" className="mt-6">
          <div className="space-y-6">
            {/* Stock Screener */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Stock Screener</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Filter className="w-4 h-4 mr-1" />
                    Advanced Filters
                  </Button>
                  <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                    <Search className="w-4 h-4 mr-1" />
                    Run Screen
                  </Button>
                </div>
              </div>
              
              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-neutral-800 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Market Cap</label>
                  <select className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm">
                    <option>All Sizes</option>
                    <option>Large Cap (&gt;$10B)</option>
                    <option>Mid Cap ($2B-$10B)</option>
                    <option>Small Cap ($300M-$2B)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">P/E Ratio</label>
                  <select className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm">
                    <option>Any P/E</option>
                    <option>Low (P/E &lt; 15)</option>
                    <option>Moderate (15-25)</option>
                    <option>High (P/E &gt; 25)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Sector</label>
                  <select className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm">
                    <option>All Sectors</option>
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Consumer</option>
                    <option>Energy</option>
                  </select>
                </div>
              </div>
              
              {/* Screener Results */}
              <div className="space-y-3">
                {[
                  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.42, change: 2.34, pe: 65.8, marketCap: '2.1T', sector: 'Technology' },
                  { symbol: 'META', name: 'Meta Platforms Inc', price: 484.20, change: -1.85, pe: 24.7, marketCap: '1.2T', sector: 'Technology' },
                  { symbol: 'TSLA', name: 'Tesla Inc', price: 248.50, change: 0.95, pe: 58.2, marketCap: '790B', sector: 'Automotive' },
                  { symbol: 'GOOGL', name: 'Alphabet Inc', price: 162.75, change: 1.24, pe: 26.4, marketCap: '2.0T', sector: 'Technology' },
                  { symbol: 'AMZN', name: 'Amazon.com Inc', price: 183.25, change: -0.67, pe: 48.1, marketCap: '1.9T', sector: 'Consumer' }
                ].map((stock, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{stock.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{stock.symbol}</h4>
                        <p className="text-sm text-neutral-400">{stock.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-right">
                        <p className="font-medium text-white">${stock.price}</p>
                        <p className={stock.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {stock.change >= 0 ? '+' : '}{stock.change}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-neutral-300">P/E: {stock.pe}</p>
                        <p className="text-neutral-400">{stock.marketCap}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          {stock.sector}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Market News & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-neutral-900 border-neutral-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Market News</h3>
                  <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {[
                    { title: 'Tech Stocks Rally on AI Breakthrough', source: 'MarketWatch', time: '2h ago', sentiment: 'positive' },
                    { title: 'Fed Signals Potential Rate Cut in March', source: 'Reuters', time: '4h ago', sentiment: 'neutral' },
                    { title: 'Oil Prices Surge Amid Supply Concerns', source: 'Bloomberg', time: '6h ago', sentiment: 'negative' },
                    { title: 'Biotech Sector Shows Strong Q4 Earnings', source: 'CNBC', time: '8h ago', sentiment: 'positive' }
                  ].map((news, index) => (
                    <div key={index} className="p-3 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white text-sm leading-tight">{news.title}</h4>
                        <div className={'w-2 h-2 rounded-full ${
                          news.sentiment === 'positive' ? 'bg-green-500' :
                          news.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                        }'} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <span>{news.source}</span>
                        <span>{news.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-neutral-900 border-neutral-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">AI Market Insights</h3>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    <Zap className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
                      <span className="font-medium text-green-400">Bullish Signal</span>
                    </div>
                    <p className="text-sm text-neutral-300 mb-2">
                      Technology sector showing strong momentum with 73% of signals positive
                    </p>
                    <div className="flex items-center text-xs text-neutral-400">
                      <span>Confidence: 87%</span>
                      <span className="mx-2">•</span>
                      <span>Updated 15 mins ago</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg border border-orange-500/20">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400 mr-2" />
                      <span className="font-medium text-orange-400">Caution</span>
                    </div>
                    <p className="text-sm text-neutral-300 mb-2">
                      Energy sector volatility detected due to geopolitical factors
                    </p>
                    <div className="flex items-center text-xs text-neutral-400">
                      <span>Risk Level: Medium</span>
                      <span className="mx-2">•</span>
                      <span>Monitor closely</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20">
                    <div className="flex items-center mb-2">
                      <Target className="w-4 h-4 text-purple-400 mr-2" />
                      <span className="font-medium text-purple-400">Opportunity</span>
                    </div>
                    <p className="text-sm text-neutral-300 mb-2">
                      Healthcare REITs showing unusual value patterns
                    </p>
                    <div className="flex items-center text-xs text-neutral-400">
                      <span>Value Score: 8.4/10</span>
                      <span className="mx-2">•</span>
                      <span>Research recommended</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Technical Analysis */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Technical Analysis</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="h-64 bg-neutral-800 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-neutral-500 mx-auto mb-2" />
                      <p className="text-neutral-400">TradingView Chart Widget</p>
                      <p className="text-xs text-neutral-500">Advanced charting with indicators</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-neutral-800 rounded-lg">
                      <p className="text-xs text-neutral-400">RSI (14)</p>
                      <p className="font-bold text-orange-400">67.3</p>
                      <p className="text-xs text-orange-400">Overbought</p>
                    </div>
                    <div className="text-center p-3 bg-neutral-800 rounded-lg">
                      <p className="text-xs text-neutral-400">MACD</p>
                      <p className="font-bold text-green-400">+2.41</p>
                      <p className="text-xs text-green-400">Bullish</p>
                    </div>
                    <div className="text-center p-3 bg-neutral-800 rounded-lg">
                      <p className="text-xs text-neutral-400">Stoch %K</p>
                      <p className="font-bold text-blue-400">74.8</p>
                      <p className="text-xs text-blue-400">Neutral</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-white mb-3">Support & Resistance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-neutral-800 rounded">
                        <span className="text-sm text-red-400">Resistance 2</span>
                        <span className="text-sm font-medium text-white">$185.50</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-neutral-800 rounded">
                        <span className="text-sm text-red-400">Resistance 1</span>
                        <span className="text-sm font-medium text-white">$178.25</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-900/30 rounded border border-blue-500/30">
                        <span className="text-sm text-blue-400">Current</span>
                        <span className="text-sm font-bold text-white">$175.42</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-neutral-800 rounded">
                        <span className="text-sm text-green-400">Support 1</span>
                        <span className="text-sm font-medium text-white">$168.90</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-neutral-800 rounded">
                        <span className="text-sm text-green-400">Support 2</span>
                        <span className="text-sm font-medium text-white">$162.15</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-white mb-3">Signal Summary</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">Moving Averages</span>
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                          Strong Buy
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">Technical Indicators</span>
                        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                          Sell
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">Overall Signal</span>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                          Neutral
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}