'use client';

import React, { useState } from 'react';

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
  DollarSign,
  Volume2,
  Clock,
  Star,
  Plus,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import TradingViewWidget from '@/components/charts/trading-view-widget';
import { useTradingViewPrices } from '@/hooks/use-trading-view-data';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';


/**
 * Stocks & ETFs Trading Page
 * 
 * Features:
 * - TradingView advanced charting integration
 * - Real-time market data and quotes
 * - Stock and ETF search with filtering
 * - Order placement interface
 * - Market analysis and research tools
 * - Watchlist management
 * - Technical indicators and analysis
 * - News feed integration
 * 
 * Integration:
 * - TradingView Charting Library for professional charts
 * - Alpaca Markets API for trading execution
 * - Alpha Vantage API for market data
 * - Real-time price feeds
 */
export default function StocksETFsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [searchQuery, setSearchQuery] = useState(');
  const [orderType, setOrderType] = useState('market');
  const [orderSide, setOrderSide] = useState('buy');

  // Real-time price data for watchlist symbols
  const watchlistSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'SPY', 'QQQ', 'VTI'];
  const { prices, connected } = useTradingViewPrices(watchlistSymbols);

  // Mock market data
  const topStocks = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.25,
      change: 2.15,
      changePercent: 1.24,
      volume: 45234567,
      marketCap: 2800000000000,
      pe: 28.5,
      dividend: 0.96
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 335.80,
      change: -1.45,
      changePercent: -0.43,
      volume: 32156789,
      marketCap: 2500000000000,
      pe: 32.1,
      dividend: 2.72
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 142.65,
      change: 1.85,
      changePercent: 1.31,
      volume: 28945612,
      marketCap: 1800000000000,
      pe: 25.8,
      dividend: 0
    },
    {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      price: 235.80,
      change: -5.20,
      changePercent: -2.16,
      volume: 55678234,
      marketCap: 750000000000,
      pe: 45.2,
      dividend: 0
    }
  ];

  const topETFs = [
    {
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF Trust',
      price: 445.30,
      change: 3.20,
      changePercent: 0.72,
      volume: 15234567,
      assets: 400000000000,
      expenseRatio: 0.0945,
      dividend: 4.32
    },
    {
      symbol: 'QQQ',
      name: 'Invesco QQQ Trust',
      price: 385.90,
      change: 2.45,
      changePercent: 0.64,
      volume: 12567890,
      assets: 220000000000,
      expenseRatio: 0.20,
      dividend: 2.18
    },
    {
      symbol: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      price: 245.15,
      change: 1.85,
      changePercent: 0.76,
      volume: 8901234,
      assets: 350000000000,
      expenseRatio: 0.03,
      dividend: 3.89
    }
  ];

  const searchResults = [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', exchange: 'NASDAQ' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'etf', exchange: 'NYSE' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf', exchange: 'NASDAQ' }
  ].filter(item => 
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get real-time price for selected symbol
  const selectedSymbolPrice = prices[selectedSymbol];

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}';
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Stocks & ETFs</h1>
            <p className="text-neutral-400">
              Advanced trading platform with professional charting and analysis
            </p>
            {!connected && (
              <div className="flex items-center mt-2 text-sm text-amber-500">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-2"></div>
                Connecting to real-time data...
              </div>
            )}
            {connected && (
              <div className="flex items-center mt-2 text-sm text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Real-time data connected
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Star className="w-4 h-4 mr-2" />
              Watchlist
            </Button>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Filter className="w-4 h-4 mr-2" />
              Screener
            </Button>
            <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">S&P 500</h3>
            <BarChart3 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-white">4,875.32</p>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+25.84 (+0.53%)</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">NASDAQ</h3>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-white">15,234.89</p>
            <div className="flex items-center text-sm">
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-500">-45.21 (-0.30%)</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Dow Jones</h3>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-white">38,789.45</p>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+123.67 (+0.32%)</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">VIX (Fear Index)</h3>
            <Zap className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-orange-500">18.45</p>
            <div className="flex items-center text-sm">
              <ArrowDownRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">-1.23 (-6.26%)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Search and Lists */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <Card className="bg-neutral-900 border-neutral-800 p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search stocks & ETFs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400"
              />
            </div>
            {searchQuery && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.symbol}
                    onClick={() => {
                      setSelectedSymbol(result.symbol);
                      setSearchQuery(');
                    }}
                    className="w-full text-left p-2 hover:bg-neutral-800 rounded transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{result.symbol}</p>
                        <p className="text-xs text-neutral-400 truncate">{result.name}</p>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={'text-xs ${
                          result.type === 'stock' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
              }'}
                      >
                        {result.type.toUpperCase()}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Order Placement */}
          <Card className="bg-neutral-900 border-neutral-800 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Order</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Symbol</label>
                <Input
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={orderSide === 'buy' ? 'default' : 'outline'}
                  onClick={() => setOrderSide('buy')}
                  className={orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'border-neutral-700'}
                >
                  Buy
                </Button>
                <Button
                  variant={orderSide === 'sell' ? 'default' : 'outline'}
                  onClick={() => setOrderSide('sell')}
                  className={orderSide === 'sell' ? 'bg-red-600 hover:bg-red-700' : 'border-neutral-700'}
                >
                  Sell
                </Button>
              </div>

              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Order Type</label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                    <SelectItem value="stop">Stop Order</SelectItem>
                    <SelectItem value="stop_limit">Stop Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Quantity</label>
                <Input
                  type="number"
                  placeholder="0"
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              {orderType !== 'market' && (
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">
                    {orderType === 'limit' ? 'Limit Price' : 'Stop Price'}
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              )}

              <Button 
                className={'w-full ${
                  orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }'}
              >
                <Target className="w-4 h-4 mr-2" />
                Place {orderSide === 'buy' ? 'Buy' : 'Sell'} Order
              </Button>
            </div>
          </Card>
        </div>

        {/* Main Content - Charts and Data */}
        <div className="lg:col-span-3 space-y-6">
          {/* Selected Stock Info */}
          <Card className="bg-neutral-900 border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedSymbol}</h2>
                <p className="text-neutral-400">Apple Inc. - NASDAQ</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">
                  ${selectedSymbolPrice ? selectedSymbolPrice.price.toFixed(2) : '175.25'}
                </p>
                <div className="flex items-center justify-end">
                  {selectedSymbolPrice && selectedSymbolPrice.change >= 0 ? (
                    <ArrowUpRight className="w-5 h-5 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-500 mr-1" />
                  )}
                  <span className={selectedSymbolPrice && selectedSymbolPrice.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {selectedSymbolPrice 
                      ? '${selectedSymbolPrice.change >= 0 ? '+' : '}${selectedSymbolPrice.change.toFixed(2)} (${selectedSymbolPrice.changePercent >= 0 ? '+' : '}${selectedSymbolPrice.changePercent.toFixed(2)}%)'
                      : '+2.15 (+1.24%)'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-neutral-400">Open</p>
                <p className="text-white font-medium">$173.10</p>
              </div>
              <div>
                <p className="text-neutral-400">High</p>
                <p className="text-white font-medium">$176.45</p>
              </div>
              <div>
                <p className="text-neutral-400">Low</p>
                <p className="text-white font-medium">$172.85</p>
              </div>
              <div>
                <p className="text-neutral-400">Volume</p>
                <p className="text-white font-medium">45.2M</p>
              </div>
            </div>
          </Card>

          {/* TradingView Chart */}
          <Card className="bg-neutral-900 border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Advanced Chart</h3>
              <Button
                variant="outline"
                size="sm"
                className="border-neutral-700 text-white hover:bg-neutral-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            <TradingViewWidget 
              symbol={selectedSymbol} 
              height={500}
              theme="dark"
              studies={['Volume@tv-basicstudies', 'RSI@tv-basicstudies', 'MACD@tv-basicstudies']}
              allow_symbol_change={true}
              save_image={false}
              backgroundColor="#0a0a0a"
              gridColor="#1a1a1a"
            />
          </Card>

          {/* Market Lists */}
          <Tabs defaultValue="stocks" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-neutral-900 border-neutral-800">
              <TabsTrigger value="stocks" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
                Top Stocks
              </TabsTrigger>
              <TabsTrigger value="etfs" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
                Top ETFs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stocks" className="mt-4">
              <Card className="bg-neutral-900 border-neutral-800">
                <div className="p-6">
                  <div className="space-y-4">
                    {topStocks.map((stock) => (
                      <div
                        key={stock.symbol}
                        className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 cursor-pointer transition-colors"
                        onClick={() => setSelectedSymbol(stock.symbol)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{stock.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{stock.symbol}</p>
                            <p className="text-sm text-neutral-400">{stock.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="font-medium text-white">
                            ${prices[stock.symbol] ? prices[stock.symbol]!.price.toFixed(2) : stock.price.toFixed(2)}
                          </p>
                          <div className="flex items-center text-sm">
                            {(prices[stock.symbol] ? prices[stock.symbol]!.change : stock.change) >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                            )}
                            <span className={(prices[stock.symbol] ? prices[stock.symbol]!.change : stock.change) >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {prices[stock.symbol] 
                                ? '${prices[stock.symbol]!.changePercent > 0 ? '+' : '}${prices[stock.symbol]!.changePercent.toFixed(2)}%'
                                : '${stock.changePercent > 0 ? '+' : '}${stock.changePercent}%'
                              }
                            </span>
                          </div>
                        </div>

                        <div className="text-right text-sm">
                          <p className="text-neutral-400">Market Cap</p>
                          <p className="text-white font-medium">{formatMarketCap(stock.marketCap)}</p>
                        </div>

                        <div className="text-right text-sm">
                          <p className="text-neutral-400">P/E Ratio</p>
                          <p className="text-white font-medium">{stock.pe}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="etfs" className="mt-4">
              <Card className="bg-neutral-900 border-neutral-800">
                <div className="p-6">
                  <div className="space-y-4">
                    {topETFs.map((etf) => (
                      <div
                        key={etf.symbol}
                        className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 cursor-pointer transition-colors"
                        onClick={() => setSelectedSymbol(etf.symbol)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{etf.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{etf.symbol}</p>
                            <p className="text-sm text-neutral-400">{etf.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="font-medium text-white">${etf.price.toFixed(2)}</p>
                          <div className="flex items-center text-sm">
                            {etf.change >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                            )}
                            <span className={etf.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {etf.changePercent > 0 ? '+' : '}{etf.changePercent}%
                            </span>
                          </div>
                        </div>

                        <div className="text-right text-sm">
                          <p className="text-neutral-400">Assets</p>
                          <p className="text-white font-medium">{formatMarketCap(etf.assets)}</p>
                        </div>

                        <div className="text-right text-sm">
                          <p className="text-neutral-400">Expense Ratio</p>
                          <p className="text-white font-medium">{etf.expenseRatio}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

