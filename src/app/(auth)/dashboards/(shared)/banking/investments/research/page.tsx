'use client'

"use client";

import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Star,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  BookOpen,
  Lightbulb,
  Target,
  Globe,
  Calendar,
  DollarSign,
  PieChart,
  LineChart,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Award,
  Shield
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';


/**
 * Investment Research Page
 * 
 * Features:
 * - Market analysis and research tools
 * - Stock and ETF fundamental analysis
 * - Technical analysis with indicators
 * - Market news and sentiment analysis
 * - Earnings calendar and corporate events
 * - Economic indicators and data
 * - Analyst recommendations and ratings
 * - Sector and industry analysis
 * - Market screeners with custom filters
 * - Research reports and insights
 * - Educational content and market guides
 * 
 * Integration:
 * - TradingView advanced charting and technical analysis
 * - Alpha Vantage API for fundamental data
 * - Financial news APIs for market sentiment
 * - Economic calendar APIs for events
 */
export default function InvestmentResearchPage() {
  const [searchQuery, setSearchQuery] = useState(');
  const [selectedMarket, setSelectedMarket] = useState('US');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y');
  const [researchView, setResearchView] = useState('overview');

  // Mock research data - in real implementation, this would come from APIs
  const marketOverview = {
    spyPrice: 4875.32,
    spyChange: 25.84,
    spyChangePercent: 0.53,
    nasdaqPrice: 15234.89,
    nasdaqChange: -45.21,
    nasdaqChangePercent: -0.30,
    dowPrice: 38789.45,
    dowChange: 123.67,
    dowChangePercent: 0.32,
    vixPrice: 18.45,
    vixChange: -1.23,
    vixChangePercent: -6.26
  };

  const topStocks = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.25,
      change: 2.15,
      changePercent: 1.24,
      volume: 45234567,
      marketCap: 2800000000000,
      peRatio: 28.5,
      dividendYield: 0.55,
      analystRating: 'Buy',
      targetPrice: 190.00,
      sector: 'Technology'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 335.80,
      change: -1.45,
      changePercent: -0.43,
      volume: 32156789,
      marketCap: 2500000000000,
      peRatio: 32.1,
      dividendYield: 0.81,
      analystRating: 'Buy',
      targetPrice: 360.00,
      sector: 'Technology'
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 785.50,
      change: 15.20,
      changePercent: 1.97,
      volume: 55678234,
      marketCap: 1950000000000,
      peRatio: 65.8,
      dividendYield: 0.03,
      analystRating: 'Strong Buy',
      targetPrice: 850.00,
      sector: 'Technology'
    }
  ];

  const marketNews = [
    {
      id: '1',
      headline: 'Federal Reserve Signals Continued Monetary Support',
      summary: 'The Fed indicated it will maintain accommodative policies to support economic recovery, boosting investor confidence.',
      source: 'Reuters',
      timestamp: '2025-01-31T14:30:00Z',
      sentiment: 'positive',
      impact: 'high'
    },
    {
      id: '2',
      headline: 'Tech Earnings Season Shows Mixed Results',
      summary: 'Major technology companies report varied earnings, with cloud services showing continued strength.',
      source: 'Bloomberg',
      timestamp: '2025-01-31T12:15:00Z',
      sentiment: 'neutral',
      impact: 'medium'
    },
    {
      id: '3',
      headline: 'Oil Prices Rally on Supply Concerns',
      summary: 'Crude oil futures surge as geopolitical tensions raise concerns about global supply chains.',
      source: 'CNBC',
      timestamp: '2025-01-31T10:45:00Z',
      sentiment: 'neutral',
      impact: 'high'
    }
  ];

  const economicIndicators = [
    { name: 'GDP Growth (QoQ)', value: '2.8%', change: 0.1, status: 'positive' },
    { name: 'Unemployment Rate', value: '3.7%', change: -0.1, status: 'positive' },
    { name: 'Inflation (CPI)', value: '2.1%', change: -0.2, status: 'positive' },
    { name: 'Interest Rate', value: '5.25%', change: 0.0, status: 'neutral' },
    { name: 'Consumer Confidence', value: '112.8', change: 2.4, status: 'positive' },
    { name: 'Manufacturing PMI', value: '52.4', change: 0.8, status: 'positive' }
  ];

  const upcomingEarnings = [
    { 
      symbol: 'AAPL', 
      company: 'Apple Inc.', 
      date: '2025-02-01', 
      time: 'After Market Close',
      estimate: '$2.18',
      sector: 'Technology'
    },
    { 
      symbol: 'GOOGL', 
      company: 'Alphabet Inc.', 
      date: '2025-02-02', 
      time: 'After Market Close',
      estimate: '$1.65',
      sector: 'Technology'
    },
    { 
      symbol: 'TSLA', 
      company: 'Tesla Inc.', 
      date: '2025-02-03', 
      time: 'After Market Close',
      estimate: '$0.75',
      sector: 'Automotive'
    },
    { 
      symbol: 'AMZN', 
      company: 'Amazon.com Inc.', 
      date: '2025-02-04', 
      time: 'After Market Close',
      estimate: '$0.98',
      sector: 'E-commerce'
    }
  ];

  const sectorPerformance = [
    { sector: 'Technology', performance: 15.2, trend: 'up', weight: 28.5 },
    { sector: 'Healthcare', performance: 8.9, trend: 'up', weight: 15.2 },
    { sector: 'Financial Services', performance: 12.1, trend: 'up', weight: 12.8 },
    { sector: 'Consumer Discretionary', performance: 18.7, trend: 'up', weight: 11.4 },
    { sector: 'Energy', performance: 22.4, trend: 'up', weight: 8.9 },
    { sector: 'Communication Services', performance: 6.4, trend: 'down', weight: 7.8 },
    { sector: 'Industrials', performance: 14.3, trend: 'up', weight: 6.2 },
    { sector: 'Materials', performance: 19.8, trend: 'up', weight: 4.8 }
  ];

  const analystRecommendations = [
    {
      symbol: 'AAPL',
      strongBuy: 15,
      buy: 28,
      hold: 12,
      sell: 2,
      strongSell: 0,
      consensus: 'Buy',
      targetPrice: 190.00,
      priceTarget1Y: 195.00
    },
    {
      symbol: 'MSFT',
      strongBuy: 20,
      buy: 25,
      hold: 8,
      sell: 1,
      strongSell: 0,
      consensus: 'Strong Buy',
      targetPrice: 360.00,
      priceTarget1Y: 375.00
    },
    {
      symbol: 'NVDA',
      strongBuy: 22,
      buy: 18,
      hold: 6,
      sell: 2,
      strongSell: 0,
      consensus: 'Strong Buy',
      targetPrice: 850.00,
      priceTarget1Y: 900.00
    }
  ];

  // TradingView Market Overview Widget
  const TradingViewMarketWidget = () => {
    useEffect(() => {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "colorTheme": "dark",
        "dateRange": "12M",
        "showChart": true,
        "locale": "en",
        "width": "100%",
        "height": "400",
        "largeChartUrl": "",
        "isTransparent": false,
        "showSymbolLogo": true,
        "showFloatingTooltip": false,
        "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
        "plotLineColorFalling": "rgba(41, 98, 255, 1)",
        "gridLineColor": "rgba(240, 243, 250, 0)",
        "scaleFontColor": "rgba(120, 123, 134, 1)",
        "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
        "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
        "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
        "tabs": [
          {
            "title": "Indices",
            "symbols": [
              {"s": "FOREXCOM:SPXUSD", "d": "S&P 500"},
              {"s": "FOREXCOM:NSXUSD", "d": "US 100"},
              {"s": "FOREXCOM:DJI", "d": "Dow 30"},
              {"s": "INDEX:NKY", "d": "Nikkei 225"},
              {"s": "INDEX:DEU40", "d": "DAX Index"},
              {"s": "FOREXCOM:UKXGBP", "d": "UK 100"}
            ]
          },
          {
            "title": "Futures",
            "symbols": [
              {"s": "CME_MINI:ES1!", "d": "S&P 500"},
              {"s": "CME:6E1!", "d": "Euro"},
              {"s": "COMEX:GC1!", "d": "Gold"},
              {"s": "NYMEX:CL1!", "d": "WTI Crude Oil"},
              {"s": "NYMEX:NG1!", "d": "Gas"},
              {"s": "CBOT:ZC1!", "d": "Corn"}
            ]
          },
          {
            "title": "Bonds",
            "symbols": [
              {"s": "CBOT:ZB1!", "d": "T-Bond"},
              {"s": "CBOT:UB1!", "d": "Ultra T-Bond"},
              {"s": "EUREX:FGBL1!", "d": "Euro Bund"},
              {"s": "EUREX:FBTP1!", "d": "Euro BTP"},
              {"s": "EUREX:FGBM1!", "d": "Euro BOBL"}
            ]
          }
        ]
      });
      
      const widgetContainer = document.getElementById('tradingview_market_widget');
      if (widgetContainer) {
        widgetContainer.appendChild(script);
      }

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }, []);

    return (
      <div className="w-full h-[400px] bg-neutral-900 rounded-lg overflow-hidden">
        <div id="tradingview_market_widget" className="w-full h-full" />
      </div>
    );
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M';
    return '$${value.toLocaleString()}';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-500 bg-green-500/20';
      case 'negative':
        return 'text-red-500 bg-red-500/20';
      default:
        return 'text-yellow-500 bg-yellow-500/20';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-500 bg-red-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/20';
      default:
        return 'text-green-500 bg-green-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Investment Research</h1>
            <p className="text-neutral-400">
              Comprehensive market analysis, research tools, and investment insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger className="w-32 bg-neutral-800 border-neutral-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                <SelectItem value="US">US Markets</SelectItem>
                <SelectItem value="EU">European</SelectItem>
                <SelectItem value="ASIA">Asian</SelectItem>
                <SelectItem value="GLOBAL">Global</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Eye className="w-4 h-4 mr-2" />
              Watchlist
            </Button>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">S&P 500</h3>
            <BarChart3 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-white">{marketOverview.spyPrice.toLocaleString()}</p>
            <div className="flex items-center text-sm">
              {marketOverview.spyChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={marketOverview.spyChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {marketOverview.spyChange > 0 ? '+' : '}{marketOverview.spyChange} ({marketOverview.spyChangePercent > 0 ? '+' : '}{marketOverview.spyChangePercent}%)
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">NASDAQ</h3>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-white">{marketOverview.nasdaqPrice.toLocaleString()}</p>
            <div className="flex items-center text-sm">
              {marketOverview.nasdaqChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={marketOverview.nasdaqChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {marketOverview.nasdaqChange > 0 ? '+' : '}{marketOverview.nasdaqChange} ({marketOverview.nasdaqChangePercent > 0 ? '+' : '}{marketOverview.nasdaqChangePercent}%)
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Dow Jones</h3>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-white">{marketOverview.dowPrice.toLocaleString()}</p>
            <div className="flex items-center text-sm">
              {marketOverview.dowChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={marketOverview.dowChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {marketOverview.dowChange > 0 ? '+' : '}{marketOverview.dowChange} ({marketOverview.dowChangePercent > 0 ? '+' : '}{marketOverview.dowChangePercent}%)
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">VIX (Fear Index)</h3>
            <Zap className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-orange-500">{marketOverview.vixPrice}</p>
            <div className="flex items-center text-sm">
              {marketOverview.vixChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-red-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-green-500 mr-1" />
              )}
              <span className={marketOverview.vixChange >= 0 ? 'text-red-500' : 'text-green-500'}>
                {marketOverview.vixChange > 0 ? '+' : '}{marketOverview.vixChange} ({marketOverview.vixChangePercent > 0 ? '+' : '}{marketOverview.vixChangePercent}%)
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Research Tabs */}
      <Tabs value={researchView} onValueChange={setResearchView} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-neutral-900 border-neutral-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Market Overview
          </TabsTrigger>
          <TabsTrigger value="stocks" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Stock Analysis
          </TabsTrigger>
          <TabsTrigger value="sectors" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Sectors
          </TabsTrigger>
          <TabsTrigger value="news" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            News & Events
          </TabsTrigger>
          <TabsTrigger value="economics" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Economic Data
          </TabsTrigger>
          <TabsTrigger value="screener" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Screener
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Market Overview Chart */}
            <Card className="bg-neutral-900 border-neutral-800 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Market Overview</h3>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-24 bg-neutral-800 border-neutral-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="1D">1D</SelectItem>
                    <SelectItem value="1W">1W</SelectItem>
                    <SelectItem value="1M">1M</SelectItem>
                    <SelectItem value="3M">3M</SelectItem>
                    <SelectItem value="6M">6M</SelectItem>
                    <SelectItem value="1Y">1Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <TradingViewMarketWidget />
            </Card>

            {/* Market Movers */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Movers</h3>
              <div className="space-y-4">
                {topStocks.slice(0, 5).map((stock, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{stock.symbol}</p>
                      <p className="text-xs text-neutral-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">${stock.price}</p>
                      <div className="flex items-center text-xs">
                        {stock.change >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                        )}
                        <span className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {stock.changePercent > 0 ? '+' : '}{stock.changePercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stocks" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Analysis */}
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-6 border-b border-neutral-800">
                <h3 className="text-lg font-semibold text-white">Stock Analysis</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topStocks.map((stock, index) => (
                    <div key={index} className="p-4 bg-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-white">{stock.symbol}</h4>
                          <p className="text-sm text-neutral-400">{stock.name}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {stock.sector}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">${stock.price}</p>
                          <div className="flex items-center text-sm">
                            {stock.change >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                            )}
                            <span className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {stock.changePercent > 0 ? '+' : '}{stock.changePercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-neutral-400">Market Cap</p>
                          <p className="text-white font-medium">{formatMarketCap(stock.marketCap)}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400">P/E Ratio</p>
                          <p className="text-white font-medium">{stock.peRatio}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400">Dividend Yield</p>
                          <p className="text-white font-medium">{stock.dividendYield}%</p>
                        </div>
                        <div>
                          <p className="text-neutral-400">Target Price</p>
                          <p className="text-green-500 font-medium">${stock.targetPrice}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-700">
                        <Badge 
                          variant="secondary"
                          className={'text-xs ${
                            stock.analystRating === 'Strong Buy' ? 'bg-green-600/20 text-green-400' :
                            stock.analystRating === 'Buy' ? 'bg-green-500/20 text-green-400' :
                            'bg-yellow-500/20 text-yellow-400'
              }'}
                        >
                          {stock.analystRating}
                        </Badge>
                        <Button size="sm" className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                          View Analysis
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Analyst Recommendations */}
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-6 border-b border-neutral-800">
                <h3 className="text-lg font-semibold text-white">Analyst Recommendations</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {analystRecommendations.map((rec, index) => (
                    <div key={index} className="p-4 bg-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-white">{rec.symbol}</h4>
                        <Badge 
                          variant="secondary"
                          className={'${
                            rec.consensus === 'Strong Buy' ? 'bg-green-600/20 text-green-400' :
                            rec.consensus === 'Buy' ? 'bg-green-500/20 text-green-400' :
                            'bg-yellow-500/20 text-yellow-400'
              }'}
                        >
                          {rec.consensus}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-2 mb-3">
                        <div className="text-center">
                          <p className="text-xs text-neutral-400">Strong Buy</p>
                          <p className="text-sm font-medium text-green-500">{rec.strongBuy}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-neutral-400">Buy</p>
                          <p className="text-sm font-medium text-green-400">{rec.buy}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-neutral-400">Hold</p>
                          <p className="text-sm font-medium text-yellow-500">{rec.hold}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-neutral-400">Sell</p>
                          <p className="text-sm font-medium text-red-400">{rec.sell}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-neutral-400">Strong Sell</p>
                          <p className="text-sm font-medium text-red-500">{rec.strongSell}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-neutral-400">Current Target</p>
                          <p className="text-white font-medium">${rec.targetPrice}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400">12M Target</p>
                          <p className="text-green-500 font-medium">${rec.priceTarget1Y}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sectors" className="mt-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <div className="p-6 border-b border-neutral-800">
              <h3 className="text-lg font-semibold text-white">Sector Performance</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {sectorPerformance.map((sector, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <PieChart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{sector.sector}</h4>
                        <p className="text-sm text-neutral-400">Weight: {sector.weight}%</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center">
                        {sector.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        <p className={'text-lg font-bold ${sector.performance >= 0 ? 'text-green-500' : 'text-red-500'
              }'}>'
                          {sector.performance > 0 ? '+' : '}{sector.performance}%
                        </p>
                      </div>
                      <p className="text-sm text-neutral-400">1Y Performance</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market News */}
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-6 border-b border-neutral-800">
                <h3 className="text-lg font-semibold text-white">Market News</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {marketNews.map((news) => (
                    <div key={news.id} className="p-4 bg-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className={getSentimentColor(news.sentiment)}>
                          {news.sentiment}
                        </Badge>
                        <Badge variant="secondary" className={getImpactColor(news.impact)}>
                          {news.impact} impact
                        </Badge>
                      </div>
                      <h4 className="font-medium text-white mb-2">{news.headline}</h4>
                      <p className="text-sm text-neutral-400 mb-3">{news.summary}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500">{news.source}</span>
                        <div className="flex items-center text-neutral-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(news.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Earnings Calendar */}
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-6 border-b border-neutral-800">
                <h3 className="text-lg font-semibold text-white">Upcoming Earnings</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingEarnings.map((earning, index) => (
                    <div key={index} className="p-4 bg-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-white">{earning.symbol}</h4>
                          <p className="text-sm text-neutral-400">{earning.company}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {earning.sector}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-neutral-400">Date</p>
                          <p className="text-white">{earning.date}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400">Time</p>
                          <p className="text-white">{earning.time}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400">EPS Estimate</p>
                          <p className="text-green-500 font-medium">{earning.estimate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="economics" className="mt-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <div className="p-6 border-b border-neutral-800">
              <h3 className="text-lg font-semibold text-white">Economic Indicators</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {economicIndicators.map((indicator, index) => (
                  <div key={index} className="p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-neutral-400">{indicator.name}</h4>
                      {indicator.status === 'positive' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : indicator.status === 'negative' ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{indicator.value}</p>
                    <div className="flex items-center text-sm">
                      {indicator.change >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                      )}
                      <span className={indicator.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {indicator.change > 0 ? '+' : '}{indicator.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="screener" className="mt-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <div className="p-6 border-b border-neutral-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Stock Screener</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Market Cap</label>
                  <Select>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue placeholder="Any Size" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="large">Large Cap (&gt;$10B)</SelectItem>
                      <SelectItem value="mid">Mid Cap ($2B-$10B)</SelectItem>
                      <SelectItem value="small">Small Cap (&lt;$2B)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">P/E Ratio</label>
                  <Select>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue placeholder="Any P/E" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="low">Low (&lt;15)</SelectItem>
                      <SelectItem value="mid">Moderate (15-25)</SelectItem>
                      <SelectItem value="high">High (&gt;25)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Sector</label>
                  <Select>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue placeholder="All Sectors" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="health">Healthcare</SelectItem>
                      <SelectItem value="finance">Financial</SelectItem>
                      <SelectItem value="energy">Energy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Performance</label>
                  <Select>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue placeholder="1Y Return" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="positive">Positive (&gt;0%)</SelectItem>
                      <SelectItem value="strong">Strong (&gt;20%)</SelectItem>
                      <SelectItem value="outperform">Outperform (&gt;50%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-neutral-800 rounded-lg p-6 text-center">
                <Lightbulb className="w-12 h-12 text-[#1C8BFF] mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">Advanced Screener Coming Soon</h4>
                <p className="text-neutral-400 mb-4">
                  Configure custom filters to find stocks that match your investment criteria
                </p>
                <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                  <Target className="w-4 h-4 mr-2" />
                  Run Screen
                </Button>
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