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
  Zap,
  Shield,
  Coins,
  Wallet,
  Lock
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
 * Cryptocurrency Trading Page
 * 
 * Features:
 * - Crypto-specific TradingView charts with crypto pairs
 * - Real-time cryptocurrency market data
 * - Stablecoin integration with Stripe
 * - DeFi and staking opportunities
 * - Crypto wallet management
 * - Cross-chain trading support
 * - Yield farming and liquidity mining
 * - NFT marketplace integration
 * 
 * Integration:
 * - TradingView crypto charts and data
 * - Stripe stablecoin financial accounts
 * - Major crypto exchanges API integration
 * - Real-time price feeds for all major cryptocurrencies
 */
export default function CryptoTradingPage() {
  const [selectedPair, setSelectedPair] = useState('BTCUSD');
  const [searchQuery, setSearchQuery] = useState(');
  const [orderType, setOrderType] = useState('market');
  const [orderSide, setOrderSide] = useState('buy');

  // Real-time price data for crypto watchlist
  const cryptoSymbols = ['BTCUSD', 'ETHUSD', 'BNBUSD', 'SOLUSD', 'ADAUSD', 'DOTUSD'];
  const { prices, connected } = useTradingViewPrices(cryptoSymbols);

  // Mock crypto market data
  const topCryptos = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      pair: 'BTCUSD',
      price: 42500.00,
      change: 850.00,
      changePercent: 2.04,
      volume: 28500000000,
      marketCap: 835000000000,
      supply: 19650000,
      rank: 1
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      pair: 'ETHUSD',
      price: 2580.50,
      change: -45.25,
      changePercent: -1.72,
      volume: 15200000000,
      marketCap: 310000000000,
      supply: 120280000,
      rank: 2
    },
    {
      symbol: 'BNB',
      name: 'BNB',
      pair: 'BNBUSD',
      price: 315.80,
      change: 12.40,
      changePercent: 4.08,
      volume: 2100000000,
      marketCap: 47200000000,
      supply: 149500000,
      rank: 4
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      pair: 'SOLUSD',
      price: 98.45,
      change: 5.20,
      changePercent: 5.57,
      volume: 1800000000,
      marketCap: 44100000000,
      supply: 447800000,
      rank: 5
    }
  ];

  const stablecoins = [
    {
      symbol: 'USDC',
      name: 'USD Coin',
      price: 1.0001,
      change: 0.0001,
      changePercent: 0.01,
      volume: 5600000000,
      marketCap: 42100000000,
      apy: 4.2,
      backed: 'US Treasury'
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      price: 0.9998,
      change: -0.0002,
      changePercent: -0.02,
      volume: 45200000000,
      marketCap: 85600000000,
      apy: 3.8,
      backed: 'Mixed Assets'
    },
    {
      symbol: 'DAI',
      name: 'Dai',
      price: 1.0005,
      change: 0.0005,
      changePercent: 0.05,
      volume: 850000000,
      marketCap: 5200000000,
      apy: 5.1,
      backed: 'Crypto Collateral'
    }
  ];

  const defiPools = [
    {
      name: 'ETH/USDC LP',
      protocol: 'Uniswap V3',
      tvl: 850000000,
      apy: 12.5,
      risk: 'Medium',
      rewards: ['UNI', 'ETH']
    },
    {
      name: 'BTC/ETH LP',
      protocol: 'SushiSwap',
      tvl: 420000000,
      apy: 8.7,
      risk: 'Low',
      rewards: ['SUSHI']
    },
    {
      name: 'SOL Staking',
      protocol: 'Solana',
      tvl: 12000000000,
      apy: 7.2,
      risk: 'Very Low',
      rewards: ['SOL']
    }
  ];

  // Get real-time price for selected pair
  const selectedPairPrice = prices[selectedPair];

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M';
    return '$${value.toLocaleString()}';
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Cryptocurrency Trading</h1>
            <p className="text-neutral-400">
              Advanced crypto trading with DeFi, staking, and yield farming opportunities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Wallet className="w-4 h-4 mr-2" />
              Wallets
            </Button>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Coins className="w-4 h-4 mr-2" />
              DeFi Pools
            </Button>
            <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Buy Crypto
            </Button>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Total Crypto Market Cap</h3>
            <BarChart3 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-white">$1.72T</p>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+2.34%</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">24h Volume</h3>
            <Volume2 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-white">$98.5B</p>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+15.2%</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">BTC Dominance</h3>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-orange-500">48.5%</p>
            <div className="flex items-center text-sm">
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-500">-0.8%</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Fear & Greed Index</h3>
            <Zap className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-green-500">72</p>
            <p className="text-xs text-green-500">Greed</p>
          </div>
        </Card>
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Search and Trading */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <Card className="bg-neutral-900 border-neutral-800 p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search cryptocurrencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400"
              />
            </div>
          </Card>

          {/* Crypto Order Placement */}
          <Card className="bg-neutral-900 border-neutral-800 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Trade</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Trading Pair</label>
                <Select value={selectedPair} onValueChange={setSelectedPair}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="BTCUSD">BTC/USD</SelectItem>
                    <SelectItem value="ETHUSD">ETH/USD</SelectItem>
                    <SelectItem value="BNBUSD">BNB/USD</SelectItem>
                    <SelectItem value="SOLUSD">SOL/USD</SelectItem>
                  </SelectContent>
                </Select>
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
                <label className="text-sm text-neutral-400 mb-2 block">Amount (USD)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              <Button 
                className={'w-full ${
                  orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }'}
              >
                <Target className="w-4 h-4 mr-2" />
                {orderSide === 'buy' ? 'Buy' : 'Sell'} Crypto
              </Button>
            </div>
          </Card>

          {/* Stablecoin Integration */}
          <Card className="bg-neutral-900 border-neutral-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Stablecoin Yields</h3>
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-3">
              {stablecoins.slice(0, 2).map((coin) => (
                <div key={coin.symbol} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">{coin.symbol}</p>
                    <p className="text-xs text-neutral-400">{coin.apy}% APY</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">${coin.price.toFixed(4)}</p>
                    <Button size="sm" className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-xs">
                      Stake
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Content - Charts and Data */}
        <div className="lg:col-span-3 space-y-6">
          {/* Selected Crypto Info */}
          <Card className="bg-neutral-900 border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white">₿</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Bitcoin (BTC)</h2>
                  <p className="text-neutral-400">Rank #1 • {formatMarketCap(835000000000)} Market Cap</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">$42,500.00</p>
                <div className="flex items-center justify-end">
                  <ArrowUpRight className="w-5 h-5 text-green-500 mr-1" />
                  <span className="text-green-500">+$850.00 (+2.04%)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-neutral-400">24h High</p>
                <p className="text-white font-medium">$43,250.00</p>
              </div>
              <div>
                <p className="text-neutral-400">24h Low</p>
                <p className="text-white font-medium">$41,800.00</p>
              </div>
              <div>
                <p className="text-neutral-400">24h Volume</p>
                <p className="text-white font-medium">$28.5B</p>
              </div>
              <div>
                <p className="text-neutral-400">Circulating Supply</p>
                <p className="text-white font-medium">19.65M BTC</p>
              </div>
            </div>
          </Card>

          {/* TradingView Crypto Chart */}
          <Card className="bg-neutral-900 border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Advanced Crypto Chart</h3>
              <div className="flex items-center space-x-2">
                <Badge className="bg-orange-500/20 text-orange-400">Live</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-neutral-700 text-white hover:bg-neutral-800"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            <TradingViewWidget 
              symbol={selectedPair} 
              height={500}
              theme="dark"
              studies={['Volume@tv-basicstudies', 'RSI@tv-basicstudies', 'MACD@tv-basicstudies', 'BB@tv-basicstudies']}
              allow_symbol_change={true}
              save_image={false}
              backgroundColor="#0a0a0a"
              gridColor="#1a1a1a"
            />
          </Card>

          {/* Crypto Market Lists */}
          <Tabs defaultValue="top" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-neutral-900 border-neutral-800">
              <TabsTrigger value="top" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
                Top Cryptos
              </TabsTrigger>
              <TabsTrigger value="stable" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
                Stablecoins
              </TabsTrigger>
              <TabsTrigger value="defi" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
                DeFi Pools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="top" className="mt-4">
              <Card className="bg-neutral-900 border-neutral-800">
                <div className="p-6">
                  <div className="space-y-4">
                    {topCryptos.map((crypto) => (
                      <div
                        key={crypto.symbol}
                        className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 cursor-pointer transition-colors"
                        onClick={() => setSelectedPair(crypto.pair)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{crypto.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-white">{crypto.symbol}</p>
                              <Badge variant="secondary" className="text-xs">#{crypto.rank}</Badge>
                            </div>
                            <p className="text-sm text-neutral-400">{crypto.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="font-medium text-white">${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                          <div className="flex items-center text-sm">
                            {crypto.change >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                            )}
                            <span className={crypto.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {crypto.changePercent > 0 ? '+' : '}{crypto.changePercent}%
                            </span>
                          </div>
                        </div>

                        <div className="text-right text-sm">
                          <p className="text-neutral-400">Market Cap</p>
                          <p className="text-white font-medium">{formatMarketCap(crypto.marketCap)}</p>
                        </div>

                        <div className="text-right text-sm">
                          <p className="text-neutral-400">24h Volume</p>
                          <p className="text-white font-medium">{formatMarketCap(crypto.volume)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="stable" className="mt-4">
              <Card className="bg-neutral-900 border-neutral-800">
                <div className="p-6">
                  <div className="space-y-4">
                    {stablecoins.map((stable) => (
                      <div
                        key={stable.symbol}
                        className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{stable.symbol}</p>
                            <p className="text-sm text-neutral-400">{stable.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="font-medium text-white">${stable.price.toFixed(4)}</p>
                          <div className="flex items-center text-sm">
                            <span className={stable.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {stable.changePercent > 0 ? '+' : '}{stable.changePercent}%
                            </span>
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-green-500 font-medium">{stable.apy}% APY</p>
                          <p className="text-xs text-neutral-400">Yield</p>
                        </div>

                        <div className="text-right">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Lock className="w-3 h-3 mr-1" />
                            Stake
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="defi" className="mt-4">
              <Card className="bg-neutral-900 border-neutral-800">
                <div className="p-6">
                  <div className="space-y-4">
                    {defiPools.map((pool, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <Coins className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{pool.name}</p>
                            <p className="text-sm text-neutral-400">{pool.protocol}</p>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-purple-400 font-medium">{pool.apy}% APY</p>
                          <p className="text-xs text-neutral-400">Annual Yield</p>
                        </div>

                        <div className="text-center">
                          <p className="text-white font-medium">{formatMarketCap(pool.tvl)}</p>
                          <p className="text-xs text-neutral-400">TVL</p>
                        </div>

                        <div className="text-center">
                          <Badge 
                            variant="secondary"
                            className={'text-xs ${
                              pool.risk === 'Low' ? 'bg-green-500/20 text-green-400' :
                              pool.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
              }'}
                          >
                            {pool.risk} Risk
                          </Badge>
                        </div>

                        <div className="text-right">
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            Join Pool
                          </Button>
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

